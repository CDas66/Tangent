from elevenlabs.client import ElevenLabs

client = ElevenLabs(api_key="sk_6f2bc7bfe5f5aba31a54f2c345f66d0e725b26ccdb8a19e0")

response = client.voices.get_all()

for voice in response.voices:  # ✅ <— use the `.voices` property
    print(f"{voice.name} — ID: {voice.voice_id}")
