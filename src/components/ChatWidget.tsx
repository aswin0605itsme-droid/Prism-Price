import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { chatWithAI } from '../services/geminiService';
import GlassCard from './GlassCard';
import { cn } from '../lib/utils';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, text: string}[]>([
    { role: 'model', text: 'Hi! I can help you find products or compare prices.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setMessages(p => [...p, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
    const response = await chatWithAI(userMsg, history);
    
    setMessages(p => [...p, { role: 'model', text: response }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {isOpen ? (
        <GlassCard className="w-[360px] h-[500px] flex flex-col p-0 animate-in slide-in-from-bottom-10 shadow-2xl">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-indigo-500/10">
            <div className="flex items-center gap-2 font-bold text-white">
              <Bot className="w-5 h-5 text-indigo-400" /> Prism AI
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[80%] rounded-2xl p-3 text-sm",
                  m.role === 'user' ? "bg-indigo-600 text-white rounded-br-none" : "bg-white/10 text-slate-200 rounded-bl-none"
                )}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
          <div className="p-3 border-t border-white/10 bg-white/5 flex gap-2">
            <input 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-slate-500"
              placeholder="Ask anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} disabled={loading} className="p-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </GlassCard>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.5)] flex items-center justify-center text-white hover:scale-110 transition-transform"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default ChatWidget;