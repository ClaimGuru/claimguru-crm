-- Migration: create_scheduling_calendar_tables
-- Created at: 1752103157

-- Create comprehensive scheduling and calendar system tables

-- Events and appointments table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES user_profiles(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) DEFAULT 'appointment', -- appointment, deadline, inspection, meeting, court_date
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  location TEXT,
  virtual_meeting_url TEXT,
  
  -- Related entities
  claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  
  -- Recurrence settings
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_type VARCHAR(20), -- daily, weekly, monthly, yearly
  recurrence_interval INTEGER DEFAULT 1,
  recurrence_end_date DATE,
  parent_event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  -- Status and priority
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, confirmed, cancelled, completed, no_show
  priority VARCHAR(10) DEFAULT 'medium', -- low, medium, high, urgent
  
  -- Reminders and notifications
  reminder_minutes INTEGER[] DEFAULT '{15, 60}', -- minutes before event to send reminders
  notification_sent BOOLEAN DEFAULT FALSE,
  
  -- Integration data
  google_calendar_id TEXT,
  outlook_calendar_id TEXT,
  zoom_meeting_id TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  email VARCHAR(255),
  name VARCHAR(255),
  response_status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined, tentative
  is_organizer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar availability/working hours
CREATE TABLE IF NOT EXISTS user_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time off/blackout dates
CREATE TABLE IF NOT EXISTS time_off (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  all_day BOOLEAN DEFAULT TRUE,
  reason VARCHAR(100), -- vacation, sick, training, conference, etc.
  status VARCHAR(20) DEFAULT 'approved', -- pending, approved, denied
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_organization_datetime ON events(organization_id, start_datetime);
CREATE INDEX IF NOT EXISTS idx_events_claim_id ON events(claim_id);
CREATE INDEX IF NOT EXISTS idx_events_client_id ON events(client_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_user_availability_user_id ON user_availability(user_id);

-- RLS policies for events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Organization isolation for events" ON events FOR ALL USING (organization_id = get_user_organization_id());

ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Event attendees policy" ON event_attendees FOR ALL USING (
  EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = event_attendees.event_id 
    AND e.organization_id = get_user_organization_id()
  )
);

ALTER TABLE user_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User availability policy" ON user_availability FOR ALL USING (
  user_id IN (
    SELECT id FROM user_profiles 
    WHERE organization_id = get_user_organization_id()
  )
);

ALTER TABLE time_off ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Time off policy" ON time_off FOR ALL USING (
  user_id IN (
    SELECT id FROM user_profiles 
    WHERE organization_id = get_user_organization_id()
  )
);;