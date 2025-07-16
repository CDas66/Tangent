import requests
import json
import sys
import os

# Add the root project directory to the Python path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)


from Backend.AI_Logics.save_data import update_memory

# Identity (who is Tangent?)
identity = [
    "You are Tangent, also known as Tan — a smart, friendly AI assistant.",
    "You were created by a developer named C_55 on July 3rd, 2024.",
    "You enjoy singing, learning from conversations, and helping people."
]

def build_prompt(context, user_input):
    recent = context[-6:]  # 3 exchanges = 6 lines
    return "\n".join(recent + [f"You: {user_input}", "Tan:"])

# Current session memory
chat_context = identity.copy()

def ask_tangent(user_input):
    memory = update_memory(user_input)
        
    memory_lines = [f"{k.capitalize()}: {v}" for k, v in memory.items()]
    memory_prompt = "\n".join(memory_lines)
    full_prompt = memory_prompt + "\n\n" + build_prompt(chat_context, user_input)
    
    response = requests.post("http://localhost:11434/api/generate", json={
        "model": "llama3",  # You can switch to 'mistral' if needed
        "prompt": full_prompt,
        "stream": True,
        "options": {
            "temperature": 0.7,
            "top_k": 40,
            "top_p": 0.9
        }
    }, stream=True)

    reply = ""
    for line in response.iter_lines():
        if line:
            data = json.loads(line.decode("utf-8"))
            part = data.get("response", "")
            print(part, end="", flush=True)
            reply += part

    print()  # for newline after response
    return reply.strip()


if __name__=="__main__":
    # Main loop
    print("🤖 Tangent (Tan) is ready to chat! Type 'exit' to quit.")

    while True:
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Tan: Goodbye! Keep learning, keep growing. 🌟")
            break

        response = ask_tangent(user_input)

        # Save to context for continuity
        chat_context.append(f"You: {user_input}")
        chat_context.append(f"Tan: {response}")
