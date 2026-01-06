-- Create table for customizable application lifecycle stages per creche
CREATE TABLE public.application_lifecycle_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creche_id UUID NOT NULL REFERENCES public.creches(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (creche_id, stage_name)
);

-- Enable Row Level Security
ALTER TABLE public.application_lifecycle_stages ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their creche's stages
CREATE POLICY "Users can view their creche's lifecycle stages"
ON public.application_lifecycle_stages
FOR SELECT
TO authenticated
USING (
  creche_id IN (
    SELECT creche_id FROM public.user_creche WHERE user_id = auth.uid()
  )
);

-- Create policy for users to manage their creche's stages
CREATE POLICY "Users can manage their creche's lifecycle stages"
ON public.application_lifecycle_stages
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
CREATE TRIGGER update_application_lifecycle_stages_updated_at
BEFORE UPDATE ON public.application_lifecycle_stages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default lifecycle stages for all existing creches
INSERT INTO public.application_lifecycle_stages (creche_id, stage_name, display_order, is_active)
SELECT
  c.id,
  stage_name,
  display_order,
  true
FROM public.creches c
CROSS JOIN (VALUES
  ('New', 1),
  ('Contacted', 2),
  ('Documents Pending', 3),
  ('Interview Scheduled', 4),
  ('Offer Made', 5),
  ('Accepted', 6),
  ('Rejected', 7)
) AS defaults(stage_name, display_order);