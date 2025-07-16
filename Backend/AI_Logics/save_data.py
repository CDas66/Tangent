import os
import json
import requests
import re

MEMORY_FILE = "memory/core_facts.json"

# ------------------------------------------
# 1. LLaMA: Extract only important facts
# ------------------------------------------
def extract_important_facts(user_message):
    prompt = f"""
You are a memory extraction AI. From the user's message, extract only facts that are important for an assistant to remember.

Respond ONLY with valid JSON. Do NOT include any explanation or extra text.

Examples:
User: My name is Aditi and I love painting.
Output: {{
  "name": "Aditi",
  "likes": "painting"
}}

User: Hey i am chirayush speaking !
Output: {{
  "name": "Chirayush"
}}

User: i am 23.
Output: {{
  "age": "23"
}}

User: i love playing intrumets.
Output: {{
  "love to do": "playing instrument"
}}

User: Tell me a joke.
Output: {{}}

Now extract from this:
User: {user_message}
"""

    try:
        response = requests.post("http://localhost:11434/api/generate", json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.3,
                "top_k": 20,
                "top_p": 0.9
            }
        })

        if response.status_code != 200:
            print(f"❌ Error: Ollama response {response.status_code}")
            return {}

        result = response.json().get("response", "")

        # ✅ Extract the first JSON block from the response using regex
        match = re.search(r"\{[\s\S]*?\}", result)
        if match:
            json_text = match.group(0).strip()
            facts = json.loads(json_text)
            if isinstance(facts, dict):
                return facts

    except Exception as e:
        print(f"❌ Error extracting facts: {e}")

    return {}

# ------------------------------------------
# 2. Load and save memory
# ------------------------------------------
def load_memory():
    try:
        if os.path.exists(MEMORY_FILE):
            with open(MEMORY_FILE, "r") as f:
                return json.load(f)
    except Exception as e:
        print(f"❌ Error loading memory: {e}")
    return {}

def save_memory(memory):
    try:
        os.makedirs(os.path.dirname(MEMORY_FILE), exist_ok=True)
        with open(MEMORY_FILE, "w") as f:
            json.dump(memory, f, indent=2)
    except Exception as e:
        print(f"❌ Error saving memory: {e}")

# ------------------------------------------
# 3. Update memory from a user message
# ------------------------------------------
def update_memory(user_input):
    memory = load_memory()
    new_facts = extract_important_facts(user_input)

    if new_facts:
        memory.update(new_facts)
        save_memory(memory)
        print(f"🧠 Updated memory with: {new_facts}")
    else:
        print("ℹ️ No important facts to remember.")

    return memory
