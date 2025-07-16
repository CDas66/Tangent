from flask import Flask, request, Response
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    prompt = data.get("prompt", "")

    def generate():
        try:
            ollama_response = requests.post("http://localhost:11434/api/generate", json={
                "model": "llama3",
                "prompt": prompt,
                "stream": True
            }, stream=True)

            for line in ollama_response.iter_lines():
                if line:
                    decoded = line.decode("utf-8").strip()
                    if decoded.startswith("data:"):
                        decoded = decoded[5:].strip()
                    try:
                        obj = json.loads(decoded)
                        if "response" in obj:
                            yield obj["response"]
                    except json.JSONDecodeError:
                        continue
        except Exception as e:
            print(f"❌ Stream error: {e}")
            yield "[Error streaming from backend]"

    return Response(generate(), mimetype="text/plain")

if __name__ == "__main__":
    app.run(port=5000)
