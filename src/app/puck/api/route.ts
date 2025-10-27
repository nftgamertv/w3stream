import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabaseClients/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    if (!payload.path || !payload.data) {
      return NextResponse.json(
        { error: "Missing required fields: path and data" },
        { status: 400 }
      );
    }

    // Extract roomId from path (remove leading slash)
    const roomId = payload.path.toLowerCase().replace(/^\//, '');

    if (!roomId) {
      return NextResponse.json(
        { error: "Invalid path: could not extract roomId" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if page exists for this roomId
    const { data: existingPage } = await supabase
      .from('w3s_pages')
      .select('id')
      .eq('room_id', roomId)
      .single();

    let result;
    if (existingPage) {
      // Update existing page
      result = await supabase
        .from('w3s_pages')
        .update({ data: payload.data, updated_at: new Date().toISOString() })
        .eq('room_id', roomId);
    } else {
      // Insert new page
      result = await supabase
        .from('w3s_pages')
        .insert({
          room_id: roomId,
          data: payload.data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }

    if (result.error) {
      console.error('Supabase error:', result.error);
      return NextResponse.json(
        { error: `Failed to save page: ${result.error.message}` },
        { status: 500 }
      );
    }

    console.log(`Successfully saved page data for roomId: ${roomId}`);

    // Purge Next.js cache
    revalidatePath(payload.path);

    return NextResponse.json({ status: "ok", roomId });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
}
