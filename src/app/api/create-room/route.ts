import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

// Type definitions
interface CreateRoomRequest {
  hostName: string;
  environmentTemplate?: string;
  environment?: string; // Accept both field names for backward compatibility
}

interface CreateRoomResponse {
  roomId: string;
  joinUrl: string;
}

interface RoomMetadata {
  roomId: string;
  createdAt: string;
  hostId: string;
  config: {
    hostName: string;
    environmentTemplate: string;
  };
}

// Validation helper
function validateCreateRoomRequest(body: unknown): body is CreateRoomRequest {
  if (!body || typeof body !== 'object') {
    return false;
  }

  const req = body as Record<string, unknown>;

  const hasHostName = typeof req.hostName === 'string' && req.hostName.trim().length > 0;
  const hasEnvironment =
    (typeof req.environmentTemplate === 'string' && req.environmentTemplate.trim().length > 0) ||
    (typeof req.environment === 'string' && req.environment.trim().length > 0);

  return hasHostName && hasEnvironment;
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
          details: 'Request must include hostName (non-empty string) and environment or environmentTemplate (non-empty string)',
        },
        { status: 400 }
      );
    }

    // Accept either 'environment' or 'environmentTemplate'
    const environmentTemplate = body.environmentTemplate || body.environment || 'cyber-office';
    const { hostName } = body;

    // Generate unique room ID (8 characters, URL-safe)
    const roomId = nanoid(8);

    // Generate unique host ID
    const hostId = nanoid(12);

    // Create room metadata
    const roomMetadata: RoomMetadata = {
      roomId,
      createdAt: new Date().toISOString(),
      hostId,
      config: {
        hostName: hostName.trim(),
        environmentTemplate: environmentTemplate.trim(),
      },
    };

    // TODO: Store in Firestore when Firebase integration is added
    // For now, we'll just log it
    console.log('Room created:', roomMetadata);

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
