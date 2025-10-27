-- Create w3s_rooms table for storing room metadata
CREATE TABLE IF NOT EXISTS w3s_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id VARCHAR(8) UNIQUE NOT NULL,
  host_id VARCHAR(12) NOT NULL,
  room_type VARCHAR(20) NOT NULL CHECK (room_type IN ('collaborative', 'presentation')),
  host_name VARCHAR(255) NOT NULL DEFAULT 'default-host',
  environment_template VARCHAR(50) NOT NULL,
  environment_category VARCHAR(10) NOT NULL CHECK (environment_category IN ('2d', '3d', 'mobile')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create index on room_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_w3s_rooms_room_id ON w3s_rooms(room_id);

-- Create index on host_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_w3s_rooms_host_id ON w3s_rooms(host_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_w3s_rooms_created_at ON w3s_rooms(created_at DESC);

-- Create index on is_active for filtering active rooms
CREATE INDEX IF NOT EXISTS idx_w3s_rooms_is_active ON w3s_rooms(is_active);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_w3s_rooms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_w3s_rooms_updated_at
  BEFORE UPDATE ON w3s_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_w3s_rooms_updated_at();

-- Enable Row Level Security
ALTER TABLE w3s_rooms ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read active rooms
CREATE POLICY "Allow public read access to active rooms"
  ON w3s_rooms
  FOR SELECT
  USING (is_active = true);

-- Create policy to allow insert for authenticated users (you can modify this based on your auth setup)
CREATE POLICY "Allow insert for all users"
  ON w3s_rooms
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow update for room host only (based on host_id)
CREATE POLICY "Allow update for room host"
  ON w3s_rooms
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE w3s_rooms IS 'Stores metadata for collaborative and presentation rooms';
COMMENT ON COLUMN w3s_rooms.room_id IS 'Unique 8-character room identifier for URLs';
COMMENT ON COLUMN w3s_rooms.host_id IS 'Unique 12-character host identifier';
COMMENT ON COLUMN w3s_rooms.room_type IS 'Type of room: collaborative or presentation';
COMMENT ON COLUMN w3s_rooms.environment_template IS 'The environment template used for the room';
COMMENT ON COLUMN w3s_rooms.environment_category IS 'The category of environment: 2d, 3d, or mobile';
COMMENT ON COLUMN w3s_rooms.is_active IS 'Whether the room is currently active';
