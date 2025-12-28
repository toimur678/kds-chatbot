from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
import os

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:3000"])

# Paths
BASE_MODEL = "google/gemma-2b-it"
ADAPTER_PATH = "../Model"

print("=" * 60)
print("Türk Hukuk Chatbot Modeli Yükleniyor...")
print("=" * 60)

try:
    print(f"Ana model yükleniyor: {BASE_MODEL}")
    model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL,
        torch_dtype=torch.float16,
        device_map="auto"
    )
    print("✓ Ana model yüklendi")
    
    print(f"LoRA adaptörleri yükleniyor: {ADAPTER_PATH}")
    model = PeftModel.from_pretrained(model, ADAPTER_PATH)
    print("✓ LoRA adaptörleri yüklendi")
    
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
    print("✓ Model başarıyla yüklendi!")
except Exception as e:
    print(f"✗ Model yükleme hatası: {e}")
    model = None
    tokenizer = None

@app.route('/api/health', methods=['GET'])
def health():
    """Model durumunu kontrol et"""
    if model is not None and tokenizer is not None:
        return jsonify({"status": "ok", "message": "Model hazır"})
    else:
        return jsonify({"status": "error", "message": "Model yüklenmedi"}), 500

@app.route('/api/answer', methods=['POST'])
def answer_question():
    """Soru için yanıt üret"""
    if model is None or tokenizer is None:
        return jsonify({"error": "Model yüklenmedi"}), 500

    try:
        data = request.json
        question = data.get('question', '')

        if not question:
            return jsonify({"error": "Soru girilmedi"}), 400

        print(f"\nSoru: {question}")

        # Prompt oluştur
        prompt = f"### Soru:\n{question}\n\n### Yanıt:\n"

        # Tokenize
        inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512)
        inputs = {k: v.to(model.device) for k, v in inputs.items()}

        # Yanıt üret
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=256,
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )

        # Yanıtı decode et
        answer = tokenizer.decode(outputs[0], skip_special_tokens=True)
        answer = answer.split("### Yanıt:")[-1].strip()

        print(f"✓ Yanıt: {answer[:100]}...")

        return jsonify({"answer": answer})

    except Exception as e:
        print(f"✗ Hata: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("\nFlask sunucusu başlatılıyor: http://localhost:5001")
    print("=" * 60)
    app.run(debug=False, port=5001, host='0.0.0.0')
