'use client';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [memories, setMemories] = useState([]);
  const [showMemories, setShowMemories] = useState(false);
  const userId = 'user_001';
  const sessionId = 'session_' + Date.now();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    fetchMemories();
  }, []);

  async function fetchMemories() {
    const res = await fetch(`/api/memory?userId=${userId}`);
    const data = await res.json();
    setMemories(data.memories || []);
  }

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, userId, sessionId, history: newHistory }),
      });
      const data = await res.json();
      setMessages([...newHistory, { role: 'assistant', content: data.reply }]);
      fetchMemories();
    } catch (e) {
      setMessages([...newHistory, { role: 'assistant', content: 'Error. Try again.' }]);
    }
    setLoading(false);
  }

  async function forgetMemory(id) {
    await fetch('/api/memory', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ memoryId: id }) });
    fetchMemories();
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#080c14', color: '#e2eaf4', fontFamily: 'monospace' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1a2d44', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#00d4ff', fontWeight: 'bold', fontSize: '20px' }}>QwenMind</span>
            <span style={{ color: '#5a7a99', fontSize: '12px', marginLeft: '8px' }}>persistent memory AI</span>
          </div>
          <button onClick={() => setShowMemories(!showMemories)} style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
            🧠 {memories.length} memories
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#5a7a99', marginTop: '60px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
              <div style={{ fontSize: '18px', color: '#00d4ff' }}>QwenMind</div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>I remember everything you tell me across sessions.</div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: '16px', display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '75%', padding: '12px 16px', borderRadius: '12px', background: m.role === 'user' ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${m.role === 'user' ? 'rgba(0,212,255,0.3)' : '#1a2d44'}`, fontSize: '14px', lineHeight: '1.6' }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div style={{ color: '#5a7a99', fontSize: '14px' }}>QwenMind is thinking...</div>}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1a2d44', display: 'flex', gap: '8px' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid #1a2d44', color: '#e2eaf4', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
          <button onClick={sendMessage} disabled={loading} style={{ background: '#00d4ff', color: '#080c14', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Send</button>
        </div>
      </div>
      {showMemories && (
        <div style={{ width: '280px', borderLeft: '1px solid #1a2d44', padding: '16px', overflowY: 'auto' }}>
          <div style={{ color: '#00d4ff', fontWeight: 'bold', marginBottom: '16px' }}>🧠 Memory Vault</div>
          {memories.length === 0 ? <div style={{ color: '#5a7a99', fontSize: '13px' }}>No memories yet. Start chatting!</div> : memories.map(m => (
            <div key={m.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1a2d44', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
              <div style={{ fontSize: '12px', color: '#e2eaf4', marginBottom: '4px' }}>{m.fact}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: '#5a7a99' }}>{m.category}</span>
                <button onClick={() => forgetMemory(m.id)} style={{ background: 'none', border: 'none', color: '#ff6b35', cursor: 'pointer', fontSize: '10px' }}>forget</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
