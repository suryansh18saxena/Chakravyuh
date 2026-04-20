import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = `http://${window.location.hostname}:3001`;

const SYSTEM_PROMPT = {
  role: 'system',
  content: `You are Chakravyuh AI — an expert cybersecurity assistant embedded in a honeypot defense dashboard called "Chakravyuh". 
You help security analysts understand attacks, analyze payloads, interpret threat data, and provide defensive recommendations.
Keep answers concise, technical, and actionable. Use plain text, no markdown formatting.`
};

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m Chakravyuh AI. Ask me anything about cybersecurity, attack analysis, or honeypot defense.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const apiMessages = [
        SYSTEM_PROMPT,
        ...updatedMessages.map(m => ({ role: m.role, content: m.content }))
      ];

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'No response received.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. The backend may be offline.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-6 z-[90] w-14 h-14 rounded-full bg-gradient-to-br from-cyber-accent-red to-cyber-accent-blue flex items-center justify-center shadow-lg shadow-cyber-accent-red/30 cursor-pointer"
            id="ai-chat-toggle"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-[90] w-[400px] max-h-[550px] rounded-2xl overflow-hidden border border-cyber-border bg-cyber-card flex flex-col shadow-2xl shadow-black/50"
            id="ai-chat-panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-cyber-border bg-gradient-to-r from-cyber-card to-cyber-elevated">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyber-accent-red to-cyber-accent-blue flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-heading font-bold text-white text-sm">Chakravyuh AI</p>
                  <p className="font-mono text-[10px] text-cyber-accent-success tracking-widest">ONLINE • GROK POWERED</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg border border-cyber-border flex items-center justify-center text-cyber-text-secondary hover:text-white hover:border-cyber-accent-red transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[380px]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-cyber-accent-blue/20 border border-cyber-accent-blue/30 text-white rounded-br-md'
                        : 'bg-cyber-elevated border border-cyber-border text-cyber-text-primary rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-cyber-elevated border border-cyber-border text-cyber-text-secondary text-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-cyber-border bg-cyber-card">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about threats, payloads, defense..."
                  className="flex-1 bg-cyber-bg border border-cyber-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-cyber-text-secondary/50 outline-none focus:border-cyber-accent-blue transition-colors"
                  id="ai-chat-input"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="w-11 h-11 rounded-xl bg-cyber-accent-red hover:bg-cyber-accent-red/80 flex items-center justify-center text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  id="ai-chat-send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
