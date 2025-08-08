-- Enable RLS on notifications and add policies
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'Users can view their own notifications'
  ) THEN
    CREATE POLICY "Users can view their own notifications"
    ON public.notifications
    FOR SELECT
    USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'Users can update their own notifications'
  ) THEN
    CREATE POLICY "Users can update their own notifications"
    ON public.notifications
    FOR UPDATE
    USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'Users can delete their own notifications'
  ) THEN
    CREATE POLICY "Users can delete their own notifications"
    ON public.notifications
    FOR DELETE
    USING (user_id = auth.uid());
  END IF;
END $$;

-- Create notification settings table
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, type)
);

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notification_settings' AND policyname = 'Users can view their own notification settings'
  ) THEN
    CREATE POLICY "Users can view their own notification settings"
    ON public.notification_settings
    FOR SELECT
    USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notification_settings' AND policyname = 'Users can upsert their own notification settings'
  ) THEN
    CREATE POLICY "Users can upsert their own notification settings"
    ON public.notification_settings
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Reuse existing timestamp trigger function, create trigger for settings
DROP TRIGGER IF EXISTS set_notification_settings_updated_at ON public.notification_settings;
CREATE TRIGGER set_notification_settings_updated_at
BEFORE UPDATE ON public.notification_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Helper: check if a user has a notification type enabled (default true)
CREATE OR REPLACE FUNCTION public.is_notification_enabled(_user_id uuid, _type text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_enabled BOOLEAN;
BEGIN
  SELECT ns.enabled INTO v_enabled
  FROM public.notification_settings ns
  WHERE ns.user_id = _user_id AND ns.type = _type;

  IF v_enabled IS NULL THEN
    RETURN TRUE; -- default to enabled when not configured
  END IF;
  RETURN v_enabled;
END;
$$;

-- Helper: notify all users for a creche respecting per-user settings
CREATE OR REPLACE FUNCTION public.notify_creche_users(_creche_id uuid, _title text, _message text, _type text, _sender uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT uc.user_id
    FROM public.user_creche uc
    WHERE uc.creche_id = _creche_id
  ) LOOP
    IF public.is_notification_enabled(r.user_id, _type) THEN
      INSERT INTO public.notifications (user_id, sender_id, title, message)
      VALUES (r.user_id, _sender, _title, _message);
    END IF;
  END LOOP;
END;
$$;

-- Trigger: when a new application is created, notify creche users
CREATE OR REPLACE FUNCTION public.trigger_notify_on_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.creche_id IS NOT NULL THEN
    PERFORM public.notify_creche_users(
      NEW.creche_id,
      'New Application',
      'A new application was submitted by ' || NEW.parent_name,
      'application_new',
      NEW.user_id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_on_application ON public.applications;
CREATE TRIGGER notify_on_application
AFTER INSERT ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.trigger_notify_on_application();

-- Trigger: when an invoice becomes paid, notify creche users
CREATE OR REPLACE FUNCTION public.trigger_notify_on_invoice_paid()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS DISTINCT FROM NEW.status) AND NEW.creche_id IS NOT NULL THEN
    PERFORM public.notify_creche_users(
      NEW.creche_id,
      'Payment Received',
      coalesce(NEW.title, 'Invoice') || ' has been marked as paid.',
      'payment_received',
      NEW.prepared_by
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_on_invoice_paid ON public.invoices;
CREATE TRIGGER notify_on_invoice_paid
AFTER UPDATE OF status ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.trigger_notify_on_invoice_paid();
