# Voice-Latency-Studio

## 1. Project Overview

**Project Type:** Full-stack proof-of-concept (FastAPI backend + React frontend)
**Status:** Development

A voice-pipeline latency profiler: a FastAPI backend simulates a speech-to-text -> LLM -> text-to-speech turn and reports the latency of each stage, and a React + Vite frontend provides a dashboard to try it.

The `VoicePipelineService` (`backend/app/services/voice_pipeline.py`) simulates STT and LLM latency with fixed `sleep` delays and a hardcoded transcript/response, then synthesizes the response audio for real using `gTTS` and reports per-stage and total latency in milliseconds.

## 2. Core Features

- FastAPI backend with a versioned API (`app/api/v1`) and a voice-pipeline service layer
- Per-stage latency measurement (STT, LLM generation, TTS synthesis) plus total turnaround time
- Real text-to-speech synthesis via `gTTS`; STT and LLM stages are currently simulated placeholders
- React 18 + Vite single-page frontend dashboard
- Backend serves the built frontend as static files when `frontend/dist` exists, so the whole app runs as one process
- `mcp_server.py`: a stdio JSON-RPC Model Context Protocol server exposing a voice-turnaround measurement tool so AI agents/clients can call the service directly
- Multi-stage Dockerfile (Node build stage + Python runtime stage) for a single deployable image

## 3. Tech Stack

| Component | Technology |
|---|---|
| Backend | FastAPI, Uvicorn, Pydantic, gTTS |
| Frontend | React 18, Vite |
| Packaging | Docker (multi-stage: `node:18-alpine` build + `python:3.10-slim` runtime) |

## 4. Project Structure

```
Voice-Latency-Studio/
├── frontend/           # React 18 + Vite client
│   ├── src/App.jsx
│   └── vite.config.js
├── backend/
│   ├── app/
│   │   ├── core/       # configuration
│   │   ├── api/v1/     # routes
│   │   └── services/   # voice pipeline + latency logic
│   ├── mcp_server.py   # MCP stdio server
│   ├── app.py          # entrypoint used by the Docker image
│   └── requirements.txt
├── Dockerfile
└── .dockerignore
```

## 5. Prerequisites

- Python 3.10+
- Node.js 18+ (for frontend dev/build)
- Docker (optional, for the packaged image)

## 6. How to Run

### Local development

```bash
cd backend
pip install -r requirements.txt
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

In a separate terminal, for frontend dev with hot reload:

```bash
cd frontend
npm install
npm run dev
```

### Docker

```bash
docker build -t voice-latency-studio .
docker run -p 8000:8000 voice-latency-studio
```

Then open `http://localhost:8000`.

## 7. API Documentation

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/run` | Runs the simulated STT -> LLM -> TTS turn and returns per-stage latency plus synthesized audio. |
| GET | `/api/v1/tts/{filename}` | Fetches a previously synthesized audio file. |
| GET | `/` | Serves the built frontend, when present. |

## 8. Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DEEPGRAM_API_KEY` | `dummy-deepgram` | Declared for a future real STT integration; not currently used to call Deepgram. |
| `OPENAI_API_KEY` | `dummy-openai` | Declared for a future real LLM integration; not currently used to call OpenAI. |

## 9. Known Limitations

- STT and LLM stages are simulated with fixed delays and hardcoded text, not real model calls. Only TTS synthesis (via `gTTS`) is real.
- `DEEPGRAM_API_KEY` / `OPENAI_API_KEY` are declared with dummy defaults but not yet wired into any actual API call.
- No automated tests currently exist in the repository.

## License

No LICENSE file is present in this repository.
