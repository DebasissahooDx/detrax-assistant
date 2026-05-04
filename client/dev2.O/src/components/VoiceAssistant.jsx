import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../api/axios";
import { Mic, X, Cpu, Activity, History, Trash2, Trash } from "lucide-react";

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/chat/history");
      setHistory(res.data);
    } catch (err) { console.error("Sync error"); }
  };

  const deleteOne = async (id) => {
    try {
      await api.delete(`/chat/${id}`);
      setHistory(prev => prev.filter(item => item._id !== id));
    } catch (err) { alert("Delete failed"); }
  };

  const clearAll = async () => {
    if (window.confirm("PURGE ENTIRE HISTORY?")) {
      try {
        await api.delete("/chat/history");
        setHistory([]);
      } catch (err) { alert("Purge failed"); }
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (e) => {
        const text = Array.from(e.results).map(result => result[0].transcript).join('');
        setTranscript(text);
        if (e.results[0].isFinal) {
          setIsListening(false);
          handleProcessCommand(text);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
    fetchHistory(); 
  }, []);

  const speak = useCallback((text) => {
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Selecting a clearer voice if available
    const voices = synthRef.current.getVoices();
    const selectedVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Female"));
    if (selectedVoice) utterance.voice = selectedVoice;
    
    utterance.rate = 1.05;
    synthRef.current.speak(utterance);
  }, []);

  const handleProcessCommand = async (text) => {
    if (!text.trim()) return;
    setIsLoading(true);
    setAiReply(""); // Clear old reply for new animation
    try {
      const res = await api.post("/chat", { message: text });
      const cleanReply = res.data.reply.replace(/[*_#`]/g, "");
      setAiReply(cleanReply); // THIS MAKES THE TEXT APPEAR IN THE UI
      speak(cleanReply);    // THIS PLAYS THE VOICE
      fetchHistory(); 
    } catch (err) { 
      setAiReply("Neural link severed."); 
      speak("Neural link severed.");
    } finally { 
      setIsLoading(false); 
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-around py-4 relative bg-black text-white">
      
      {/* HISTORY OVERLAY */}
      {showHistory && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl p-6 flex flex-col animate-in slide-in-from-right">
          <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
            <h2 className="text-cyan-500 font-black tracking-[0.3em] text-[10px]">NEURAL_LOGS</h2>
            <div className="flex gap-6">
              <button onClick={clearAll} className="text-red-900/60 hover:text-red-500"><Trash2 size={18} /></button>
              <button onClick={() => setShowHistory(false)} className="text-zinc-500 hover:text-white"><X size={22} /></button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
            {history.length > 0 ? history.map((log) => (
              <div key={log._id} className="group relative border-l-2 border-zinc-900 pl-4 transition-all hover:border-cyan-500">
                <button 
                  onClick={() => deleteOne(log._id)}
                  className="absolute right-0 top-0 text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash size={14} />
                </button>
                <p className="text-cyan-400/50 text-[9px] font-bold uppercase tracking-widest">User</p>
                <p className="text-zinc-300 text-sm mb-2">{log.userMessage}</p>
                <p className="text-zinc-500 text-xs italic">{log.aiMessage}</p>
              </div>
            )) : <p className="text-zinc-700 text-center text-[10px] mt-20">LOGS_EMPTY</p>}
          </div>
        </div>
      )}

      {/* TOP CONTROLS */}
      <div className="w-full flex justify-between px-6">
        <div className="flex items-center gap-2 text-cyan-500 opacity-70">
          <Cpu size={12} />
          <span className="text-[8px] font-black tracking-[0.3em]">DETRAX_V2</span>
        </div>
        <button onClick={() => { setShowHistory(true); fetchHistory(); }} className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-500 hover:text-cyan-500 transition-colors">
          <History size={20} />
        </button>
      </div>

      {/* ROBOT CORE - UPDATED TO SHOW AI MESSAGE */}
      <div className="relative flex items-center justify-center">
        <div className={`relative w-72 h-72 rounded-full flex items-center justify-center bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 transition-all duration-500 ${isListening ? 'shadow-[0_0_60px_rgba(6,182,212,0.3)] border-cyan-500/50' : ''}`}>
          
          {/* Pulsing background effect when AI is speaking or listening */}
          <div className={`absolute inset-0 rounded-full transition-opacity duration-1000 ${(isListening || aiReply) ? 'opacity-20' : 'opacity-0'} bg-cyan-500 blur-3xl`} />

          <div className="z-10 px-10 text-center">
            {isLoading ? (
              <Activity className="w-10 h-10 text-cyan-500 animate-pulse mx-auto" />
            ) : (
              <div className="space-y-2">
                {aiReply ? (
                  <p className="text-sm font-medium leading-relaxed tracking-wide text-cyan-50 animate-in fade-in duration-700">
                    {aiReply}
                  </p>
                ) : (
                  <p className="text-[10px] font-bold tracking-[0.3em] text-zinc-500 uppercase">
                    System Ready
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TRANSCRIPT */}
      <div className="text-center h-16 px-6">
        <p className="text-[8px] uppercase tracking-[0.4em] text-zinc-600 mb-2 font-bold">User Input</p>
        <p className={`text-base font-light italic transition-opacity ${isListening ? 'opacity-100 text-cyan-400' : 'opacity-40 text-zinc-400'}`}>
          {transcript ? `"${transcript}"` : "..."}
        </p>
      </div>

      {/* MIC BUTTON */}
      <button
        onClick={() => isListening ? recognitionRef.current?.stop() : recognitionRef.current?.start()}
        className={`p-10 rounded-full transition-all duration-500 active:scale-90 ${isListening ? "bg-cyan-500 text-black shadow-[0_0_50px_rgba(6,182,212,0.6)]" : "bg-white text-black hover:bg-cyan-50"}`}
      >
        {isListening ? <X size={36} /> : <Mic size={36} />}
      </button>
    </div>
  );
};

export default VoiceAssistant;