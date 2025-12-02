import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadModel();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadModel = async () => {
    try {
      // Test backend connection
      const response = await fetch('http://localhost:5001/api/health');
      if (response.ok) {
        setModelLoaded(true);
        console.log('✓ Model backend connected');
      }
    } catch (error) {
      console.error('Backend not ready:', error);
      setModelLoaded(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !modelLoaded) return;

    const userQuestion = input;
    const userMessage = { role: 'user', text: userQuestion };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userQuestion }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const botMessage = { role: 'assistant', text: data.answer };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        text: 'Sorry, I could not get a response. Make sure the backend is running on port 5001.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="chat-header">
        <h1>🇹🇷 Turkish Law Chatbot</h1>
        <p className={modelLoaded ? 'ready' : 'loading'}>
          {modelLoaded ? '✓ Connected' : '⏳ Connecting...'}
        </p>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h2>Welcome to Turkish Law Chatbot</h2>
            <p>Ask any question about Turkish consumer law</p>
            <div className="example-questions">
              <p className="examples-title">Example questions:</p>
              <button onClick={() => setInput('Garanti belgesi nedir?')} className="example-btn">
                Garanti belgesi nedir?
              </button>
              <button onClick={() => setInput('İade süresi kaç gün?')} className="example-btn">
                İade süresi kaç gün?
              </button>
              <button onClick={() => setInput('Elektronik ürünlerin garantisi kaç yıl?')} className="example-btn">
                Elektronik ürünlerin garantisi kaç yıl?
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-content">
              <p>{msg.text}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="message-content">
              <p className="thinking">Thinking...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question in Turkish..."
          disabled={loading || !modelLoaded}
          autoFocus
        />
        <button type="submit" disabled={loading || !modelLoaded || !input.trim()}>
          {loading ? 'Waiting...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default App;
