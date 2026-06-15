import time
import os
import tempfile
from gtts import gTTS

class VoicePipelineService:
    def process_voice_pipeline(self, audio_data_bytes: bytes) -> dict:
        t0 = time.time()
        
        # 1. Simulate Speech-To-Text (STT) Latency
        time.sleep(0.12) # ~120ms standard Deepgram STT
        stt_latency = int((time.time() - t0) * 1000)
        
        # Simulated transcription
        user_transcript = "How can we reduce the dialogue barge-in latency of vocal bots?"
        
        # 2. Simulate LLM generation latency
        t_llm = time.time()
        time.sleep(0.18) # ~180ms generation
        llm_latency = int((time.time() - t_llm) * 1000)
        
        ai_response = (
            "We reduce voice turnaround times by implementing sentence-level chunked pipelines, "
            "reusing persistent WebSockets, and immediately muting audio outputs upon barge-in signal detection."
        )
        
        # 3. Simulate Text-To-Speech (TTS) synthesizer latency
        t_tts = time.time()
        temp_dir = tempfile.gettempdir()
        tts_file = os.path.join(temp_dir, f"synthesized_{int(time.time())}.mp3")
        try:
            tts = gTTS(text=ai_response, lang="en")
            tts.save(tts_file)
        except Exception:
            # Fallback mock empty file
            with open(tts_file, "wb") as f:
                f.write(b"")
        tts_latency = int((time.time() - t_tts) * 1000)
        
        total_latency = stt_latency + llm_latency + tts_latency
        
        return {
            "user_transcript": user_transcript,
            "ai_response": ai_response,
            "metrics": {
                "stt_ms": stt_latency,
                "llm_ms": llm_latency,
                "tts_ms": tts_latency,
                "total_turnaround_ms": total_latency
            },
            "audio_path": tts_file
        }
