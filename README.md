# Türk Hukuk Chatbot

Türk Tüketici Hukuku hakkında sorularınızı yanıtlayan yapay zeka destekli chatbot.

## 📁 Proje Yapısı

```
kds-chatbot/
├── Frontend/          # React Vite uygulaması
│   ├── src/
│   │   ├── assets/    # Lottie animasyonları
│   │   ├── App.jsx    # Ana uygulama
│   │   └── ...
│   └── package.json
│
├── Backend/           # Flask API sunucusu
│   ├── app.py         # Ana sunucu dosyası
│   ├── model_files/   # Model adaptör dosyaları
│   └── requirements.txt
│
└── README.md
```

## 🚀 Kurulum

### Backend Kurulumu

1. Backend klasörüne gidin:
```bash
cd Backend
```

2. Sanal ortam oluşturun (önerilir):
```bash
python -m venv venv
source venv/bin/activate  # macOS/Linux
# veya
.\venv\Scripts\activate   # Windows
```

3. Bağımlılıkları yükleyin:
```bash
pip install -r requirements.txt
```

4. Sunucuyu başlatın:
```bash
python app.py
```

Sunucu `http://localhost:5001` adresinde çalışacaktır.

### Frontend Kurulumu

1. Yeni bir terminal açın ve Frontend klasörüne gidin:
```bash
cd Frontend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

Frontend `http://localhost:5173` adresinde çalışacaktır.

## 🔧 Kullanım

1. Önce Backend sunucusunu başlatın
2. Ardından Frontend'i başlatın
3. Tarayıcınızda `http://localhost:5173` adresine gidin
4. Türkçe sorularınızı yazın ve yanıt alın!

## 📋 API Endpoints

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/health` | GET | Model durumunu kontrol et |
| `/api/answer` | POST | Soru sor ve yanıt al |

## 🛠️ Teknolojiler

### Frontend
- React 18
- Vite
- Lottie React (animasyonlar için)

### Backend
- Flask
- Transformers (Hugging Face)
- PyTorch
- PEFT (LoRA adaptörleri)

## 📝 Notlar

- Bu chatbot yalnızca Türkçe desteklemektedir
- Model, Türk Tüketici Hukuku üzerine eğitilmiştir
- Profesyonel hukuki danışmanlık yerine geçmez