-- Migration: create_missing_email_configurations_table
-- Created at: 1755212710

-- Create missing email_configurations table that the frontend expects
CREATE TABLE IF NOT EXISTS public.email_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    email_provider VARCHAR(100) DEFAULT 'smtp',
    smtp_host VARCHAR(255),
    smtp_port INTEGER DEFAULT 587,
    smtp_username VARCHAR(255),
    smtp_password VARCHAR(255),
    smtp_secure BOOLEAN DEFAULT true,
    from_email VARCHAR(255) NOT NULL,
    from_name VARCHAR(255) DEFAULT 'ClaimGuru',
    reply_to_email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_email_configurations_organization FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE
);

-- Enable RLS on email_configurations
ALTER TABLE public.email_configurations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email_configurations
CREATE POLICY "email_configurations_select_policy" ON public.email_configurations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.organization_id = email_configurations.organization_id
        )
    );

CREATE POLICY "email_configurations_insert_policy" ON public.email_configurations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.organization_id = email_configurations.organization_id
            AND user_profiles.role IN ('admin', 'manager')
        )
    );

CREATE POLICY "email_configurations_update_policy" ON public.email_configurations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.organization_id = email_configurations.organization_id
            AND user_profiles.role IN ('admin', 'manager')
        )
    );

CREATE POLICY "email_configurations_delete_policy" ON public.email_configurations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.organization_id = email_configurations.organization_id
            AND user_profiles.role IN ('admin', 'manager')
        )
    );;