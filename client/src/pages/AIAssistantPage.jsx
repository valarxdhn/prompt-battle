// client/src/pages/AIAssistantPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Bus, ArrowRight, RotateCcw } from 'lucide-react';
import { useTransit } from '../context/TransitContext';

export default function AIAssistantPage() {
  const { 
    buses, 
    stops, 
    userOriginStopId, 
    userDestinationCampusId, 
    setSelectedBus, 
    setActiveTab 
  } = useTransit();

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I'm Routey, your Student Travel Assistant. Ask me when to board, which bus will have seats, or when to avoid the morning rush.`,
      timestamp: 'Just now',
      suggestedFollowUps: [
        "I need to reach college by 9 AM. Which bus should I take?",
        "Which bus will be less crowded?",
        "Should I take the next bus or wait for another one?",
        "When is the least crowded time to travel?"
      ]
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText = null) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!queryText) setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          conversationHistory: messages.slice(-4),
          userOriginStopId,
          userDestinationId: userDestinationCampusId
        })
      });

      const data = await res.json();

      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || "I analyzed your route, but could not retrieve matching buses right now.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedBus: data.recommendedBus || null,
        suggestedFollowUps: data.suggestedFollowUps || []
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: "Sorry, I had trouble reaching the transit server. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[640px] bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-white text-sm">Routey AI Travel Assistant</div>
            <div className="text-[11px] text-slate-400">Context-aware recommendations from live transit data</div>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="p-1.5 text-slate-400 hover:text-slate-200 text-xs rounded-lg hover:bg-slate-800"
          title="Clear Chat"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-line space-y-1.5">
                {msg.text.split('\n\n').map((para, i) => {
                  if (para.startsWith('### ')) {
                    return <h4 key={i} className="font-bold text-white text-sm">{para.replace('### ', '')}</h4>;
                  }
                  if (para.startsWith('> ')) {
                    return (
                      <blockquote key={i} className="border-l-2 border-indigo-400 pl-2.5 italic text-slate-300 my-1 bg-indigo-500/5 py-0.5 rounded-r">
                        {para.replace('> ', '')}
                      </blockquote>
                    );
                  }
                  return <p key={i}>{para}</p>;
                })}
              </div>

              {msg.recommendedBus && (
                <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-white flex items-center gap-1.5">
                    <Bus className="w-3.5 h-3.5 text-indigo-400" />
                    {msg.recommendedBus.busNumber}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedBus(msg.recommendedBus);
                      setActiveTab('transit');
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    Track on Map <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <span className="text-[10px] text-slate-500 mt-1 px-1 font-mono">
              {msg.timestamp}
            </span>

            {/* Quick chips */}
            {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 max-w-[85%]">
                {msg.suggestedFollowUps.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(chip)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-[11px] text-indigo-300 border border-slate-700/60 transition-colors text-left"
                  >
                    💬 {chip}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 animate-pulse bg-slate-950 p-2.5 rounded-xl border border-slate-800 max-w-xs">
            <Bot className="w-3.5 h-3.5" />
            <span>Analyzing schedules & crowd levels...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask Routey: 'Which bus is less crowded?' or 'Reach by 9 AM'..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
