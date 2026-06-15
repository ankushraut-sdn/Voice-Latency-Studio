from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
from app.services.voice_pipeline import VoicePipelineService
import shutil
import tempfile
import os

router = APIRouter()

@router.post("/run")
async def run_voice_pipeline(file: UploadFile = File(...)):
    temp_dir = tempfile.gettempdir()
    file_path = os.path.join(temp_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    service = VoicePipelineService()
    try:
        with open(file_path, "rb") as f:
            audio_bytes = f.read()
        res = service.process_voice_pipeline(audio_bytes)
        return {
            "success": True,
            "transcript": res["user_transcript"],
            "response": res["ai_response"],
            "metrics": res["metrics"],
            "audio_name": os.path.basename(res["audio_path"])
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

@router.get("/tts/{filename}")
async def get_synthesized_audio(filename: str):
    temp_dir = tempfile.gettempdir()
    file_path = os.path.join(temp_dir, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="audio/mpeg")
    return {"error": "Audio track not found."}
