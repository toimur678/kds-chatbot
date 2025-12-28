import { useState, useEffect, useRef } from 'react'
import Lottie from 'lottie-react'
import talkingCharacter from './assets/talking-support-agent.json'
import loadingAnimation from './assets/Material wave loading.json'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  const messagesEndRef = useRef(null)
  const lottieRef = useRef(null)

  useEffect(() => {
    checkModelStatus()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, isTyping])

  // Control character animation based on typing state
  useEffect(() => {
    if (lottieRef.current) {
      if (isTyping) {
        lottieRef.current.play()
      } else {
        lottieRef.current.stop()
      }
    }
  }, [isTyping])

  const checkModelStatus = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/health')
      if (response.ok) {
        setModelLoaded(true)
        console.log('✓ Model bağlantısı kuruldu')
      }
    } catch (error) {
      console.error('Sunucu bağlantısı kurulamadı:', error)
      setModelLoaded(false)
      setTimeout(checkModelStatus, 3000)
    }
  }

  const typeWriterEffect = async (text) => {
    setIsTyping(true)
    let currentText = ''
    
    // Create a new empty message for the assistant
    setMessages(prev => [...prev, { role: 'assistant', text: '' }])
    
    const chars = text.split('')
    const chunkSize = 3 // Process 3 characters at a time for faster streaming
    
    for (let i = 0; i < chars.length; i += chunkSize) {
      // Add chunk of characters at once
      const chunk = chars.slice(i, Math.min(i + chunkSize, chars.length)).join('')
      currentText += chunk
      
      // Use RAF for smoother updates
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          setMessages(prev => {
            const newMessages = [...prev]
            newMessages[newMessages.length - 1].text = currentText
            return newMessages
          })
          setTimeout(resolve, 10) // Reduced from 30ms to 10ms per chunk
        })
      })
    }
    
    setIsTyping(false)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || !modelLoaded || loading || isTyping) return

    // Start animation when user sends message
    if (lottieRef.current) {
      lottieRef.current.play()
    }

    const userQuestion = input.trim()
    const userMessage = { role: 'user', text: userQuestion }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5001/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userQuestion }),
      })

      if (!response.ok) {
        throw new Error('Yanıt alınamadı')
      }

      const data = await response.json()
      setLoading(false)
      // Start streaming effect
      await typeWriterEffect(data.answer)
      
    } catch (error) {
      console.error('Hata:', error)
      setLoading(false)
      const errorMessage = {
        role: 'assistant',
        text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  const handleExampleClick = (question) => {
    setInput(question)
  }

  const exampleQuestions = [
    'Garanti belgesi nedir?',
    'İade süresi kaç gün?',
    'Elektronik ürünlerin garantisi kaç yıl?',
    'Tüketici hakem heyetine nasıl başvurabilirim?',
  ]

  return (
    <div className="app-container">
      {/* Legal Tech Header */}
      <header className="legal-header">
        <div className="header-left">
          <h1>TÜRK HUKUK ASİSTANI</h1>
        </div>

        <div className="header-center">
          <div className="character-wrapper">
            <Lottie 
              lottieRef={lottieRef}
              animationData={talkingCharacter} 
              loop={true}
              autoplay={false}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
        
        <div className="header-right">
          <div className={`status-badge ${modelLoaded ? 'connected' : 'connecting'}`}>
            <span className="status-dot"></span>
            {modelLoaded ? 'SİSTEM AKTİF' : 'BAĞLANIYOR...'}
          </div>
        </div>
      </header>

      <div className="chat-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <h3>HIZLI SORULAR</h3>
          {exampleQuestions.map((q, idx) => (
            <button 
              key={idx} 
              className="example-btn"
              onClick={() => handleExampleClick(q)}
            >
              {q}
            </button>
          ))}
          
          <div style={{ marginTop: 'auto', fontSize: '0.8rem', opacity: 0.7 }}>
            <p></p>
          </div>
        </aside>

        {/* Main Chat Window */}
        <main className="chat-window">
          <div className="messages-area">
            {messages.length === 0 && (
              <div className="welcome-screen">
                <h2>Hukuki Asistanınız</h2>
                <p>Tüketici hakları ile ilgili sorularınızı yanıtlamak için hazırım.</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <span className="message-role">{msg.role === 'user' ? 'SİZ' : 'ASİSTAN'}</span>
                <div className="message-bubble">
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="message assistant">
                <span className="message-role">ASİSTAN</span>
                <div className="message-bubble loading-bubble">
                  <div className="loading-anim-wrapper">
                    <Lottie animationData={loadingAnimation} loop={true} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form className="input-area" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              className="chat-input" 
              placeholder="Hukuki sorunuzu buraya yazın..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading || isTyping || !modelLoaded}
            />
            <button 
              type="submit" 
              className="send-btn"
              disabled={loading || isTyping || !modelLoaded || !input.trim()}
            >
              GÖNDER
            </button>
          </form>
        </main>
      </div>
    </div>
  )
}

export default App
