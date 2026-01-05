-- Create table for customizable application form fields per creche
CREATE TABLE public.application_form_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creche_id UUID NOT NULL REFERENCES public.creches(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text', -- text, email, phone, date, select, textarea, checkbox
  field_options JSONB, -- For select fields, store options here
  is_required BOOLEAN NOT NULL DEFAULT false,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  section TEXT NOT NULL DEFAULT 'parent', -- parent, child, additional
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (creche_id, field_name)
);

-- Enable Row Level Security
ALTER TABLE public.application_form_config ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their creche's config
CREATE POLICY "Users can view their creche's application config"
ON public.application_form_config
FOR SELECT
TO authenticated
USING (
  creche_id IN (
    SELECT creche_id FROM public.user_creche WHERE user_id = auth.uid()
  )
);

-- Create policy for users to manage their creche's config
CREATE POLICY "Users can manage their creche's application config"
ON public.application_form_config
FOR ALL
TO authenticated
USING (
  creche_id IN (
    SELECT creche_id FROM public.user_creche WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  creche_id IN (
    SELECT creche_id FROM public.user_creche WHERE user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_application_form_config_updated_at
BEFORE UPDATE ON public.application_form_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default fields for all existing creches
INSERT INTO public.application_form_config (creche_id, field_name, field_label, field_type, is_required, is_enabled, display_order, section)
SELECT 
  c.id,
  field_name,
  field_label,
  field_type,
  is_required,
  true,
  display_order,
  section
FROM public.creches c
CROSS JOIN (VALUES
  ('parent_name', 'Parent Name', 'text', true, 1, 'parent'),
  ('parent_email', 'Email Address', 'email', true, 2, 'parent'),
  ('parent_phone_number', 'Phone Number', 'phone', true, 3, 'parent'),
  ('parent_whatsapp', 'WhatsApp Number', 'phone', false, 4, 'parent'),
  ('parent_address', 'Address', 'textarea', false, 5, 'parent'),
  ('child_first_name', 'Child First Name', 'text', true, 1, 'child'),
  ('child_last_name', 'Child Last Name', 'text', true, 2, 'child'),
  ('child_date_of_birth', 'Date of Birth', 'date', true, 3, 'child'),
  ('child_gender', 'Gender', 'select', false, 4, 'child'),
  ('message', 'Additional Message', 'textarea', false, 1, 'additional')
) AS defaults(field_name, field_label, field_type, is_required, display_order, section);