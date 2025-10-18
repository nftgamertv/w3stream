# LiveKit AI Agent - LOW LATENCY VERSION
# Install: pip install livekit livekit-api pydub aiohttp openai numpy

import asyncio
import os
import base64
import json
import aiohttp
from livekit import api
from livekit import rtc
from pydub import AudioSegment
import io
import numpy as np
from openai import AsyncOpenAI
import time
from asyncio import Lock

LIVEKIT_API_KEY = "APIT9RQMs8e5rt2"
LIVEKIT_API_SECRET = "77hsmpLOLGeF6z7tca7Jo3fZs0Xu1mMLS5xEZt4rFaN"
LIVEKIT_URL = "wss://twngo-e2fpi6u8.livekit.cloud"
GCP_API_KEY = "AIzaSyBZq4Suo0KFjf4GEOv2WHcK5-18H1uKAIw"

# ElevenLabs settings
ELEVENLABS_API_KEY = "sk_a576bc8fdb15b8421803d4a0935404bdfe3020c45321ca47"  # ADD YOUR KEY
ELEVENLABS_VOICE_ID = "T4ZHMiNK4T14F5KAAWWj"

# OpenAI settings
OPENAI_API_KEY = "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"  # ADD YOUR KEY

# OPTIMIZED VAD Settings for LOW LATENCY
SPEECH_THRESHOLD = 500
SILENCE_DURATION = 0.7  # Reduced from 1.5s to 0.7s
MIN_SPEECH_DURATION = 0.3  # Reduced from 0.5s
MAX_SPEECH_DURATION = 30
SAMPLE_RATE = 48000
TARGET_SAMPLE_RATE = 16000

# Initialize OpenAI client
openai_client = None

# Conversation history
conversation_history = [
    {"role": "system", "content": "You are a helpful, friendly AI assistant. Keep responses concise and conversational (1-3 sentences). Be natural and engaging."}
]

# Thread-safe state management
class BotState:
    def __init__(self):
        self.is_speaking = False
        self.should_interrupt = False
        self.lock = Lock()
        self.processing = False  # Prevent multiple simultaneous transcriptions
    
    async def set_speaking(self, value: bool):
        async with self.lock:
            self.is_speaking = value
    
    async def get_speaking(self) -> bool:
        async with self.lock:
            return self.is_speaking
    
    async def set_interrupt(self, value: bool):
        async with self.lock:
            self.should_interrupt = value
    
    async def get_interrupt(self) -> bool:
        async with self.lock:
            return self.should_interrupt
    
    async def start_processing(self) -> bool:
        """Returns True if processing can start, False if already processing"""
        async with self.lock:
            if self.processing:
                return False
            self.processing = True
            return True
    
    async def stop_processing(self):
        async with self.lock:
            self.processing = False

bot_state = BotState()

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
    global openai_client
    
    # Validate API keys
    if ELEVENLABS_API_KEY == "YOUR_ELEVENLABS_API_KEY_HERE":
        print("❌ ERROR: ELEVENLABS_API_KEY not set!")
        return
    if OPENAI_API_KEY == "YOUR_OPENAI_KEY_HERE":
        print("❌ ERROR: OPENAI_API_KEY not set!")
        return
    
    # Initialize OpenAI client
    try:
        openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    except Exception as e:
        print(f"❌ Failed to initialize OpenAI: {e}")
        return
    
    token = generate_bot_token(room_name)
    room = rtc.Room()
    
    try:
        print(f"Connecting to room: {room_name}")
        await room.connect(LIVEKIT_URL, token)
        print(f"✓ Bot joined: {room_name}")
        
        # Create audio source at 48kHz
        audio_source = rtc.AudioSource(sample_rate=48000, num_channels=1)
        track = rtc.LocalAudioTrack.create_audio_track("agent-audio", audio_source)
        options = rtc.TrackPublishOptions()
        options.source = rtc.TrackSource.SOURCE_MICROPHONE
        
        await room.local_participant.publish_track(track, options)
        print("✓ Audio track published")
        
        # Quick intro
        print("Testing TTS...")
        await speak_elevenlabs(audio_source, "Ready!")
        
        @room.on("track_subscribed")
        def on_track_subscribed(
            track: rtc.Track,
            publication: rtc.RemoteTrackPublication,
            participant: rtc.RemoteParticipant
        ):
            print(f"🎵 Track from {participant.identity}")
            if track.kind == rtc.TrackKind.KIND_AUDIO:
                audio_stream = rtc.AudioStream(track)
                asyncio.create_task(process_audio_with_vad(audio_stream, audio_source, participant.identity))
        
        # Process existing participants
        for participant_identity, participant in room.remote_participants.items():
            for track_sid, publication in participant.track_publications.items():
                if publication.subscribed and publication.track:
                    track = publication.track
                    if track.kind == rtc.TrackKind.KIND_AUDIO:
                        print(f"🎧 Processing {participant_identity}")
                        audio_stream = rtc.AudioStream(track)
                        asyncio.create_task(process_audio_with_vad(audio_stream, audio_source, participant_identity))
        
        print("\n🎤 Listening...")
        await asyncio.sleep(3600)
        
    except KeyboardInterrupt:
        print("\nShutting down...")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        try:
            await room.disconnect()
        except:
            pass

def calculate_energy(audio_data: np.ndarray) -> float:
    """Calculate RMS energy with proper error handling"""
    try:
        if len(audio_data) == 0:
            return 0.0
        
        audio_data = audio_data[np.isfinite(audio_data)]
        
        if len(audio_data) == 0:
            return 0.0
        
        squared = np.square(audio_data.astype(np.float64))
        mean_squared = np.mean(squared)
        
        if mean_squared < 0 or np.isnan(mean_squared) or np.isinf(mean_squared):
            return 0.0
        
        energy = np.sqrt(mean_squared)
        
        if np.isnan(energy) or np.isinf(energy):
            return 0.0
        
        return float(energy)
    except Exception:
        return 0.0

async def process_audio_with_vad(audio_stream: rtc.AudioStream, audio_source: rtc.AudioSource, participant_id: str):
    """Process audio with FAST Voice Activity Detection"""
    
    buffer = []
    is_speaking = False
    speech_start_time = None
    last_speech_time = None
    
    print(f"🎧 VAD active for {participant_id}")
    
    try:
        async for event in audio_stream:
            frame = event.frame
            
            if not frame.data or len(frame.data) == 0:
                continue
            
            try:
                audio_data = np.frombuffer(frame.data, dtype=np.int16)
            except Exception:
                continue
            
            if len(audio_data) == 0:
                continue
            
            buffer.extend(audio_data)
            energy = calculate_energy(audio_data)
            current_time = time.time()
            
            # Detect speech
            if energy > SPEECH_THRESHOLD:
                if not is_speaking:
                    is_speaking = True
                    speech_start_time = current_time
                    print(f"🗣️ Speech (energy: {energy:.0f})")
                    
                    # User interrupted bot
                    if await bot_state.get_speaking():
                        await bot_state.set_interrupt(True)
                        print("⚠️ Interrupted")
                
                last_speech_time = current_time
            
            # Check if user finished speaking
            if is_speaking and last_speech_time:
                silence_duration = current_time - last_speech_time
                
                if silence_duration >= SILENCE_DURATION:
                    speech_duration = last_speech_time - speech_start_time
                    
                    # Validate speech duration
                    if MIN_SPEECH_DURATION <= speech_duration <= MAX_SPEECH_DURATION:
                        # Check if we can process (prevent overlapping requests)
                        if not await bot_state.start_processing():
                            print("⚠️ Already processing, skipping")
                            buffer = []
                            is_speaking = False
                            speech_start_time = None
                            last_speech_time = None
                            continue
                        
                        samples_to_process = len(buffer)
                        
                        if samples_to_process > 0:
                            try:
                                # Start timing
                                start_time = time.time()
                                
                                audio_bytes = np.array(buffer[:samples_to_process], dtype=np.int16).tobytes()
                                
                                # Resample
                                resampled_audio = resample_audio(audio_bytes, SAMPLE_RATE, TARGET_SAMPLE_RATE)
                                
                                if not resampled_audio or len(resampled_audio) < 100:
                                    await bot_state.stop_processing()
                                    buffer = []
                                    is_speaking = False
                                    speech_start_time = None
                                    last_speech_time = None
                                    continue
                                
                                # Transcribe
                                transcript = await get_transcript_from_gcp(resampled_audio)
                                
                                if transcript and len(transcript.strip()) > 0:
                                    print(f"✅ USER: '{transcript}'")
                                    
                                    # Get AI response
                                    ai_response = await get_ai_response(transcript)
                                    
                                    if ai_response:
                                        print(f"✅ BOT: '{ai_response}'")
                                        
                                        # Speak response
                                        await bot_state.set_interrupt(False)
                                        success = await speak_elevenlabs(audio_source, ai_response)
                                        
                                        end_time = time.time()
                                        total_latency = end_time - start_time
                                        print(f"⏱️ Total latency: {total_latency:.2f}s")
                                        
                                        if await bot_state.get_interrupt():
                                            print("⚠️ Interrupted")
                                        elif success:
                                            print("✅ Done\n")
                                
                                await bot_state.stop_processing()
                                    
                            except Exception as e:
                                print(f"❌ Error: {e}")
                                await bot_state.stop_processing()
                    
                    # Reset state
                    buffer = []
                    is_speaking = False
                    speech_start_time = None
                    last_speech_time = None
            
            # Limit buffer size
            max_buffer_samples = 30 * SAMPLE_RATE
            if len(buffer) > max_buffer_samples:
                buffer = buffer[-max_buffer_samples:]
    
    except Exception as e:
        print(f"❌ Stream error: {e}")

def resample_audio(audio_bytes: bytes, from_rate: int, to_rate: int) -> bytes:
    """Fast audio resampling"""
    try:
        if not audio_bytes or len(audio_bytes) == 0:
            return b''
        
        audio = AudioSegment(
            data=audio_bytes,
            sample_width=2,
            frame_rate=from_rate,
            channels=1
        )
        
        audio = audio.set_frame_rate(to_rate)
        return audio.raw_data
        
    except Exception:
        return b''

async def get_ai_response(user_input: str) -> str:
    """Get LLM response with timeout"""
    global conversation_history
    
    if not user_input or len(user_input.strip()) == 0:
        return ""
    
    conversation_history.append({"role": "user", "content": user_input})
    
    try:
        response = await openai_client.chat.completions.create(
            model="gpt-4o-mini",  # Fast model
            messages=conversation_history,
            max_tokens=100,  # Reduced for faster responses
            temperature=0.7,
            timeout=10.0  # Reduced timeout
        )
        
        if not response.choices or len(response.choices) == 0:
            return "I'm having trouble thinking."
        
        ai_message = response.choices[0].message.content
        
        if not ai_message:
            return "Sorry, I didn't catch that."
        
        conversation_history.append({"role": "assistant", "content": ai_message})
        
        # Trim history
        if len(conversation_history) > 21:
            conversation_history = [conversation_history[0]] + conversation_history[-20:]
        
        return ai_message
        
    except Exception as e:
        print(f"❌ LLM error: {e}")
        return "Sorry, I'm having trouble."

async def get_transcript_from_gcp(audio_data: bytes) -> str:
    """Fast transcription with GCP"""
    
    if not audio_data or len(audio_data) < 100:
        return ""
    
    url = f"https://speech.googleapis.com/v1/speech:recognize?key={GCP_API_KEY}"
    payload = {
        "config": {
            "encoding": "LINEAR16",
            "sampleRateHertz": TARGET_SAMPLE_RATE,
            "languageCode": "en-US",
            "enableAutomaticPunctuation": True,
            "model": "default",  # Use default for speed
            "useEnhanced": False  # Disable enhanced for speed
        },
        "audio": {
            "content": base64.b64encode(audio_data).decode('utf-8')
        }
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, timeout=aiohttp.ClientTimeout(total=10)) as response:
                if response.status == 200:
                    resp_json = await response.json()
                    results = resp_json.get('results', [])
                    
                    if results and len(results) > 0:
                        alternatives = results[0].get('alternatives', [])
                        if alternatives and len(alternatives) > 0:
                            transcript = alternatives[0].get('transcript', '').strip()
                            if transcript:
                                return transcript
                    return ""
                else:
                    return ""
                    
    except Exception:
        return ""

async def speak_elevenlabs(audio_source: rtc.AudioSource, text: str) -> bool:
    """Fast TTS with ElevenLabs"""
    
    if not text or len(text.strip()) == 0:
        return False
    
    await bot_state.set_speaking(True)
    await bot_state.set_interrupt(False)
    
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "text": text,
        "model_id": "eleven_turbo_v2_5",  # TURBO model for speed
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }
    
    success = False
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=15)) as response:
                if response.status == 200:
                    audio_bytes = await response.read()
                    
                    if not audio_bytes or len(audio_bytes) == 0:
                        return False
                    
                    try:
                        audio_segment = AudioSegment.from_mp3(io.BytesIO(audio_bytes))
                        audio_segment = audio_segment.set_frame_rate(48000).set_channels(1).set_sample_width(2)
                        
                        await stream_audio_to_livekit(audio_source, audio_segment.raw_data, 48000)
                        success = True
                    except Exception as e:
                        print(f"❌ Audio conversion: {e}")
                        return False
                        
    except Exception as e:
        print(f"❌ TTS error: {e}")
    finally:
        await bot_state.set_speaking(False)
    
    return success

async def stream_audio_to_livekit(audio_source: rtc.AudioSource, raw_audio: bytes, sample_rate: int):
    """Fast audio streaming"""
    
    if not raw_audio or len(raw_audio) == 0:
        return
    
    frame_duration_ms = 20
    frame_size = int(sample_rate * 2 * (frame_duration_ms / 1000))
    
    try:
        for i in range(0, len(raw_audio), frame_size):
            if await bot_state.get_interrupt():
                break
            
            chunk = raw_audio[i:i + frame_size]
            if not chunk:
                break
            
            if len(chunk) < frame_size:
                chunk = chunk + b'\x00' * (frame_size - len(chunk))
            
            try:
                audio_frame = rtc.AudioFrame(
                    data=chunk,
                    sample_rate=sample_rate,
                    num_channels=1,
                    samples_per_channel=len(chunk) // 2
                )
                await audio_source.capture_frame(audio_frame)
            except Exception:
                break
            
            await asyncio.sleep(frame_duration_ms / 1000)
            
    except Exception:
        pass

if __name__ == "__main__":
    room_name = "9wFe70_a"
    asyncio.run(bot_join_room(room_name))