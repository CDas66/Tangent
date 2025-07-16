import whisper
import sounddevice as sd
from scipy.io.wavfile import write
import tempfile

# Load Whisper model
model = whisper.load_model("base")  # You can also try "small" or "medium"

def listen_whisper(duration=5, sample_rate=16000):
    print("🎤 Listening... Speak now.")
    recording = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=1)
    sd.wait()

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmpfile:
        write(tmpfile.name, sample_rate, recording)
        result = model.transcribe(tmpfile.name, language=None)
        text = result["text"].strip()
        print(f"You (voice): {text}")
        return text

if __name__ == "__main__":
    listen_whisper()