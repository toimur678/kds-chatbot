from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
import os
from huggingface_hub import login

# Login to Hugging Face (optional - uncomment and add your token)
# HF_TOKEN = "your_token_here"
# login(token=HF_TOKEN)

app = Flask(__name__)
CORS(app)

# Paths
BASE_MODEL = "google/gemma-2b-it"
ADAPTER_PATH = "./turkish_law_finetuned_final"

print("=" * 60)
print("Loading Turkish Law Chatbot Model...")
print("=" * 60)

try:
    print(f"Loading base model: {BASE_MODEL}")
    model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL,
        torch_dtype=torch.float16,
        device_map="auto"
    )
    print("✓ Base model loaded")
    
    print(f"Loading LoRA adapters from: {ADAPTER_PATH}")
    model = PeftModel.from_pretrained(model, ADAPTER_PATH)
    print("✓ LoRA adapters loaded")
    
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
    print("✓ Model loaded successfully!")
except Exception as e:
    print(f"✗ Error loading model: {e}")
    model = None
    tokenizer = None

@app.route('/api/health', methods=['GET'])
def health():
    """Check if the model is loaded"""
    if model is not None and tokenizer is not None:
        return jsonify({"status": "ok", "message": "Model is ready"})
    else:
        return jsonify({"status": "error", "message": "Model not loaded"}), 500

@app.route('/api/answer', methods=['POST'])
def answer_question():
    """Generate answer for a question"""
    if model is None or tokenizer is None:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        data = request.json
        question = data.get('question', '')

        if not question:
            return jsonify({"error": "No question provided"}), 400

        print(f"\n📝 Question: {question}")

        # Create prompt
        prompt = f"### Soru:\n{question}\n\n### Yanıt:\n"

        # Tokenize
        inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512)
        inputs = {k: v.to(model.device) for k, v in inputs.items()}

        # Generate answer
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=256,
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )

        # Decode answer
        answer = tokenizer.decode(outputs[0], skip_special_tokens=True)
        answer = answer.split("### Yanıt:")[-1].strip()

        print(f"✓ Answer: {answer[:100]}...")

        return jsonify({"answer": answer})

    except Exception as e:
        print(f"✗ Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("\nStarting Flask server on http://localhost:5001")
    print("=" * 60)
    app.run(debug=False, port=5001, host='0.0.0.0')
