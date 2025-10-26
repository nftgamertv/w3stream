import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createClient } from '@/utils/supabaseClients/server';

// Type definitions
type RoomType = "collaborative" | "presentation";
type EnvironmentCategory = "2d" | "3d" | "mobile";
type EnvironmentTemplate =
  | "cyber-office"
  | "auditorium"
  | "creative-studio"
  | "modern-workspace"
  | "conference-hall"
  | "mobile-lounge"
  | "mobile-studio";

interface CreateRoomRequest {
  hostName?: string;
  environmentTemplate?: string;
  environment?: EnvironmentTemplate; // Accept both field names for backward compatibility
  category?: EnvironmentCategory;
  roomType?: RoomType;
  enableAIPrompt?: boolean;
}

interface CreateRoomResponse {
  roomId: string;
  joinUrl: string;
}

interface RoomMetadata {
  roomId: string;
  createdAt: string;
  hostId: string;
  roomType: RoomType;
  config: {
    hostName: string;
    environmentTemplate: EnvironmentTemplate;
    category: EnvironmentCategory;
  };
}

// Validation helper
function validateCreateRoomRequest(body: unknown): body is CreateRoomRequest {
  if (!body || typeof body !== 'object') {
    return false;
  }

  const req = body as Record<string, unknown>;

  // Environment is required
  const hasEnvironment =
    (typeof req.environmentTemplate === 'string' && req.environmentTemplate.trim().length > 0) ||
    (typeof req.environment === 'string' && req.environment.trim().length > 0);

  if (!hasEnvironment) {
    return false;
  }

  // Validate roomType if provided
  if (req.roomType !== undefined &&
      req.roomType !== 'collaborative' &&
      req.roomType !== 'presentation') {
    return false;
  }

  // Validate category if provided
  if (req.category !== undefined &&
      req.category !== '2d' &&
      req.category !== '3d' &&
      req.category !== 'mobile') {
    return false;
  }

  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate request body
    if (!validateCreateRoomRequest(body)) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: 'Request must include environment or environmentTemplate (non-empty string)',
        },
        { status: 400 }
      );
    }

    // Extract fields with defaults
    const environmentTemplate = (body.environmentTemplate || body.environment || 'cyber-office') as EnvironmentTemplate;
    const hostName = body.hostName || 'default-host';
    const roomType = body.roomType || 'collaborative';
    const category = body.category || '3d';
    const enableAIPrompt = body.enableAIPrompt || false;

    // Generate unique room ID (8 characters, URL-safe)
    const roomId = nanoid(8);

    // Generate unique host ID
    const hostId = nanoid(12);

    // Create room metadata
    const roomMetadata: RoomMetadata = {
      roomId,
      createdAt: new Date().toISOString(),
      hostId,
      roomType,
      config: {
        hostName,
        environmentTemplate,
        category,
      },
    };

    // Store in Supabase
    const supabase = await createClient();
    const { data: roomData, error: dbError } = await supabase
      .from('w3s_rooms')
      .insert({
        room_id: roomId,
        host_id: hostId,
        room_type: roomType,
        host_name: hostName,
        environment_template: environmentTemplate,
        environment_category: category,
        enable_ai_prompt: enableAIPrompt,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error storing room in Supabase:', dbError);
      return NextResponse.json(
        {
          error: 'Failed to create room',
          details: dbError.message,
        },
        { status: 500 }
      );
    }

    console.log('Room created in Supabase:', roomData);

    // Generate join URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
                    (request.headers.get('host')
                      ? `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`
                      : 'http://localhost:3000');

    const joinUrl = `${baseUrl}/room/${roomId}`;

    // Return response
    const response: CreateRoomResponse = {
      roomId,
      joinUrl,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// Method not allowed handler
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to create a room.' },
    { status: 405 }
  );
}
