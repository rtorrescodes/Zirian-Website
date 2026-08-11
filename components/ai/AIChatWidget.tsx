// @ts-nocheck
'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = async (message: any) => {
    setIsLoading(true);
    setError(null);
    const newMessages = [...messages, message];
    setMessages(newMessages);
    setInput('');
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${await res.text()}`);
      }
      const data = await res.json();
      setMessages([...newMessages, { id: Date.now().toString(), ...data }]);
    } catch (err: any) {
      console.error(err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 rounded-full bg-brand-blue hover:bg-brand-blue/90 text-slate-950 shadow-[0_0_20px_rgba(0,163,255,0.4)] transition-all z-50 flex items-center justify-center group"
          title="Zirian AI Assistant"
        >
          <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`fixed right-6 bottom-6 bg-slate-950/95 backdrop-blur-xl border border-slate-800 shadow-2xl flex flex-col z-50 transition-all duration-300 ${
            isExpanded ? 'w-[80vw] h-[80vh] rounded-2xl' : 'w-96 h-[500px] rounded-2xl'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-900/50 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Zirian AI</h3>
                <p className="text-[10px] text-brand-blue font-tech tracking-widest uppercase">Asistente de Ventas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <Bot className="w-12 h-12 text-slate-500" />
                <p className="text-sm text-slate-400">
                  ¡Hola! Soy Zirian AI. Dime qué necesitas:<br/>
                  <span className="text-xs italic">"Agrega un cliente llamado Juan..."</span><br/>
                  <span className="text-xs italic">"Prepara una cotización para el cliente 5..."</span>
                </p>
              </div>
            )}
            
            {messages.map((m: any) => (
              <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role !== 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700 text-brand-blue">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                
                <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                  m.role === 'user' 
                    ? 'bg-brand-blue text-slate-950 rounded-br-none' 
                    : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-bl-none'
                }`}>
                  {m.content ? m.content : null}
                  {m.toolInvocations?.map((tool: any) => (
                    <div key={tool.toolCallId} className="mt-2 text-xs bg-slate-950/50 p-2 rounded border border-slate-800 font-mono text-slate-400">
                      <div className="text-emerald-400 mb-1 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        Ejecutando: {tool.toolName}
                      </div>
                      {'result' in tool ? (
                        <div className="text-slate-300 mt-1 whitespace-pre-wrap">
                          {JSON.stringify(tool.result, null, 2)}
                        </div>
                      ) : (
                        <span className="animate-pulse">Procesando...</span>
                      )}
                    </div>
                  ))}
                </div>
                
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700 text-white">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
               <div className="flex gap-3 justify-start">
                 <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700 text-brand-blue">
                   <Bot className="w-4 h-4" />
                 </div>
                 <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none p-4 flex items-center gap-1">
                   <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce"></div>
                   <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                   <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                 </div>
               </div>
            )}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm">
                <p className="font-bold">Error del Asistente:</p>
                <p>{error.message || "Asegúrate de tener la DEEPSEEK_API_KEY en tu .env"}</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-900/50 rounded-b-2xl">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!input.trim()) return;
              sendMessage({ id: Date.now().toString(), role: 'user', content: input });
            }} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu petición aquí..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue transition-colors"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="bg-brand-blue hover:bg-brand-blue/80 text-slate-950 h-auto aspect-square p-0 rounded-xl transition-all"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
