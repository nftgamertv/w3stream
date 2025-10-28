import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabaseClients/server';
import { defaultRoomData } from '@/config/defaultRoomData';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomId } = body;

    if (!roomId) {
      return NextResponse.json(
        { error: 'roomId is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Create page data with the correct roomId
    const pageData = {
      ...defaultRoomData,
      root: {
        ...defaultRoomData.root,
        props: {
          ...defaultRoomData.root.props,
          title: `Room ${roomId}`,
        }
      },
      content: defaultRoomData.content.map(item => {
        if (item.type === 'RoomHeader') {
          return {
            ...item,
            props: {
              ...item.props,
              roomId: roomId,
            }
          };
        }
        return item;
      })
    };

    // Upsert (insert or update) page data
    const { data: result, error: pageError } = await supabase
      .from('w3s_pages')
      .upsert(
        {
          room_id: roomId,         },
        {
          onConflict: 'room_id',
          ignoreDuplicates: false
        }
      )
      .select()
      .single();

    if (pageError) {
      console.error('Error fixing room:', pageError);
      return NextResponse.json(
        { error: 'Failed to fix room', details: pageError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Room ${roomId} fixed successfully`,
      data: result
    });
  } catch (error) {
    console.error('Error in fix-room:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
