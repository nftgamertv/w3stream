# LiveKit bot with GCP STT and ElevenLabs TTS
# Install: pip install livekit livekit-api pydub aiohttp
# Setup: ./sounds/laugh.mp3, FFmpeg in PATH, change room_name

import asyncio
import os
import base64
import json
import aiohttp
from livekit import api
from livekit import rtc
from pydub import AudioSegment
import io

# Your creds
LIVEKIT_API_KEY = "APIT9RQMs8e5rt2"
LIVEKIT_API_SECRET = "77hsmpLOLGeF6z7tca7Jo3fZs0Xu1mMLS5xEZt4rFaN"
LIVEKIT_URL = "wss://twngo-e2fpi6u8.livekit.cloud"
GCP_API_KEY = "AIzaSyBZq4Suo0KFjf4GEOv2WHcK5-18H1uKAIw"

# ElevenLabs settings
ELEVENLABS_API_KEY = "YOUR_ELEVENLABS_API_KEY_HERE"  # ADD YOUR KEY
ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # Default voice (Rachel), change if needed

SOUNDS_FOLDER = "./sounds"
BUFFER_SIZE = 64000  # ~2s buffer

def generate_bot_token(room_name: str):
    token = api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
    token.with_identity("ai-agent-bot").with_name("AI Agent").with_grants(
        api.VideoGrants(
            room_join=True,
            room=room_name,
            can_publish=True,
            can_subscribe=True,
        )
    )
    return token.to_jwt()

async def bot_join_room(room_name: str):
    token = generate_bot_token(room_name)
    room = rtc.Room()
    
    print(f"Connecting to room: {room_name}")
    await room.connect(LIVEKIT_URL, token)
    print(f"✓ Bot joined: {room_name}")
    
    # Create audio source
    audio_source = rtc.AudioSource(sample_rate=16000, num_channels=1)
    track = rtc.LocalAudioTrack.create_audio_track("agent-audio", audio_source)
    options = rtc.TrackPublishOptions()
    options.source = rtc.TrackSource.SOURCE_MICROPHONE
    
    await room.local_participant.publish_track(track, options)
    print("✓ Audio track published")
    
    # Say hello using ElevenLabs voice
    await speak_elevenlabs(audio_source, "Hello! I'm your AI agent. Say the word joke and I'll laugh!")
    
    @room.on("track_subscribed")
    def on_track_subscribed(
        track: rtc.Track,
        publication: rtc.RemoteTrackPublication,
        participant: rtc.RemoteParticipant
    ):
        print(f"🎵 Track subscribed from {participant.identity}")
        if track.kind == rtc.TrackKind.KIND_AUDIO:
            print(f"📢 Processing audio from {participant.identity}")
            audio_stream = rtc.AudioStream(track)
            asyncio.create_task(process_audio_stream(audio_stream, audio_source))
    
    # Process existing participants
    for participant_identity, participant in room.remote_participants.items():
        for track_sid, publication in participant.track_publications.items():
            if publication.subscribed and publication.track:
                track = publication.track
                if track.kind == rtc.TrackKind.KIND_AUDIO:
                    print(f"🎧 Processing existing audio track from {participant_identity}")
                    audio_stream = rtc.AudioStream(track)
                    asyncio.create_task(process_audio_stream(audio_stream, audio_source))
    
    try:
        print("\n🎤 Bot is listening... (Press Ctrl+C to stop)")
        await asyncio.sleep(3600)
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        await room.disconnect()

async def process_audio_stream(audio_stream: rtc.AudioStream, audio_source: rtc.AudioSource):
    buffer = b''
    frame_count = 0
    print("🎧 Started processing audio stream...")
    
    async for event in audio_stream:
        frame_count += 1
        frame = event.frame
        buffer += frame.data.tobytes()
        
        if frame_count % 50 == 0:
            print(f"🔄 Received {frame_count} frames, buffer size: {len(buffer)} bytes")
        
        if len(buffer) >= BUFFER_SIZE:
            print(f"🎤 Processing audio buffer ({len(buffer)} bytes)")
            transcript = await get_transcript_from_gcp(buffer)
            
            if transcript:
                print(f"💬 Transcript: '{transcript}'")
                if "joke" in transcript.lower():
                    print("😂 Detected 'joke'!")
                    await play_sound_effect(audio_source, "laugh.mp3")
                    await speak_elevenlabs(audio_source, "Ha ha ha! That's hilarious!")
            
            buffer = b''

async def get_transcript_from_gcp(audio_data: bytes) -> str:
    url = f"https://speech.googleapis.com/v1/speech:recognize?key={GCP_API_KEY}"
    payload = {
        "config": {
            "encoding": "LINEAR16",
            "sampleRateHertz": 16000,
            "languageCode": "en-US",
            "enableAutomaticPunctuation": True
        },
        "audio": {
            "content": base64.b64encode(audio_data).decode('utf-8')
        }
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, timeout=aiohttp.ClientTimeout(total=10)) as response:
                response_text = await response.text()
                
                if response.status == 200:
                    resp_json = json.loads(response_text)
                    
                    # DEBUG: Print full response
                    print(f"🔍 GCP Response: {json.dumps(resp_json, indent=2)}")
                    
                    results = resp_json.get('results', [])
                    if results and len(results) > 0:
                        alternatives = results[0].get('alternatives', [])
                        if alternatives and len(alternatives) > 0:
                            transcript = alternatives[0].get('transcript', '')
                            if transcript:
                                return transcript
                    
                    print(f"⚠️ No transcription (silence or unclear)")
                    return ""
                else:
                    print(f"❌ GCP STT error {response.status}")
                    print(f"   Full Response: {response_text}")
                    try:
                        error_json = json.loads(response_text)
                        if 'error' in error_json:
                            msg = error_json['error'].get('message', 'Unknown')
                            print(f"   Error: {msg}")
                    except:
                        pass
                        
    except asyncio.TimeoutError:
        print(f"❌ GCP STT timeout")
    except Exception as e:
        print(f"❌ GCP STT exception: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
    
    return ""

async def speak_elevenlabs(audio_source: rtc.AudioSource, text: str):
    """Convert text to speech using ElevenLabs and play it"""
    print(f"🗣️ ElevenLabs speaking: '{text}'")
    
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as response:
                if response.status == 200:
                    # ElevenLabs returns MP3 audio
                    audio_bytes = await response.read()
                    
                    # Convert MP3 to raw PCM
                    audio_segment = AudioSegment.from_mp3(io.BytesIO(audio_bytes))
                    audio_segment = audio_segment.set_frame_rate(16000).set_channels(1).set_sample_width(2)
                    
                    # Stream to LiveKit
                    await stream_audio_to_livekit(audio_source, audio_segment.raw_data)
                    print(f"✓ ElevenLabs finished speaking")
                else:
                    error_text = await response.text()
                    print(f"❌ ElevenLabs error {response.status}")
                    print(f"   Response: {error_text[:300]}")
    except Exception as e:
        print(f"❌ ElevenLabs exception: {type(e).__name__}: {e}")

async def play_sound_effect(audio_source: rtc.AudioSource, filename: str):
    """Play a sound effect from file"""
    file_path = os.path.join(SOUNDS_FOLDER, filename)
    
    if not os.path.exists(file_path):
        print(f"❌ Missing sound file: {file_path}")
        return
    
    try:
        sound = AudioSegment.from_file(file_path)
        sound = sound.set_frame_rate(16000).set_channels(1).set_sample_width(2)
        
        await stream_audio_to_livekit(audio_source, sound.raw_data)
        print(f"🔊 Played sound: {filename}")
    except Exception as e:
        print(f"❌ Error playing sound: {e}")

async def stream_audio_to_livekit(audio_source: rtc.AudioSource, raw_audio: bytes):
    """Stream raw audio data to LiveKit in 20ms chunks"""
    frame_size = int(16000 * 2 * 0.02)  # 20ms at 16kHz, 2 bytes per sample
    
    for i in range(0, len(raw_audio), frame_size):
        chunk = raw_audio[i:i + frame_size]
        if not chunk:
            break
        
        # Pad last frame if needed
        if len(chunk) < frame_size:
            chunk = chunk + b'\x00' * (frame_size - len(chunk))
        
        audio_frame = rtc.AudioFrame(
            data=chunk,
            sample_rate=16000,
            num_channels=1,
            samples_per_channel=len(chunk) // 2
        )
        await audio_source.capture_frame(audio_frame)
        await asyncio.sleep(0.02)  # 20ms delay

if __name__ == "__main__":
    room_name = "Q9GkRdZj"  # CHANGE TO YOUR ROOM NAME
    asyncio.run(bot_join_room(room_name))