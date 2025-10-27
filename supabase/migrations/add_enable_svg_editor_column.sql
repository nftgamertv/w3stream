-- Add enable_svg_editor column to w3s_rooms table
ALTER TABLE w3s_rooms
ADD COLUMN IF NOT EXISTS enable_svg_editor BOOLEAN NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN w3s_rooms.enable_svg_editor IS 'Whether the SVG editor is enabled for this room';
