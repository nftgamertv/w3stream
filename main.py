# LiveKit <-> ElevenLabs Agent Bridge - FIXED WEBSOCKET HANDLING
# Install: pip install livekit livekit-api websockets

import asyncio
import websockets
import json
from livekit import api, rtc
import base64
from typing import Optional, Set
import time
import sys
import io

# Fix Windows console encoding for Unicode characters
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', line_buffering=True)
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', line_buffering=True)

LIVEKIT_API_KEY = "APIT9RQMs8e5rt2"
LIVEKIT_API_SECRET = "77hsmpLOLGeF6z7tca7Jo3fZs0Xu1mMLS5xEZt4rFaN"
LIVEKIT_URL = "wss://twngo-e2fpi6u8.livekit.cloud"

ELEVENLABS_API_KEY = "sk_a576bc8fdb15b8421803d4a0935404bdfe3020c45321ca47"  # ADD YOUR KEY
AGENT_ID = "agent_5501k1z0sy9sevpr2wq6n95ndy7b"

# Audio settings
SAMPLE_RATE = 16000
CHANNELS = 1
SAMPLE_WIDTH = 2

# Connection management
active_connections: Set[str] = set()
connection_lock = asyncio.Lock()

def generate_bot_token(room_name: str):
    token = api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
    token.with_identity("ai-agent-bot").with_name("AI Agent").with_grants(
        api.VideoGrants(room_join=True, room=room_name, can_publish=True, can_subscribe=True)
    )
    return token.to_jwt()

async def bot_join_room(room_name: str):
    if ELEVENLABS_API_KEY == "YOUR_ELEVENLABS_API_KEY":
        print("❌ ERROR: Set your ELEVENLABS_API_KEY!")
        return
    
    token = generate_bot_token(room_name)
    room = rtc.Room()
    
    print(f"Connecting to room: {room_name}")
    
    try:
        await room.connect(LIVEKIT_URL, token)
        print("✓ Connected to LiveKit")
        
        audio_source = rtc.AudioSource(sample_rate=SAMPLE_RATE, num_channels=CHANNELS)
        track = rtc.LocalAudioTrack.create_audio_track("agent-audio", audio_source)
        options = rtc.TrackPublishOptions()
        options.source = rtc.TrackSource.SOURCE_MICROPHONE
        
        await room.local_participant.publish_track(track, options)
        print("✓ Audio published\n")
        
        @room.on("track_subscribed")
        def on_track_subscribed(track: rtc.Track, publication: rtc.RemoteTrackPublication, participant: rtc.RemoteParticipant):
            if track.kind == rtc.TrackKind.KIND_AUDIO:
                participant_id = participant.identity

                async def handle_new_track(audio_track, pid):
                    async with connection_lock:
                        if pid in active_connections:
                            print(f"⚠️ Already connected to {pid}")
                            return
                        active_connections.add(pid)

                    print(f"🎵 User connected: {pid}")

                    try:
                        audio_stream = rtc.AudioStream(audio_track)
                        await connect_to_elevenlabs_agent(audio_stream, audio_source, pid)
                    except Exception as e:
                        print(f"❌ Error connecting to {pid}: {e}")
                    finally:
                        async with connection_lock:
                            active_connections.discard(pid)
                        print(f"🔌 Disconnected: {pid}")

                asyncio.create_task(handle_new_track(track, participant_id))
        
        # Process existing participants
        for participant_identity, participant in room.remote_participants.items():
            for track_sid, publication in participant.track_publications.items():
                if publication.subscribed and publication.track:
                    track = publication.track
                    if track.kind == rtc.TrackKind.KIND_AUDIO:
                        async def handle_existing(audio_track, pid):
                            async with connection_lock:
                                if pid in active_connections:
                                    return
                                active_connections.add(pid)

                            print(f"🎧 Connecting to: {pid}")

                            try:
                                audio_stream = rtc.AudioStream(audio_track)
                                await connect_to_elevenlabs_agent(audio_stream, audio_source, pid)
                            except Exception as e:
                                print(f"❌ Error connecting to {pid}: {e}")
                            finally:
                                async with connection_lock:
                                    active_connections.discard(pid)

                        asyncio.create_task(handle_existing(track, participant_identity))
        
        print("🎤 Agent active!\n")
        
        # Keep running
        while True:
            await asyncio.sleep(1)
        
    except KeyboardInterrupt:
        print("\n⚠️ Shutting down...")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        try:
            await room.disconnect()
        except:
            pass

async def connect_to_elevenlabs_agent(audio_stream: rtc.AudioStream, audio_source: rtc.AudioSource, participant_id: str):
    """Connect to ElevenLabs Agent"""

    url = f"wss://api.elevenlabs.io/v1/convai/conversation?agent_id={AGENT_ID}"

    ws = None
    send_task = None
    receive_task = None
    init_received = asyncio.Event()

    try:
        print(f"🔌 Connecting to ElevenLabs for {participant_id}...")

        # Connect with proper settings
        ws = await websockets.connect(
            url,
            additional_headers={"xi-api-key": ELEVENLABS_API_KEY},
            ping_interval=20,
            ping_timeout=10
        )

        print(f"✓ Connected to ElevenLabs for {participant_id}")

        # Send init message with audio configuration
        init_message = {
            "type": "conversation_initiation_client_data",
            "conversation_config_override": {
                "agent": {
                    "language": "en"
                },
                "audio": {
                    "input": {
                        "encoding": "pcm_16000",
                        "sample_rate": 16000,
                        "channels": 1
                    }
                }
            }
        }
        await ws.send(json.dumps(init_message))
        print(f"📤 Sent initialization for {participant_id}")

        # Start receive task and wait for init confirmation
        receive_task = asyncio.create_task(receive_audio_from_agent(ws, audio_source, participant_id, init_received))

        # Wait for initialization confirmation (max 5 seconds)
        try:
            await asyncio.wait_for(init_received.wait(), timeout=5.0)
            print(f"✓ Initialization confirmed for {participant_id}")
        except asyncio.TimeoutError:
            print(f"⚠️ Initialization timeout for {participant_id}, proceeding anyway...")

        # Now start sending audio
        send_task = asyncio.create_task(send_audio_to_agent(audio_stream, ws, participant_id))

        # Keep connection alive until one task completes
        await asyncio.gather(send_task, receive_task, return_exceptions=True)
        
    except Exception as e:
        print(f"❌ Connection error for {participant_id}: {e}")
    finally:
        # Cancel tasks
        if send_task and not send_task.done():
            send_task.cancel()
        if receive_task and not receive_task.done():
            receive_task.cancel()
        
        # Wait for cancellation
        if send_task:
            try:
                await send_task
            except:
                pass
        if receive_task:
            try:
                await receive_task
            except:
                pass
        
        # Close WebSocket - FIXED: use close_code to check if closed
        if ws:
            try:
                if ws.close_code is None:  # Still open
                    await ws.close()
            except:
                pass
        
        print(f"🔌 Cleaned up {participant_id}")

async def send_audio_to_agent(audio_stream: rtc.AudioStream, ws, participant_id: str):
    """Send audio to ElevenLabs"""
    frame_count = 0
    
    try:
        async for event in audio_stream:
            frame = event.frame
            
            if not frame.data or len(frame.data) == 0:
                continue
            
            frame_count += 1
            
            # Convert and encode
            audio_bytes = frame.data.tobytes() if hasattr(frame.data, 'tobytes') else bytes(frame.data)
            audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
            
            # Send to agent with proper event structure
            await ws.send(json.dumps({
                "user_audio_chunk": audio_b64
            }))
            
            if frame_count % 100 == 0:
                print(f"📤 Sent {frame_count} frames from {participant_id}")
            
    except websockets.exceptions.ConnectionClosed:
        print(f"⚠️ Send connection closed for {participant_id}")
    except Exception as e:
        print(f"❌ Send error: {e}")

async def receive_audio_from_agent(ws, audio_source: rtc.AudioSource, participant_id: str, init_received: asyncio.Event = None):
    """Receive audio from ElevenLabs"""
    chunk_count = 0

    try:
        async for message in ws:
            data = json.loads(message)
            msg_type = data.get("type")

            if msg_type == "audio":
                audio_b64 = data.get("audio")
                if audio_b64:
                    audio_bytes = base64.b64decode(audio_b64)

                    if len(audio_bytes) > 0 and len(audio_bytes) % 2 == 0:
                        chunk_count += 1

                        samples = len(audio_bytes) // 2

                        audio_frame = rtc.AudioFrame(
                            data=audio_bytes,
                            sample_rate=SAMPLE_RATE,
                            num_channels=CHANNELS,
                            samples_per_channel=samples
                        )
                        await audio_source.capture_frame(audio_frame)

                        if chunk_count % 10 == 0:
                            print(f"🔊 Played {chunk_count} chunks")

            elif msg_type == "user_transcript":
                transcript = data.get("user_transcript", "")
                if transcript:
                    print(f"👤 USER: {transcript}")

            elif msg_type == "agent_response":
                response = data.get("agent_response", "")
                if response:
                    print(f"🤖 AGENT: {response}")

            elif msg_type == "interruption":
                print(f"⚠️ Interrupted")

            elif msg_type == "ping":
                await ws.send(json.dumps({"type": "pong"}))

            elif msg_type == "conversation_initiation_metadata":
                print(f"✓ Conversation initialized for {participant_id}")
                if init_received and not init_received.is_set():
                    init_received.set()

            elif msg_type == "error":
                print(f"❌ Agent error: {data.get('message', 'Unknown')}")

    except websockets.exceptions.ConnectionClosed as e:
        print(f"⚠️ Receive connection closed for {participant_id}: {e.code} - {e.reason}")
    except Exception as e:
        print(f"❌ Receive error: {e}")

if __name__ == "__main__":
    room_name = "Aw3OJT5A"
    
    print("=" * 60)
    print("LiveKit <-> ElevenLabs Agent Bridge")
    print("=" * 60)
    print(f"Agent ID: {AGENT_ID}")
    print(f"Room: {room_name}")
    print("=" * 60)
    print()
    
    asyncio.run(bot_join_room(room_name))