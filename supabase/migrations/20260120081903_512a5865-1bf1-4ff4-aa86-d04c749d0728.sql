-- Add capacity and age range to creche_classes
ALTER TABLE public.creche_classes
ADD COLUMN IF NOT EXISTS capacity integer DEFAULT 20,
ADD COLUMN IF NOT EXISTS min_age_months integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_age_months integer DEFAULT 72;

-- Add class_id to applications table
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS class_id uuid REFERENCES public.creche_classes(id);

-- Add class_id to students table  
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS class_id uuid REFERENCES public.creche_classes(id);

-- Create waiting list table
CREATE TABLE IF NOT EXISTS public.application_waiting_list (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.creche_classes(id) ON DELETE CASCADE,
  creche_id uuid NOT NULL REFERENCES public.creches(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 1,
  notes text,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'offered', 'accepted', 'declined', 'expired')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(application_id, class_id)
);

-- Enable RLS on waiting list
ALTER TABLE public.application_waiting_list ENABLE ROW LEVEL SECURITY;

-- RLS policies for waiting list
CREATE POLICY "Users can view their creche's waiting list"
ON public.application_waiting_list
FOR SELECT
USING (creche_id IN (
  SELECT creche_id FROM user_creche WHERE user_id = auth.uid()
));

CREATE POLICY "Users can manage their creche's waiting list"
ON public.application_waiting_list
FOR ALL
USING (creche_id IN (
  SELECT creche_id FROM user_creche WHERE user_id = auth.uid()
))
WITH CHECK (creche_id IN (
  SELECT creche_id FROM user_creche WHERE user_id = auth.uid()
));

-- Create function to get class enrollment count
CREATE OR REPLACE FUNCTION public.get_class_enrollment_count(p_class_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer 
    FROM public.students 
    WHERE class_id = p_class_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get class waiting list count
CREATE OR REPLACE FUNCTION public.get_class_waiting_count(p_class_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer 
    FROM public.application_waiting_list 
    WHERE class_id = p_class_id AND status = 'waiting'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;