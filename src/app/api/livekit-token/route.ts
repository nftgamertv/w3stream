import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

// Type definitions
interface LiveKitTokenRequest {
  roomId: string;
  participantName: string;
  role?: 'host' | 'guest' | 'ai';
  metadata?: Record<string, unknown>;
}

interface LiveKitTokenResponse {
  token: string;
  serverUrl: string;
}

interface ParticipantMetadata {
  name: string;
  role: 'host' | 'guest' | 'ai';
  color: string;
  joinedAt: string;
}

// Environment variable validation
function validateEnvironmentVariables(): { valid: boolean; missing: string[] } {
  const required = [
    'NEXT_PUBLIC_LIVEKIT_URL',
    'LIVEKIT_API_KEY',
    'LIVEKIT_API_SECRET',
  ];

  const missing = required.filter((key) => !process.env[key]);

  return {
    valid: missing.length === 0,
    missing,
  };
}

// Request validation helper
function validateTokenRequest(body: unknown): body is LiveKitTokenRequest {
  if (!body || typeof body !== 'object') {
    return false;
  }

  const req = body as Record<string, unknown>;

  // Required fields
  if (
    typeof req.roomId !== 'string' ||
    req.roomId.trim().length === 0 ||
    typeof req.participantName !== 'string' ||
    req.participantName.trim().length === 0
  ) {
    return false;
  }

  // Optional role field validation
  if (
    req.role !== undefined &&
    (typeof req.role !== 'string' || !['host', 'guest', 'ai'].includes(req.role))
  ) {
    return false;
  }

  return true;
}

// Generate random color for participant
function generateParticipantColor(): string {
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Light Salmon
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Sky Blue
    '#F8B739', // Orange
    '#52B788', // Green
  ];

  return colors[Math.floor(Math.random() * colors.length)];
}

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    const envCheck = validateEnvironmentVariables();
    if (!envCheck.valid) {
      console.error('Missing required environment variables:', envCheck.missing);
      return NextResponse.json(
        {
          error: 'Server configuration error',
          details: 'LiveKit credentials are not properly configured',
        },
        { status: 500 }
      );
    }

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
    if (!validateTokenRequest(body)) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details:
            'Request must include roomId (non-empty string), participantName (non-empty string), and optional role (host/guest/ai)',
        },
        { status: 400 }
      );
    }

    const { roomId, participantName, role = 'guest', metadata = {} } = body;

    // Get environment variables (already validated)
    const apiKey = process.env.LIVEKIT_API_KEY!;
    const apiSecret = process.env.LIVEKIT_API_SECRET!;
    const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!;

    // Create participant metadata
    const participantMetadata: ParticipantMetadata = {
      name: participantName.trim(),
      role,
      color: generateParticipantColor(),
      joinedAt: new Date().toISOString(),
      ...metadata,
    };

    // Create access token
    let token: string;
    try {
      const at = new AccessToken(apiKey, apiSecret, {
        identity: participantName.trim(),
        // Token valid for 24 hours
        ttl: '24h',
      });

      // Add video grants
      at.addGrant({
        room: roomId.trim(),
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
        // Allow hosts to kick participants
        canUpdateOwnMetadata: true,
      });

      // Set participant metadata
      at.metadata = JSON.stringify(participantMetadata);

      // Generate JWT token
      token = await at.toJwt();
    } catch (tokenError) {
      console.error('Error generating LiveKit token:', tokenError);
      return NextResponse.json(
        {
          error: 'Token generation failed',
          details: tokenError instanceof Error ? tokenError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Return response
    const response: LiveKitTokenResponse = {
      token,
      serverUrl,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error generating LiveKit token:', error);

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
    { error: 'Method not allowed. Use POST to generate a token.' },
    { status: 405 }
  );
}
