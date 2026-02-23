-- Create user_invitations table to track pending invitations
CREATE TABLE public.user_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role app_role NOT NULL DEFAULT 'editor',
  invited_by uuid NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT unique_pending_email UNIQUE (email) DEFERRABLE INITIALLY DEFERRED
);

-- Create index for fast token lookup
CREATE INDEX idx_user_invitations_token ON public.user_invitations(token);
CREATE INDEX idx_user_invitations_email ON public.user_invitations(email);

-- Enable Row Level Security
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Admins can manage all invitations
CREATE POLICY "Admins can manage invitations"
ON public.user_invitations
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Update handle_new_user() to check for pending invitations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
  new_role app_role;
  invitation_record RECORD;
BEGIN
  -- Check if there's a pending invitation for this email
  SELECT id, role INTO invitation_record
  FROM public.user_invitations
  WHERE email = NEW.email
    AND accepted_at IS NULL
    AND expires_at > now()
  LIMIT 1;

  IF invitation_record.id IS NOT NULL THEN
    -- Use the role from the invitation
    new_role := invitation_record.role;
    
    -- Mark invitation as accepted
    UPDATE public.user_invitations
    SET accepted_at = now()
    WHERE id = invitation_record.id;
  ELSE
    -- Count existing users to determine if this is the first user
    SELECT COUNT(*) INTO user_count FROM public.user_roles;
    
    -- First user becomes admin, others become editors
    IF user_count = 0 THEN
      new_role := 'admin';
    ELSE
      new_role := 'editor';
    END IF;
  END IF;
  
  -- Create profile
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  
  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, new_role);
  
  RETURN NEW;
END;
$$;