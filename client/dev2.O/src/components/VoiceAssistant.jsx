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

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const performAction = (text) => {
    const input = text.toLowerCase().trim();
    
    const launch = (url, protocol) => {
      if (isMobile && protocol) {
        window.location.assign(protocol);
        setTimeout(() => {
          if (!document.hidden) window.location.href = url;
        }, 2000);
      } else {
        const win = window.open(url, "_blank");
        if (!win) window.location.href = url;
      }
    };

    if (input.includes("youtube")) {
      let query = "";
      if (input.includes("play")) query = input.split("play")[1].split("on youtube")[0].trim();
      else if (input.includes("search for")) query = input.split("search for")[1].split("on youtube")[0].trim();

      const targetUrl = query 
        ? `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
        : "https://www.youtube.com";
      
      speak(query ? `Searching YouTube for ${query}` : "Opening YouTube");
      setAiReply(query ? `YOUTUBE: ${query.toUpperCase()}` : "LAUNCHING_YOUTUBE");
      setTimeout(() => launch(targetUrl, "youtube://"), 800);
      return true;
    }

    const commands = {
      "youtube": { p: "youtube://", w: "https://www.youtube.com" },
      "whatsapp": { p: "whatsapp://send", w: "https://web.whatsapp.com" },
      "spotify": { p: "spotify://", w: "https://open.spotify.com" },
      "discord": { p: "discord://", w: "https://discord.com/app" },
      "instagram": { p: "instagram://", w: "https://www.instagram.com" },
      "facebook": { p: "fb://", w: "https://www.facebook.com" },
      "telegram": { p: "tg://", w: "https://web.telegram.org" },
      "maps": { p: "maps://", w: "https://maps.google.com" }
    };

    for (const [name, urls] of Object.entries(commands)) {
      if (input.includes(`open ${name}`)) {
        speak(`Opening ${name}`);
        setAiReply(`LINK_START: ${name.toUpperCase()}`);
        setTimeout(() => launch(urls.w, urls.p), 800);
        return true;
      }
    }

    const urlMatch = input.match(/open\s+([a-zA-Z0-9-]+\.[a-z]{2,})/);
    if (urlMatch) {
      const site = urlMatch[1];
      speak(`Navigating to ${site}`);
      setAiReply(`WEB_BROWSER: ${site.toUpperCase()}`);
      setTimeout(() => launch(`https://${site}`), 800);
      return true;
    }

    return false;
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get("/chat/history");
      setHistory(res.data);
    } catch (err) { console.error("History sync offline"); }
  };

  const deleteOne = async (id) => {
    try {
      // Immediate UI feedback
      setHistory(prev => prev.filter(item => item._id !== id));
      await api.delete(`/chat/${id}`);
    } catch (err) { 
      console.error("Purge failed"); 
      fetchHistory(); // Revert on failure
    }
  };

  const clearAll = async () => {
    // Removed window.confirm as requested
    try {
      setHistory([]); // Immediate UI feedback
      await api.delete("/chat/history");
    } catch (err) { 
      console.error("Wipe failed"); 
      fetchHistory(); // Revert on failure
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = false;
      
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
    const voices = synthRef.current.getVoices();
    const voice = voices.find(v => v.lang === 'en-US' && (v.name.includes("Google") || v.name.includes("Female")));
    if (voice) utterance.voice = voice;
    utterance.rate = 1.0;
    synthRef.current.speak(utterance);
  }, []);

  const handleProcessCommand = async (text) => {
    if (!text.trim()) return;
    if (performAction(text)) return;

    setIsLoading(true);
    setAiReply(""); 
    try {
      const res = await api.post("/chat", { message: text });
      const cleanReply = res.data.reply.replace(/[*_#`]/g, "");
      setAiReply(cleanReply); 
      speak(cleanReply);    
      fetchHistory(); 
    } catch (err) { 
      setAiReply("Neural link error."); 
      speak("Neural link error.");
    } finally { 
      setIsLoading(false); 
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center">
      
      {/* HUD SUB-HEADER */}
      <div className="w-full flex justify-between px-2 items-center shrink-0 mb-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-cyan-400">
            <Cpu size={14} className={isListening ? "animate-pulse" : ""} />
            <span className="text-[10px] font-black tracking-[0.3em]">DETRAX_V2.0</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className={`w-1 h-1 rounded-full ${isListening ? 'bg-cyan-500 animate-ping' : 'bg-zinc-700'}`} />
            <span className="text-[7px] text-zinc-500 font-mono uppercase tracking-[0.2em]">
              {isMobile ? "Mobile_Core" : "Desktop_Core"}
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => { setShowHistory(true); fetchHistory(); }} 
          className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-400 active:bg-zinc-800 transition-all"
        >
          <History size={18} />
        </button>
      </div>

      {/* CORE VISUALIZER - Flexible height to prevent overlap */}
      <div className="flex-1 w-full flex items-center justify-center min-h-0">
        <div className={`relative max-h-[25vh] sm:max-h-[35vh] aspect-square w-full max-w-[260px] rounded-full flex items-center justify-center bg-zinc-900/10 border border-zinc-800/40 transition-all duration-700 ${isListening ? 'border-cyan-500/40 scale-105 shadow-[0_0_60px_rgba(6,182,212,0.15)]' : ''}`}>
          
          <div className={`absolute inset-0 rounded-full transition-opacity duration-1000 ${isListening ? 'opacity-20 animate-pulse' : 'opacity-0'} bg-cyan-500 blur-3xl`} />
          
          <div className="z-10 px-6 text-center">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <Activity className="w-8 h-8 text-cyan-500 animate-spin mb-2" />
                <span className="text-[7px] tracking-[0.3em] text-cyan-500/60 uppercase">Processing</span>
              </div>
            ) : (
              <div className="max-h-24 overflow-y-auto scrollbar-hide">
                <p className="text-xs sm:text-sm font-light tracking-wide text-zinc-200 leading-relaxed px-2">
                  {aiReply || <span className="text-zinc-700 tracking-[0.2em] text-[9px] uppercase font-bold">Detrax Ready</span>}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER CONTROLS - shrink-0 keeps button visible */}
      <div className="w-full flex flex-col items-center gap-4 py-4 shrink-0">
        <div className="h-8 text-center max-w-[90%]">
          <p className={`text-[12px] sm:text-[13px] transition-all duration-300 line-clamp-2 ${isListening ? 'text-cyan-400 font-medium' : 'text-zinc-600 italic opacity-60'}`}>
            {transcript ? `"${transcript}"` : "Transmit Signal"}
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => isListening ? recognitionRef.current?.stop() : recognitionRef.current?.start()}
            className={`relative p-8 rounded-full transition-all duration-300 active:scale-90 z-20 ${isListening ? "bg-cyan-500 text-black shadow-[0_0_30px_rgba(6,182,212,0.4)]" : "bg-white text-black"}`}
          >
            {isListening ? <X size={32} strokeWidth={3} /> : <Mic size={32} strokeWidth={2} />}
          </button>
          {!isListening && (
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping pointer-events-none z-10" />
          )}
        </div>
      </div>

      {/* HISTORY OVERLAY */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] bg-black p-5 flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center mb-6 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 bg-cyan-500 rounded-full" />
              <h2 className="text-cyan-500 font-black tracking-[0.3em] text-[10px]">LOGS</h2>
            </div>
            <div className="flex gap-5 items-center">
              <button onClick={clearAll} className="text-zinc-700 active:text-red-500"><Trash2 size={18} /></button>
              <button onClick={() => setShowHistory(false)} className="text-zinc-500 p-2"><X size={24} /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-5 pb-10 scrollbar-hide">
            {history.length > 0 ? history.map((log) => (
              <div key={log._id} className="relative border-l-2 border-zinc-900 pl-4 py-1 active:bg-zinc-900/20 transition-colors">
                <button onClick={() => deleteOne(log._id)} className="absolute right-0 top-0 text-zinc-800 p-1"><Trash size={14} /></button>
                <div className="mb-2">
                  <p className="text-[8px] text-cyan-900 font-bold uppercase tracking-widest mb-1">Inbound</p>
                  <p className="text-zinc-300 text-[13px]">{log.userMessage}</p>
                </div>
                <div>
                  <p className="text-[8px] text-zinc-800 font-bold uppercase tracking-widest mb-1">Detrax</p>
                  <p className="text-zinc-500 text-[12px] italic leading-relaxed">{log.aiMessage}</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full opacity-10">
                <Cpu size={40} />
                <p className="text-[10px] tracking-widest mt-2 uppercase">Empty</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;