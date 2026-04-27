
import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  CheckCircle2, 
  Loader2, 
  Video, 
  VideoOff, 
  MicOff, 
  Bot, 
  Volume2, 
  Square,
  LogOut,
  Fingerprint,
  ShieldCheck,
  MessageSquare,
  Bell,
  X,
  AudioLines,
  AudioWaveform as WaveformIcon,
  ArrowRight,
  Save,
  Loader,
  Sun,
  Moon,
  Maximize2,
  AlertCircle,
  Monitor,
  Check,
  ShieldAlert
} from 'lucide-react';
import { Job, InterviewSession, Language, Question, ChatMessage, Answer } from '../../types';
import { geminiService, encodeAudio, decodeAudio, decodeAudioData } from '../../services/geminiService';
import * as publicService from '../../services/publicService';

interface InterviewRoomProps {
  job: Job;
  session: InterviewSession;
  initialLanguage: Language;
  messages: ChatMessage[];
  onComplete: (session: InterviewSession) => void | Promise<void>;
  onTranscriptUpdate?: (transcript: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const InterviewRoom: React.FC<InterviewRoomProps> = ({ job, session, initialLanguage, messages, onComplete, onTranscriptUpdate, theme, toggleTheme }) => {
  const [phase, setPhase] = useState<'Preparation' | 'Greeting' | 'Questioning' | 'Closing'>('Preparation');
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [subtitleText, setSubtitleText] = useState('');
  const [activeSpeaker, setActiveSpeaker] = useState<'AI' | 'Candidate' | null>(null);
  const [showMessages, setShowMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isRequestingScreen, setIsRequestingScreen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const answersRef = useRef<Answer[]>([]);
  const turnTranscriptRef = useRef('');
  const lastAiQuestionRef = useRef('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingBlobRef = useRef<Blob | null>(null);
  const recordingDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const userMicSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    startMedia();
    return () => {
      stopMedia();
      cleanupSession();
      if (screenStream) screenStream.getTracks().forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    setUnreadCount(messages.filter(m => !m.isRead).length);
  }, [messages]);

  const cleanupSession = () => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close());
      sessionPromiseRef.current = null;
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setIsLiveActive(false);
  };

  const stopRecording = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        if (userMicSourceRef.current && recordingDestRef.current) {
          try { userMicSourceRef.current.disconnect(recordingDestRef.current); } catch (_) {}
          userMicSourceRef.current = null;
          recordingDestRef.current = null;
        }
        resolve(recordingBlobRef.current);
        return;
      }
      mediaRecorderRef.current.onstop = () => {
        const blob = recordingChunksRef.current.length > 0
          ? new Blob(recordingChunksRef.current, { type: 'video/webm' })
          : null;
        recordingBlobRef.current = blob;
        mediaRecorderRef.current = null;
        recordingChunksRef.current = [];
        if (userMicSourceRef.current && recordingDestRef.current) {
          try { userMicSourceRef.current.disconnect(recordingDestRef.current); } catch (_) {}
          userMicSourceRef.current = null;
          recordingDestRef.current = null;
        }
        resolve(blob);
      };
      mediaRecorderRef.current.stop();
    });
  };

  const startMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1,
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Media permission denied", err);
      alert("Microphone and Camera access is required for the interview. Please enable them in your browser settings.");
    }
  };

  const stopMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const handleStartScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenStream(stream);
      setIsRequestingScreen(false);
      if (screenRef.current) screenRef.current.srcObject = stream;
    } catch (err) {
      console.error("Screen share denied", err);
      setIsRequestingScreen(false);
    }
  };

  const initLiveSession = async () => {
    if (!streamRef.current) return;
    
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    audioContextRef.current = outputCtx;

    const langNames = { [Language.EN]: "English", [Language.RU]: "Russian", [Language.UZ]: "Uzbek" };
    
    const systemInstruction = `
      CONTEXT:
      You are a world-class AI Senior Recruiter conducting an adaptive interview for:
      - Role: ${job.title}
      - Level: ${job.experienceLevel}
      - Skills: ${job.requiredSkills.join(', ')}
      - Description: ${job.description}
      - Language: ${langNames[initialLanguage]}
      
      YOUR BEHAVIOR PROTOCOL:
      1. ADAPTIVE DIFFICULTY: 
         - If the candidate answers well, ask a deep, nuanced follow-up (e.g., "That's a good approach, but how would you scale that to 10 million users?").
         - If the candidate struggles, simplify the question or provide a small hint to see their thought process.
      2. ACTIVE LISTENING: Always acknowledge specific points mentioned in their previous answer. Never just jump to the next generic question.
      3. REAL WORLD SCENARIOS: Move beyond theory. Ask aboutproduction trade-offs, bug fixing, and stakeholder management.
      4. EVALUATION METRICS: You are secretly monitoring:
         - LOGICAL CLARITY: Is their explanation structured?
         - CONFIDENCE: Do they hesitate or sound certain?
         - RELEVANCE: Did they actually answer the specific question?
      5. PROFESSIONAL TONE: Be warm, encouraging, but rigorous.
      6. MULTILINGUAL: Strictly use ${langNames[initialLanguage]}.

      SESSION FLOW:
      - Start with a professional greeting.
      - Ask 1 warm-up question.
      - Proceed to deep technical/scenario probing.
      - If they mention a specific technology (e.g., Redux, K8s), probe their specific experience with it.
      
      Begin now by introducing yourself and the role.
    `;

    sessionPromiseRef.current = geminiService.connectLiveInterview({
      onopen: () => {
        setIsLiveActive(true);
        recordingChunksRef.current = [];
        recordingBlobRef.current = null;
        const stream = streamRef.current;
        if (stream && typeof MediaRecorder !== 'undefined' && outputCtx) {
          try {
            const recordingDest = outputCtx.createMediaStreamDestination();
            recordingDestRef.current = recordingDest;
            const userMicSource = outputCtx.createMediaStreamSource(stream);
            userMicSourceRef.current = userMicSource;
            userMicSource.connect(recordingDest);
            const videoTracks = stream.getVideoTracks();
            const mixedAudioTracks = recordingDest.stream.getAudioTracks();
            const combinedStream = new MediaStream([...videoTracks, ...mixedAudioTracks]);
            const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm';
            const recorder = new MediaRecorder(combinedStream, { mimeType: mime, videoBitsPerSecond: 2500000, audioBitsPerSecond: 128000 });
            recorder.ondataavailable = (e) => { if (e.data.size > 0) recordingChunksRef.current.push(e.data); };
            recorder.start(5000);
            mediaRecorderRef.current = recorder;
          } catch (err) {
            console.warn('MediaRecorder start failed', err);
          }
        }
        const source = inputCtx.createMediaStreamSource(streamRef.current!);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        
        processor.onaudioprocess = (e: any) => {
          const input = e.inputBuffer.getChannelData(0);
          let sum = 0;
          for(let i=0; i<input.length; i++) sum += input[i]*input[i];
          const level = Math.sqrt(sum/input.length);
          setAudioLevel(level);

          const int16 = new Int16Array(input.length);
          for (let i = 0; i < input.length; i++) int16[i] = input[i] * 32768;
          
          if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then((session) => {
              session.sendRealtimeInput({ 
                media: { 
                  data: encodeAudio(new Uint8Array(int16.buffer)), 
                  mimeType: 'audio/pcm;rate=16000' 
                } 
              });
            });
          }
        };
        source.connect(processor);
        processor.connect(inputCtx.destination);
      },
      onmessage: async (msg: any) => {
        if (msg.serverContent?.interrupted) {
          sourcesRef.current.forEach(s => s.stop());
          sourcesRef.current.clear();
          nextStartTimeRef.current = 0;
          return;
        }

        const audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (audio && audioContextRef.current) {
          nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
          const buffer = await decodeAudioData(decodeAudio(audio), audioContextRef.current, 24000, 1);
          const source = audioContextRef.current.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContextRef.current.destination);
          if (recordingDestRef.current) source.connect(recordingDestRef.current);
          source.addEventListener('ended', () => {
            sourcesRef.current.delete(source);
          });
          source.start(nextStartTimeRef.current);
          nextStartTimeRef.current += buffer.duration;
          sourcesRef.current.add(source);
        }

        const transcription = msg.serverContent?.outputTranscription?.text || "";
        if (transcription.toLowerCase().includes("share your screen") || 
            transcription.toLowerCase().includes("ekraningizni ulashing") ||
            transcription.toLowerCase().includes("поделитесь экраном")) {
          setIsRequestingScreen(true);
        }

        if (msg.serverContent?.inputTranscription) {
          const text = msg.serverContent.inputTranscription.text;
          setSubtitleText(text);
          setActiveSpeaker('Candidate');
          turnTranscriptRef.current = text;
          // Q&A: AI savoliga nomzod javobini saqlash (savol bo'lmasa ham javobni saqlash – baholash uchun)
          if (text?.trim()) {
            const questionText = lastAiQuestionRef.current?.trim() || 'General response / candidate spoke';
            const qa: Answer = {
              questionId: `q${answersRef.current.length}`,
              questionText,
              text,
              timestamp: new Date().toISOString(),
            };
            answersRef.current = [...answersRef.current, qa];
            lastAiQuestionRef.current = '';
          }
        }

        if (msg.serverContent?.outputTranscription) {
          const text = msg.serverContent.outputTranscription.text;
          setSubtitleText(text);
          setActiveSpeaker('AI');
          if (text?.trim()) lastAiQuestionRef.current = text;
        }
      }
    }, systemInstruction, 'Zephyr');
  };

  const handleEndInterview = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    await stopRecording();
    cleanupSession();
    stopMedia();
    setTimeout(() => {
      setPhase('Closing');
      setIsFinishing(false);
    }, 1500);
  };

  const handleFinalFinish = async () => {
    const finalSession = {
      ...session,
      status: 'Completed' as const,
      answers: [...answersRef.current]
    };
    await onComplete(finalSession);
    if (recordingBlobRef.current && recordingBlobRef.current.size > 0) {
      try {
        await publicService.uploadSessionRecording(session.id, recordingBlobRef.current);
      } catch (err) {
        console.warn('Recording upload failed', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col lg:flex-row overflow-hidden relative transition-colors duration-500">
      {/* Heavy-duty saving overlay */}
      {isFinishing && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center space-y-6">
           <Loader className="animate-spin text-indigo-500" size={64} />
           <div className="text-center px-6">
             <p className="text-xl md:text-2xl font-black tracking-tighter uppercase mb-2">Finalizing Dossier</p>
             <p className="text-slate-500 text-sm max-w-xs mx-auto">We are synchronizing all transcripts and rezyume tahlili (CV analysis) for HR review on HR Lodex.</p>
           </div>
        </div>
      )}

      {/* Screen Share Request Modal */}
      {isRequestingScreen && (
        <div className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-indigo-500/30 p-8 rounded-[2.5rem] max-w-md w-full space-y-6 text-center shadow-2xl animate-in zoom-in-95">
             <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-white shadow-xl">
               <Monitor size={32} />
             </div>
             <div className="space-y-2">
               <h3 className="text-2xl font-black">Screen Share Required</h3>
               <p className="text-slate-400 text-sm">This question requires a practical demonstration. Please share your screen to proceed.</p>
             </div>
             <div className="flex gap-3">
               <button onClick={() => setIsRequestingScreen(false)} className="flex-1 py-4 bg-slate-800 rounded-2xl font-bold hover:bg-slate-700">Later</button>
               <button onClick={handleStartScreenShare} className="flex-1 py-4 bg-indigo-600 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700">Share Now</button>
             </div>
          </div>
        </div>
      )}

      {/* HR Channel Overlay */}
      {showMessages && (
        <div className="fixed inset-0 lg:inset-y-0 lg:right-0 lg:left-auto lg:w-96 bg-slate-900 z-[70] flex flex-col animate-in slide-in-from-right duration-500">
           <div className="p-6 md:p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-xl">
              <h3 className="text-xl font-black flex items-center gap-3">
                <MessageSquare className="text-indigo-400" />
                HR Channel
              </h3>
              <button onClick={() => setShowMessages(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-all"><X size={24}/></button>
           </div>
           <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center px-6">
                  <MessageSquare size={48} className="mb-4 opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-widest">No messages from HR</p>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="bg-white/5 border border-white/10 p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] rounded-tr-none hover:border-indigo-500/30 transition-all group">
                    <p className="text-sm text-slate-200 leading-relaxed font-medium">"{m.text}"</p>
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        <span>{m.senderName}</span>
                        <span>{new Date(m.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col p-4 md:p-6 space-y-4 overflow-hidden min-h-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-4 bg-slate-900/50 px-4 md:px-6 py-2.5 md:py-3 rounded-2xl border border-slate-800 backdrop-blur-md">
             <div className="relative">
               <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${isLiveActive ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
               {isLiveActive && <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />}
             </div>
             <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 truncate max-w-[150px] md:max-w-none">{job.title}</span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={toggleTheme}
              className="p-3 md:p-4 bg-slate-900 rounded-2xl border border-slate-800 hover:bg-slate-800 transition-all text-slate-300"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button onClick={() => setShowMessages(!showMessages)} className="p-3 md:p-4 bg-slate-900 rounded-2xl relative border border-slate-800 hover:bg-slate-800 transition-all">
               <MessageSquare size={18} className="text-slate-300" />
               {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-indigo-600 rounded-full text-[9px] md:text-[10px] flex items-center justify-center font-black animate-in zoom-in border-2 border-slate-900">{unreadCount}</span>}
            </button>
          </div>
        </div>

        <div className="flex-1 bg-slate-900 rounded-[2rem] md:rounded-[3.5rem] overflow-hidden relative shadow-2xl border border-slate-800/50 group flex flex-col">
          <div className="relative w-full h-full">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1] transition-transform duration-700" />
            {screenStream && (
              <div className="absolute top-4 right-4 w-1/3 md:w-1/4 aspect-video bg-black rounded-2xl border-2 border-indigo-600 shadow-2xl overflow-hidden animate-in fade-in zoom-in">
                <video ref={screenRef} autoPlay className="w-full h-full object-contain" />
              </div>
            )}
          </div>
          
          <div className="absolute inset-x-0 bottom-0 p-4 md:p-10 flex flex-col items-center gap-4 md:gap-6">
             {isLiveActive && (
               <div className="flex items-center gap-1 h-8 md:h-12 mb-1 md:mb-2">
                 {[...Array(16)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1 md:w-1.5 bg-indigo-500 rounded-full transition-all duration-75 shadow-lg"
                      style={{ height: `${Math.max(20, audioLevel * (Math.random() * 250 + 150))}%` }}
                    />
                 ))}
               </div>
             )}

             {subtitleText && (
                <div className="bg-slate-950/95 backdrop-blur-3xl p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] max-w-5xl w-full text-center shadow-2xl border border-white/10 animate-in slide-in-from-bottom-8">
                  <div className="flex flex-col items-center gap-2 md:gap-4">
                    <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest px-3 md:py-2 rounded-full border ${
                      activeSpeaker === 'AI' ? 'bg-indigo-600 border-indigo-400' : 'bg-emerald-600 border-emerald-400'
                    }`}>
                      {activeSpeaker === 'AI' ? 'AI Recruiter Speaking' : 'Capturing Candidate Speech'}
                    </span>
                    <p className="text-lg md:text-3xl font-black leading-tight text-white line-clamp-3">
                      {subtitleText}
                    </p>
                  </div>
                </div>
             )}
          </div>
          
          {!isLiveActive && phase === 'Greeting' && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
               <div className="flex items-center gap-2 md:gap-3 px-6 md:py-4 bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-800 shadow-2xl animate-pulse">
                  <ShieldCheck className="text-indigo-400" />
                  <span className="text-[10px] md:text-sm font-black uppercase tracking-widest">Awaiting Activation</span>
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-[420px] xl:w-[480px] bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col shrink-0 min-h-[300px] lg:min-h-0">
        {phase === 'Preparation' ? (
           <div className="flex-1 flex flex-col p-8 md:p-14 space-y-10 overflow-y-auto custom-scrollbar">
             <div className="text-center space-y-4">
               <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto text-white shadow-xl mb-6">
                 <ShieldCheck size={40} />
               </div>
               <h2 className="text-3xl font-black tracking-tight leading-none">Security & <br/><span className="text-indigo-500">Compliance</span></h2>
               <p className="text-slate-400 text-sm font-medium">Please review and accept the terms to start the assessment.</p>
             </div>

             <div className="space-y-6">
               <div className="p-6 bg-slate-800/50 rounded-3xl border border-slate-700 flex gap-4">
                 <div className="shrink-0 w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                    <ShieldAlert size={20} />
                 </div>
                 <div className="space-y-1">
                   <p className="text-sm font-black uppercase tracking-wider">Recording Notice</p>
                   <p className="text-xs text-slate-500 leading-relaxed">This session will be recorded (audio/video) for HR evaluation. By proceeding, you consent to this recording.</p>
                 </div>
               </div>

               <div className="p-6 bg-indigo-50/10 rounded-3xl border border-indigo-500/20 flex gap-4">
                 <div className="shrink-0 w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                    <Maximize2 size={20} />
                 </div>
                 <div className="space-y-1">
                   <p className="text-sm font-black uppercase tracking-wider">Camera Placement</p>
                   <p className="text-xs text-slate-500 leading-relaxed">Please sit 1.5 – 2 meters away from the camera. Ensure your face is fully visible and the background is well-lit.</p>
                 </div>
               </div>
             </div>

             <button 
               onClick={() => setPhase('Greeting')}
               className="w-full py-6 bg-indigo-600 rounded-[2rem] font-black text-xl hover:bg-indigo-700 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
             >
               Agree & Continue <ArrowRight size={24} />
             </button>
           </div>
        ) : phase === 'Greeting' ? (
          <div className="flex-1 flex flex-col justify-center p-8 md:p-14 text-center space-y-8 md:space-y-12 overflow-y-auto">
            <div className="relative w-24 h-24 md:w-40 md:h-40 mx-auto">
               <div className="absolute inset-0 bg-indigo-600/30 rounded-[2rem] md:rounded-[3rem] animate-ping" />
               <div className="relative bg-indigo-600 w-full h-full rounded-[2rem] md:rounded-[3rem] flex items-center justify-center text-white shadow-xl">
                 <Bot size={48} className="md:size-20" />
               </div>
            </div>
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight">Adaptive AI <br/><span className="text-indigo-500">Recruiter</span></h2>
              <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed px-2 md:px-4">
                The HR Lodex AI will now conduct a sun’iy intellekt intervyu (AI interview) for your ${job.experienceLevel} level assessment.
              </p>
            </div>

            <button 
              onClick={() => { setPhase('Questioning'); initLiveSession(); }} 
              className="w-full py-6 md:py-8 bg-indigo-600 rounded-2xl md:rounded-[2.5rem] font-black text-xl md:text-2xl hover:bg-indigo-700 shadow-xl active:scale-95 flex items-center justify-center gap-3 md:gap-4 group mt-4"
            >
              Begin Session <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        ) : phase === 'Questioning' ? (
          <div className="flex-1 flex flex-col p-6 md:p-12 space-y-6 md:space-y-10">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 md:gap-3">
                 <AudioLines className="text-indigo-400" size={18} />
                 <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400">Adaptive Dialogue</h3>
               </div>
               <div className="flex items-center gap-2">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[8px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
               </div>
            </div>
            
            <div className="space-y-4 md:space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 md:space-y-8 py-10 md:py-20 border-2 border-dashed border-slate-800 rounded-[2rem] md:rounded-[3rem]">
                  <Bot size={32} className="opacity-20" />
                  <div className="text-center px-6">
                    <p className="font-black uppercase text-[8px] md:text-[10px] tracking-widest mb-2">Protocol Active</p>
                    <p className="italic text-[10px] md:text-xs leading-relaxed">AI is evaluating depth and logic.</p>
                  </div>
                </div>
              ) : (
                messages.map(m => (
                  <div key={m.id} className="p-6 md:p-8 bg-indigo-600/5 rounded-[2rem] md:rounded-[2.5rem] border border-indigo-600/10 animate-in slide-in-from-right duration-500 hover:border-indigo-600/40 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                      <span className="text-[8px] md:text-[9px] font-black text-indigo-400 uppercase tracking-widest">Update</span>
                    </div>
                    <p className="text-xs md:text-sm font-bold leading-relaxed text-slate-200">"{m.text}"</p>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 md:p-10 bg-slate-800/50 rounded-[2rem] md:rounded-[3rem] border border-slate-700 space-y-4 md:space-y-8 shadow-inner">
              <div className="flex justify-between items-center text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500">Audio Feedback</span>
                <span className="text-emerald-500">Responsive</span>
              </div>
              <div className="flex gap-1 h-3 md:h-4">
                {[...Array(24)].map((_, i) => (
                  <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i < audioLevel * 80 ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                ))}
              </div>
            </div>

            <button 
              disabled={isFinishing}
              onClick={handleEndInterview} 
              className="w-full py-4 md:py-6 bg-slate-800/80 text-slate-400 hover:text-white hover:bg-red-600 rounded-2xl md:rounded-[2.5rem] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-50 active:scale-95 border border-slate-700"
            >
              {isFinishing ? <Loader className="animate-spin mx-auto" size={18} /> : 'End Session'}
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center p-10 md:p-14 text-center space-y-10 md:space-y-12 overflow-y-auto">
            <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto">
               <div className="absolute inset-0 bg-emerald-500/10 rounded-[2.5rem] md:rounded-[3.5rem] animate-pulse border border-emerald-500/20" />
               <div className="relative w-full h-full bg-emerald-500/10 rounded-[2.5rem] md:rounded-[3.5rem] flex items-center justify-center border border-emerald-500/40 shadow-xl">
                 <CheckCircle2 size={56} className="md:size-20 text-emerald-500" />
               </div>
            </div>
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight">Dossier <br/><span className="text-emerald-500">Finalized</span></h2>
              <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed px-4 md:px-6">
                Your video intervyu (video interview AI) metrics have been safely sent to the HR panel.
              </p>
              <p className="text-amber-400/90 text-xs font-bold uppercase tracking-widest">
                Important: Click &quot;Complete Interview&quot; below to save your answers and receive AI evaluation.
              </p>
            </div>
            <button 
              onClick={handleFinalFinish} 
              className="w-full py-6 md:py-8 bg-indigo-600 rounded-2xl md:rounded-[2.5rem] font-black text-xl md:text-2xl hover:bg-indigo-700 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 md:gap-4 group"
            >
              Complete Interview <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewRoom;
