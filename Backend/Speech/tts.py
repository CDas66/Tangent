from elevenlabs.client import ElevenLabs
from elevenlabs import play
from speech import listen_whisper

# 🔐 Set your API key
client = ElevenLabs(api_key="sk_6f2bc7bfe5f5aba31a54f2c345f66d0e725b26ccdb8a19e0")  # Replace with your real key

# 🎭 Simple emotion detector
def detect_emotion(text):
    text = text.lower()
    if any(w in text for w in ["yay", "happy", "awesome", "great", "love"]):
        return "cheerful"
    elif any(w in text for w in ["sad", "sorry", "miss", "regret"]):
        return "sad"
    elif any(w in text for w in ["angry", "stop", "what the", "mad"]):
        return "angry"
    elif text.endswith("?"):
        return "curious"
    return "neutral"

# 🔊 Speak with emotion
def speak(text):
    emotion = detect_emotion(text)

    # Map emotion to style intensity (0.0 to 1.0)
    emotion_styles = {
        "cheerful": 0.8,
        "sad": 0.4,
        "angry": 0.9,
        "curious": 0.6
    }

    # Voice settings based on emotion
    settings = {
        "stability": 0.4,
        "similarity_boost": 0.75
    }

    if emotion in emotion_styles:
        settings["style"] = emotion_styles[emotion]

    # Correct new method to get audio in SDK v1.1+
    audio = client.text_to_speech.convert(
        voice_id="iP95p4xoKVk53GoZ742B",
        model_id="eleven_multilingual_v2",
        text=text,
        voice_settings=settings
    )

    play(audio)

if __name__=="__main__":
    speak("BROO !!!! HELP MEE !!!!")