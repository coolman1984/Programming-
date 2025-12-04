import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';
import { createChatSession } from '../services/geminiService';
import { ChatMessage } from '../types';
import { GenerateContentResponse, Chat } from "@google/genai";
import ReactMarkdown from 'react-markdown';

const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm your AI Market Assistant using Gemini 3 Pro. Ask me about EGP, Gold trends, or global markets.",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
      try {
        chatSessionRef.current = createChatSession();
      } catch (e) {
        console.error("Failed to init chat", e);
      }
    }
    scrollToBottom();
  }, [isOpen, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await chatSessionRef.current.sendMessageStream({ message: input });
      
      let fullResponse = "";
      const modelMsgId = (Date.now() + 1).toString();
      
      // Add placeholder for streaming
      setMessages(prev => [...prev, {
        id: modelMsgId,
        role: 'model',
        text: '',
        timestamp: Date.now()
      }]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        const text = c.text || "";
        fullResponse += text;
        
        setMessages(prev => prev.map(msg => 
          msg.id === modelMsgId ? { ...msg, text: fullResponse } : msg
        ));
      }
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I'm having trouble connecting to the network right now. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-[#0f172a] border border-slate-700 w-[350px] h-[500px] rounded-2xl shadow-2xl flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 p-1.5 rounded-lg">
                <Bot size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Gemini Assistant</h3>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Gemini 3 Pro Active
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <Minimize2 size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#020617]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`
                    max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed
                    ${msg.role === 'user' 
                      ? 'bg-primary text-white rounded-br-none' 
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'}
                  `}
                >
                  {msg.role === 'model' ? (
                     <ReactMarkdown className="prose prose-invert prose-xs max-w-none">{msg.text}</ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 rounded-2xl p-3 rounded-bl-none flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 bg-slate-900 border-t border-slate-800">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the market..."
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-primary transition-colors"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110
          ${isOpen ? 'bg-slate-700 text-white rotate-90' : 'bg-gradient-to-r from-primary to-blue-600 text-white animate-bounce-subtle'}
        `}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};

export default AIChatWidget;