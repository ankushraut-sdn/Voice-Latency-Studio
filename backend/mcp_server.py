import sys
import json
from app.services.voice_pipeline import VoicePipelineService

def read_message():
    line = sys.stdin.readline()
    if not line: return None
    return json.loads(line)

def write_message(msg):
    sys.stdout.write(json.dumps(msg) + "\n")
    sys.stdout.flush()

def main():
    while True:
        try:
            msg = read_message()
            if msg is None: break
            msg_id = msg.get("id")
            method = msg.get("method")
            params = msg.get("params", {})
            
            if method == "initialize":
                write_message({"jsonrpc": "2.0", "id": msg_id, "result": {"protocolVersion": "2024-11-05", "serverInfo": {"name": "voice-mcp", "version": "1.0.0"}}})
            elif method == "tools/list":
                write_message({"jsonrpc": "2.0", "id": msg_id, "result": {"tools": [
                    {"name": "measure_voice_turnaround", "description": "Trigger simulated STT->LLM->TTS turnaround times to audit vocal latencies.", "inputSchema": {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }}
                ]}})
            elif method == "tools/call":
                tool_name = params.get("name")
                if tool_name == "measure_voice_turnaround":
                    gen = VoicePipelineService()
                    tr = gen.process_voice_pipeline(b"")
                    write_message({"jsonrpc": "2.0", "id": msg_id, "result": {"content": [{"type": "text", "text": json.dumps(tr["metrics"])}]}})
        except Exception as e:
            write_message({"jsonrpc": "2.0", "error": {"code": -32603, "message": str(e)}})

if __name__ == "__main__":
    main()
