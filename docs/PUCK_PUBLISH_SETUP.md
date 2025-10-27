# Puck Editor Publish Button Setup

## Overview

The Puck editor's Publish button saves page content directly to the Supabase database.

## What Was Changed

### 1. Updated Puck Client (`src/app/puck/[...puckPath]/client.tsx`)

The `onPublish` handler now:
- Saves page data to the `w3s_pages` table in Supabase
- Uses upsert operation to handle both create and update
- Provides user feedback on success/failure
- Prevents duplicate publish operations

### 2. Publish Flow

When the user clicks Publish:

1. **Save to Database** (`savePage` action)
   - Extracts username from the path
   - Upserts page data to `w3s_pages` table
   - Returns success status and page ID

## Database Schema

### `w3s_pages` Table
- `id` - UUID (primary key)
- `username` - Text (unique)
- `data` - JSONB (page content)
- `created_at` - Timestamp
- `updated_at` - Timestamp (auto-updated)

## Required Configuration

Ensure your Supabase database has the `w3s_pages` table created with:

```sql
CREATE TABLE w3s_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_w3s_pages_updated_at BEFORE UPDATE ON w3s_pages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Testing

1. Start the dev server: `npm run dev`
2. Navigate to a Puck editor page (e.g., `/puck/test/edit`)
3. Make changes to the page
4. Click the "Publish" button
5. Check the browser console for:
   - "Publishing page..."
   - "Page saved successfully: [UUID]"
   - "Published successfully!"

## Error Handling

The publish button will show alerts for:
- Publishing already in progress
- Database save failures

All errors are logged to the console for debugging.

## Next Steps

1. Ensure your Supabase connection is configured in `.env.local`
2. Create the `w3s_pages` table if it doesn't exist
3. Test the Publish functionality
