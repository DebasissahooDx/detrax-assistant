import React from "react";
import VoiceAssistant from "./components/VoiceAssistant";

function App() {
  return (
    <div className="fixed inset-0 bg-[#000000] text-white flex flex-col items-center justify-center p-4 overflow-hidden selection:bg-cyan-500/30">
      
      {/* Cinematic Background Light Leaks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[60%] h-[40%] bg-cyan-900/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[60%] h-[40%] bg-blue-900/10 blur-[100px] rounded-full"></div>
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>

      {/* Header Module */}
      <div className="text-center mb-6 z-10 scale-90 sm:scale-100">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-900/30 border border-zinc-800/50 text-zinc-500 text-[9px] font-black uppercase tracking-[0.3em] mb-4">
          <span className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_#06b6d4]"></span>
          Neural Link Active
        </div>
        
        <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-white uppercase italic leading-none">
          DETRAX<span className="text-cyan-500 not-italic">.AI</span>
        </h1>
        
        <div className="mt-3">
          <p className="text-zinc-500 text-[10px] font-bold tracking-[0.2em] uppercase">
            Authorized: <span className="text-zinc-300">Debasis Sahoo</span>
          </p>
        </div>
      </div>

      {/* Main Voice Assistant */}
      <div className="w-full h-full max-w-lg z-10 flex items-center justify-center">
        <VoiceAssistant />
      </div>

      {/* Minimalist Footer */}
      <footer className="absolute bottom-6 text-zinc-800 text-[8px] font-bold tracking-[0.4em] z-10 uppercase text-center w-full">
        <p className="opacity-50">&copy; 2026 Detrax Robotics // Debasis Sahoo Project</p>
      </footer>
    </div>
  );
}

export default App;