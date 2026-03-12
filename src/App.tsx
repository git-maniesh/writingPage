import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { Feather, Heart, Mail, PenTool, Send, Instagram, Flower2, Leaf, Quote, Play, Sparkles, ArrowUp, Volume2, VolumeX, Menu, X } from 'lucide-react';
import { useState, FormEvent, useEffect, ChangeEvent, FocusEvent, useRef, createContext, useContext, useCallback, ReactNode } from 'react';

// Import local assets
import testimonial1 from './assets/testimonial-1.jpg';
import testimonial2 from './assets/testimonial-2.jpg';
import testimonial3 from './assets/testimonial-3.jpg';
import heroVideo from './assets/hero-video.mp4';

type SoundContextType = {
  isMuted: boolean;
  toggleMute: () => void;
  playHover: () => void;
  playClick: () => void;
  playTear: () => void;
};

const SoundContext = createContext<SoundContextType | null>(null);

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(true);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  useEffect(() => {
    if (!isMuted && !audioCtx) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioCtx(ctx);
    }
  }, [isMuted, audioCtx]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (!next && audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return next;
    });
  }, [audioCtx]);

  const playHover = useCallback(() => {
    if (isMuted || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) { /* ignore */ }
  }, [isMuted, audioCtx]);

  const playClick = useCallback(() => {
    if (isMuted || !audioCtx) return;
    try {
      const bufferSize = audioCtx.sampleRate * 0.1;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.02));
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1500, audioCtx.currentTime);
      filter.frequency.linearRampToValueAtTime(300, audioCtx.currentTime + 0.1);
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start();
    } catch (e) { /* ignore */ }
  }, [isMuted, audioCtx]);

  const playTear = useCallback(() => {
    if (isMuted || !audioCtx) return;
    try {
      const bufferSize = audioCtx.sampleRate * 0.5;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.15));
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, audioCtx.currentTime);
      filter.frequency.linearRampToValueAtTime(2500, audioCtx.currentTime + 0.2);
      filter.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.5);
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start();
    } catch (e) { /* ignore */ }
  }, [isMuted, audioCtx]);

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, playHover, playClick, playTear }}>
      {children}
    </SoundContext.Provider>
  );
}

function SoundToggle() {
  const { isMuted, toggleMute, playClick, playHover } = useSound();

  return (
    <button
      onClick={() => {
        toggleMute();
        if (isMuted) {
          setTimeout(playClick, 50);
        }
      }}
      onMouseEnter={playHover}
      className="fixed bottom-24 right-8 z-50 w-12 h-12 bg-[#f7f3ea] border border-[#2c2421]/20 rounded-full flex items-center justify-center text-[#2c2421] shadow-lg hover:bg-[#ede6d8] transition-colors duration-300"
      aria-label={isMuted ? "Enable sounds" : "Disable sounds"}
    >
      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
    </button>
  );
}

const BLOT_PATHS = [
  "M45.7,-76.1C58.9,-69.3,69.1,-55.4,76.5,-40.4C83.9,-25.4,88.5,-9.3,86.2,6.1C83.9,21.5,74.7,36.2,63.6,48.2C52.5,60.2,39.5,69.5,24.6,75.9C9.7,82.3,-7.1,85.8,-22.6,82.1C-38.1,78.4,-52.3,67.5,-63.4,54.1C-74.5,40.7,-82.5,24.8,-85.4,8.1C-88.3,-8.6,-86.1,-26.1,-77.3,-40.5C-68.5,-54.9,-53.1,-66.2,-38.3,-72.4C-23.5,-78.6,-9.3,-79.7,3.6,-84.1C16.5,-88.5,32.5,-82.9,45.7,-76.1Z",
  "M39.9,-65.7C52.8,-58.5,65.1,-49.6,73.1,-37.2C81.1,-24.8,84.8,-8.9,82.6,6.3C80.4,21.5,72.3,36,61.1,47.1C49.9,58.2,35.6,65.9,20.5,71.2C5.4,76.5,-10.5,79.4,-25.1,75.4C-39.7,71.4,-53,60.5,-63.1,47.3C-73.2,34.1,-80.1,18.6,-81.4,2.5C-82.7,-13.6,-78.4,-30.3,-68.8,-43.5C-59.2,-56.7,-44.3,-66.4,-29.6,-71.3C-14.9,-76.2,-0.4,-76.3,13.2,-74.2C26.8,-72.1,39.9,-65.7,39.9,-65.7Z",
  "M42.9,-73.4C55.5,-66.3,65.6,-53.6,73.1,-39.5C80.6,-25.4,85.5,-9.9,84.1,5.1C82.7,20.1,75,34.6,64.2,46.3C53.4,58,39.5,66.9,24.3,72.9C9.1,78.9,-7.4,82,-23.1,78.8C-38.8,75.6,-53.7,66.1,-64.5,53.4C-75.3,40.7,-82,24.8,-83.8,8.5C-85.6,-7.8,-82.5,-24.5,-73.9,-38.1C-65.3,-51.7,-51.2,-62.2,-36.4,-68.5C-21.6,-74.8,-6.1,-76.9,4.6,-82.5C15.3,-88.1,30.3,-80.5,42.9,-73.4Z"
];

interface Blot {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  pathIndex: number;
  maxOpacity: number;
  duration: number;
  blur: number;
}

function AnimatedInkBlots() {
  const [blots, setBlots] = useState<Blot[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newBlot: Blot = {
        id: Date.now(),
        x: Math.random() * 100, // vw
        y: Math.random() * 100, // vh
        size: Math.random() * 150 + 50, // 50px to 200px
        rotation: Math.random() * 360,
        pathIndex: Math.floor(Math.random() * BLOT_PATHS.length),
        maxOpacity: Math.random() * 0.04 + 0.01, // 0.01 to 0.05
        duration: Math.random() * 8 + 7, // 7s to 15s
        blur: Math.random() * 6 + 2, // 2px to 8px
      };

      setBlots(prev => [...prev, newBlot]);

      // Clean up old blot
      setTimeout(() => {
        setBlots(prev => prev.filter(b => b.id !== newBlot.id));
      }, newBlot.duration * 1000);

    }, 4000); // Add a new blot every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <AnimatePresence>
        {blots.map(blot => (
          <motion.div
            key={blot.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0, blot.maxOpacity, blot.maxOpacity, 0],
              scale: [0.8, 1, 1.05, 1.1]
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: blot.duration,
              ease: "easeInOut",
              times: [0, 0.2, 0.8, 1]
            }}
            className="absolute text-[#2c2421]"
            style={{
              left: `${blot.x}vw`,
              top: `${blot.y}vh`,
              width: blot.size,
              height: blot.size,
              transform: `translate(-50%, -50%) rotate(${blot.rotation}deg)`,
              filter: `blur(${blot.blur}px)`
            }}
          >
            <svg viewBox="-100 -100 200 200" className="w-full h-full fill-current">
              <path d={BLOT_PATHS[blot.pathIndex]} />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function AppContent() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  // Parallax layers for immersive vintage feel
  const yBgSlow = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const yBgFast = useTransform(scrollYProgress, [0, 1], ['0%', '-20%']);
  const yDecor1 = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const yDecor2 = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  const yDecor3 = useTransform(scrollYProgress, [0, 1], ['0%', '60%']);

  const [transitionState, setTransitionState] = useState<'idle' | 'dropping' | 'leaving'>('idle');
  const [targetId, setTargetId] = useState<string | null>(null);

  const handleNavigate = (id: string) => {
    if (transitionState !== 'idle') return;
    setTargetId(id);
    setTransitionState('dropping');
  };

  return (
    <div className="min-h-screen relative overflow-hidden selection:bg-[#a85c3c] selection:text-[#f7f3ea]">
      <CustomCursor />
      {/* AnimatedInkBlots disabled to improve performance on large screens / reduce lag */}
      {/* <AnimatedInkBlots /> */}
      <PaperTransition
        state={transitionState}
        targetId={targetId}
        onStateChange={setTransitionState}
        onTargetChange={setTargetId}
      />
      {/* Base paper texture overlay - Parallaxed */}
      <motion.div
        style={{ y: yBgSlow }}
        animate={{
          opacity: [0.12, 0.15, 0.12],
          scale: [1, 1.01, 1]
        }}
        transition={{
          duration: 15,
          ease: "easeInOut",
          repeat: Infinity
        }}
        className="fixed inset-[-50%] pointer-events-none mix-blend-color-burn bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')] z-50"
      ></motion.div>

      {/* Secondary Vintage Texture Layer (Dust/Scratches) */}
      <motion.div
        style={{ y: yBgFast }}
        className="fixed inset-[-50%] pointer-events-none opacity-[0.06] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/stucco.png')] z-40"
      ></motion.div>

      {/* Parallax Vintage Watermarks / Stamps */}
      <motion.div style={{ y: yDecor1 }} className="fixed top-[15%] left-[-10%] text-[#8c3a3a]/5 pointer-events-none z-0 rotate-[-15deg]">
        <Flower2 className="w-[30rem] h-[30rem]" strokeWidth={0.5} />
      </motion.div>
      <motion.div style={{ y: yDecor2 }} className="fixed top-[60%] right-[-5%] text-[#5c4e46]/5 pointer-events-none z-0 rotate-[25deg]">
        <Leaf className="w-[40rem] h-[40rem]" strokeWidth={0.5} />
      </motion.div>
      <motion.div style={{ y: yDecor3 }} className="fixed top-[85%] left-[5%] text-[#a85c3c]/5 pointer-events-none z-0 rotate-[-45deg]">
        <Heart className="w-96 h-96" strokeWidth={0.5} />
      </motion.div>

      {/* Enhanced vignette for burnt/aged edge effect */}
      <div className="fixed inset-0 pointer-events-none z-50 mix-blend-multiply" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(140, 58, 58, 0.03) 70%, rgba(44, 36, 33, 0.25) 100%)' }}></div>

      <FloatingDoodles />
      <VintageInkBlots />

      <Navbar onNavigate={handleNavigate} />

      <main>
        <Hero y={y} onNavigate={handleNavigate} />
        <Services />
        <Portfolio />
        <Testimonials />
        <OrderSection />
      </main>

      <Footer />
      <BackToTop />
      <SoundToggle />
    </div>
  );
}

export default function App() {
  return (
    <SoundProvider>
      <AppContent />
    </SoundProvider>
  );
}

function Navbar({ onNavigate }: { onNavigate: (id: string) => void }) {
  const { playHover, playClick } = useSound();
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex justify-between items-center bg-[#f7f3ea]/80 backdrop-blur-md border-b border-[#2c2421]/10">
      <a href="#" onClick={(e) => { e.preventDefault(); playClick(); onNavigate('#root'); }} onMouseEnter={playHover} className="flex items-center gap-2 text-[#2c2421]">
        <Feather className="w-5 h-5" />
        <span className="font-handwriting text-2xl font-semibold tracking-wide">Love Beyond Writings</span>
      </a>
      <span className="font-handwriting text-2xl font-semibold tracking-wide hidden md:inline">#LBWritings</span>
      {/* Desktop menu */}
      <div className="hidden md:flex gap-6 text-sm font-mono tracking-widest uppercase text-[#5c4e46]">
        <a href="#services" onClick={(e) => { e.preventDefault(); playClick(); onNavigate('#services'); }} onMouseEnter={playHover} className="relative after:absolute after:-bottom-1 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:duration-300 after:bg-[#a85c3c] hover:text-[#a85c3c] transition-colors">Services</a>
        <a href="#portfolio" onClick={(e) => { e.preventDefault(); playClick(); onNavigate('#portfolio'); }} onMouseEnter={playHover} className="relative after:absolute after:-bottom-1 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:duration-300 after:bg-[#a85c3c] hover:text-[#a85c3c] transition-colors">Letters</a>
        <a href="#order" onClick={(e) => { e.preventDefault(); playClick(); onNavigate('#order'); }} onMouseEnter={playHover} className="relative after:absolute after:-bottom-1 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:duration-300 after:bg-[#a85c3c] hover:text-[#a85c3c] transition-colors">Order</a>
      </div>
      {/* Mobile hamburger */}
      <button onClick={toggleMenu} className="md:hidden flex items-center text-[#2c2421] z-50" aria-label="Toggle menu" onMouseEnter={playHover}>
        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile slide‑out menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 min-h-screen bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')] bg-[#ede6d8]/95 backdrop-blur-md flex flex-col items-center justify-center z-40 md:hidden"
          >
            {/* Vintage Decor */}
            <div className="absolute top-10 left-10 text-[#8c3a3a]/10 rotate-[-15deg]">
              <Flower2 className="w-32 h-32" strokeWidth={0.5} />
            </div>
            <div className="absolute bottom-10 right-10 text-[#5c4e46]/10 rotate-[25deg]">
              <Leaf className="w-40 h-40" strokeWidth={0.5} />
            </div>

            <div className="flex flex-col gap-10 text-center relative z-10">
              <a href="#services" onClick={(e) => { e.preventDefault(); playClick(); onNavigate('#services'); setMenuOpen(false); }} onMouseEnter={playHover} className="text-3xl font-serif italic text-[#2c2421] relative after:absolute after:-bottom-2 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:duration-300 after:bg-[#a85c3c] hover:text-[#a85c3c] transition-colors">Services</a>
              <a href="#portfolio" onClick={(e) => { e.preventDefault(); playClick(); onNavigate('#portfolio'); setMenuOpen(false); }} onMouseEnter={playHover} className="text-3xl font-serif italic text-[#2c2421] relative after:absolute after:-bottom-2 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:duration-300 after:bg-[#a85c3c] hover:text-[#a85c3c] transition-colors">Letters</a>
              <a href="#order" onClick={(e) => { e.preventDefault(); playClick(); onNavigate('#order'); setMenuOpen(false); }} onMouseEnter={playHover} className="text-3xl font-serif italic text-[#2c2421] relative after:absolute after:-bottom-2 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:duration-300 after:bg-[#a85c3c] hover:text-[#a85c3c] transition-colors">Order</a>
            </div>

            <a href="https://instagram.com/lovebeyondwritings" target="_blank" rel="noreferrer" onMouseEnter={playHover} onClick={playClick} className="absolute bottom-12 flex items-center gap-2 font-mono text-sm tracking-widest uppercase text-[#a85c3c] hover:text-[#2c2421] transition-colors duration-300 relative mt-16 after:absolute after:-bottom-1 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:duration-300 after:bg-[#2c2421]">
              <Instagram className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-300" /> @lovebeyondwritings
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Hero({ y, onNavigate }: { y: any, onNavigate: (id: string) => void }) {
  const { playHover, playClick } = useSound();
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 z-0 flex items-center justify-center opacity-10">
        <PenTool className="w-[800px] h-[800px] text-[#a85c3c]" />
      </motion.div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="inline-block border-b border-[#a85c3c] pb-2 mb-4">
            <span className="font-vintage text-2xl text-[#a85c3c]">Handwritten with Love</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-serif font-bold text-[#2c2421] leading-tight tracking-tight relative">
            <div className="opacity-0 pointer-events-none select-none" aria-hidden="true">
              Words that Stay <br />
              <span className="font-handwriting text-7xl md:text-9xl text-[#a85c3c]">Forever.</span>
            </div>
            <div className="absolute inset-0 text-center">
              <Typewriter text="Words that Stay  " delay={800} speed={60} />
              <br />
              <span className="font-handwriting text-7xl md:text-9xl text-[#a85c3c] relative inline-block">
                <Typewriter text="Forever." delay={800 + 16 * 60} speed={60} />
                <AnimatedUnderline delay={800 + 16 * 60 + 500} />
              </span>
            </div>
          </h1>

          <div className="relative max-w-2xl mx-auto">
            <p className="text-lg md:text-xl font-serif  text-[#0e0101] font-bold leading-relaxed tracking-wide opacity-0 pointer-events-none select-none" aria-hidden="true">
              In a world of instant texts, bring back the beauty of meaningful letters. Get custom letters and heartfelt messages for your loved ones, parents, and special occasions. Crafted with vintage elegance.
            </p>
            <p className="text-lg md:text-xl font-serif  text-[#5c4e46] leading-relaxed tracking-wide absolute inset-0 text-center">
              <Typewriter
                text="In a world of instant texts, bring back the beauty of meaningful letters. 
                Get custom letters and heartfelt messages for your loved ones, parents, and special occasions. Crafted with vintage elegance."

                delay={800 + 24 * 60 + 300}
                speed={30}
              />
            </p>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
            <motion.a
              href="#order"
              onClick={(e) => { e.preventDefault(); playClick(); onNavigate('#order'); }}
              onMouseEnter={playHover}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-8 py-4 bg-[#2c2421] text-[#f7f3ea] font-mono text-sm tracking-widest uppercase overflow-hidden transition-all duration-500 hover:bg-[#1a1513] hover:shadow-[0_0_30px_rgba(168,92,60,0.4)] border border-transparent hover:border-[#a85c3c]/30"
            >
              {/* Vintage glow pulse effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none group-hover:animate-pulse" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(168,92,60,0.25) 0%, transparent 70%)' }}></div>
              <span className="relative z-10 flex items-center gap-2">
                Commission a Letter <PenTool className="w-4 h-4 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 group-hover:text-[#a85c3c]" />
              </span>
            </motion.a>
            <a href="https://instagram.com/lovebeyondwritings" target="_blank" rel="noreferrer" onMouseEnter={playHover} onClick={playClick} className="group flex items-center gap-2 font-mono text-sm tracking-widest uppercase text-[#a85c3c] hover:text-[#2c2421] transition-colors duration-300 relative after:absolute after:-bottom-1 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:duration-300 after:bg-[#2c2421]">
              <Instagram className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-300" /> @lovebeyondwritings
            </a>
          </div>
        </motion.div>
      </div>

      {/* Decorative floating papers */}
      <FloatingPaper delay={0} className="top-1/4 left-10 -rotate-12" />
      <FloatingPaper delay={2} className="bottom-1/4 right-10 rotate-6" />

      <DecorativeStamp delay={0.5} />
    </section>
  );
}

function FloatingPaper({ delay, className }: { delay: number, className: string }) {
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -250]);
  const rotateParallax = useTransform(scrollYProgress, [0, 1], [0, 15]);

  return (
    <motion.div
      style={{ y: yParallax, rotate: rotateParallax }}
      className={`absolute w-32 h-40 bg-[#ede6d8] shadow-lg border border-[#2c2421]/5 p-4 hidden md:block ${className}`}
    >
      <motion.div
        initial={{ y: 0, rotate: 0 }}
        animate={{ y: [0, -10, 0], rotate: [0, -2, 0] }}
        transition={{ duration: 8, delay, repeat: Infinity, ease: "easeInOut" }}
        className="w-full h-full border border-[#2c2421]/10 flex flex-col gap-2 p-2 relative overflow-hidden"
      >
        <div className="absolute -right-4 -top-4 text-[#8c3a3a]/10 rotate-45">
          <Flower2 className="w-12 h-12" strokeWidth={1} />
        </div>
        <div className="h-1 w-3/4 bg-[#2c2421]/20 rounded relative z-10"></div>
        <div className="h-1 w-full bg-[#2c2421]/20 rounded relative z-10"></div>
        <div className="h-1 w-5/6 bg-[#2c2421]/20 rounded relative z-10"></div>
        <div className="h-1 w-1/2 bg-[#2c2421]/20 rounded relative z-10"></div>
      </motion.div>
    </motion.div>
  );
}

function Services() {
  const { playHover } = useSound();
  const services = [
    {
      title: "Love Letters",
      desc: "Express your deepest feelings with words crafted just for them. Perfect for anniversaries or just because.",
      icon: Heart
    },
    {
      title: "To Parents",
      desc: "Thank your parents for their endless love and support with a heartfelt, emotional message.",
      icon: Mail
    },
    {
      title: "Special Occasions",
      desc: "Birthdays, apologies, or congratulations. Make any moment unforgettable with a custom piece.",
      icon: PenTool
    }
  ];

  return (
    <section id="services" className="py-32 px-6 bg-[#ede6d8] relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-serif italic mb-4 text-[#2c2421] relative inline-block">
            Our Services
            <AnimatedCircle delay={500} />
          </h2>
          <p className="font-vintage text-2xl text-[#a85c3c]">What we write for you</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, rotate: -2 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.4, ease: "easeOut" } }}
              onMouseEnter={playHover}
              className="bg-[#f7f3ea] p-10 shadow-xl relative group transition-shadow duration-500 hover:shadow-2xl"
            >
              {/* Fold effect */}
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-transparent via-transparent to-[#ede6d8] border-b border-l border-[#2c2421]/10 shadow-sm transition-all duration-500 group-hover:w-16 group-hover:h-16"></div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.2 + 0.4, duration: 0.8, ease: "easeOut" }}
              >
                <s.icon className="w-8 h-8 text-[#a85c3c] mb-6 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" />
              </motion.div>
              <h3 className="text-2xl font-serif mb-4 text-[#2c2421]">{s.title}</h3>
              <p className="text-[#5c4e46] leading-relaxed font-serif text-lg">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Portfolio() {
  const { playHover } = useSound();
  return (
    <section id="portfolio" className="py-32 px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-serif italic mb-16 text-[#2c2421]">A Glimpse of Love</h2>

        <motion.div
          initial={{ opacity: 0, y: 60, rotate: -4, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, rotate: -1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ rotate: 0, scale: 1.02, transition: { duration: 0.6, ease: "easeOut" } }}
          onMouseEnter={playHover}
          className="bg-[#f7f3ea] p-12 md:p-20 shadow-2xl border border-[#2c2421]/10 relative mx-auto transform -rotate-1 transition-shadow duration-500 hover:shadow-[0_20px_50px_rgba(44,36,33,0.15)]"
        >
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#ede6d8]/50 backdrop-blur-sm shadow-sm -rotate-2"></div>

          <p className="font-handwriting text-3xl md:text-4xl leading-relaxed text-left text-[#2c2421]">
            "My dearest,<br /><br />
            I sit here trying to find the words that could possibly encompass what you mean to me. It is like trying to capture the ocean in a teacup. Every day with you is a gentle unfolding of a beautiful story...<br /><br />
            Yours always."
          </p>

          <div className="mt-12 flex justify-end">
            <div className="w-20 h-20 rounded-full border-2 border-[#8c3a3a] flex items-center justify-center opacity-80 rotate-12">
              <span className="font-vintage text-[#8c3a3a] text-sm text-center leading-tight">Love<br />Beyond</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PaperSwirls() {
  const colors = ['bg-[#e8e2d5]', 'bg-[#a85c3c]', 'bg-[#2c2421]', 'bg-[#5c4e46]'];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(24)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            top: -50,
            left: `${Math.random() * 100}%`,
            rotate: Math.random() * 360,
            opacity: 0
          }}
          animate={{
            top: '120%',
            left: `${Math.random() * 100}%`,
            rotate: Math.random() * 720,
            opacity: [0, 0.7, 0.7, 0]
          }}
          transition={{
            duration: 6 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear"
          }}
          className={`absolute w-3 h-5 md:w-4 md:h-6 ${colors[i % colors.length]} shadow-sm`}
          style={{
            clipPath: Math.random() > 0.5 ? 'polygon(0 0, 100% 10%, 90% 100%, 10% 90%)' : 'polygon(10% 0, 90% 10%, 100% 90%, 0 100%)'
          }}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial, index, playHover }: { key?: number, testimonial: any, index: number, playHover: () => void }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: testimonial.rotation.includes('-') ? -5 : 5 }}
      whileInView={{ opacity: 1, y: 0, rotate: testimonial.rotation.includes('-') ? -2 : 3 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 1.2, delay: index * 0.2, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ rotate: 0, scale: 1.02, transition: { duration: 0.5, ease: "easeOut" } }}
      onMouseEnter={playHover}
      className={`relative bg-[#f7f3ea] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#2c2421]/5 transition-all duration-500 hover:shadow-[0_15px_40px_rgb(0,0,0,0.12)] ${index === 2 ? 'md:col-span-2 md:w-2/3 md:mx-auto' : ''}`}
    >
      {/* Decorative pin */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-7 rounded-full bg-[#8c3a3a] shadow-sm border border-[#5c4e46]/20 z-10">
        <div className="absolute inset-1 rounded-full bg-white/30"></div>
      </div>

      <div className="mb-6 relative aspect-[4/5] overflow-hidden border border-[#2c2421]/10 bg-[#ede6d8]">
        <div className="absolute inset-0 bg-[#2c2421]/5 mix-blend-multiply z-10 pointer-events-none"></div>

        {/* Loading Skeleton */}
        <AnimatePresence>
          {!imageLoaded && (
            <motion.div
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center bg-[#ede6d8] z-0"
            >
              <div className="w-8 h-8 border-2 border-[#a85c3c]/30 border-t-[#a85c3c] rounded-full animate-spin"></div>
            </motion.div>
          )}
        </AnimatePresence>

        <img
          src={testimonial.image}
          alt={`Testimonial from ${testimonial.name}`}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover sepia-[0.2] hover:sepia-0 transition-all duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          referrerPolicy="no-referrer"
        />
      </div>

      <Quote className="w-8 h-8 text-[#a85c3c]/30 mb-4" />
      <p className="font-handwriting text-[#2c2421] text-2xl leading-relaxed mb-6">
        "{testimonial.quote}"
      </p>
      <div className="flex items-center gap-4">
        <div className="h-[1px] flex-1 bg-[#2c2421]/10"></div>
        <span className="font-mono text-sm tracking-widest text-[#5c4e46] uppercase">
          {testimonial.name}
        </span>
      </div>
    </motion.div>
  );
}

function Testimonials() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { playHover, playClick } = useSound();

  const toggleVideo = () => {
    playClick();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const testimonials = [
    {
      id: 1,
      name: "~Meva",
      quote: "Those writings literally means a lot. I valued it a lot but was never able to express it. Every word that you wrote were on point to my feelings towards them. I didn't expect to it be such precise. Thank you so much...",
      image: testimonial1,
      rotation: "-rotate-2"
    },
    {
      id: 2,
      name: "~Mandeep",
      quote: "Hey stranger(sissy),I feel to order for my self and I didn’t expect this much good you wrote it for me.After reading this I understand that you are good in writing something by imagining.Letter and words chala Bagunnay, Thank you 🥰.",
      image: testimonial2,
      rotation: "rotate-3"
    },
    {
      id: 3,
      name: "~Rihiya",
      quote: "Thank you so much for your writing raa 🥰. It felt me very happy and emotional 🥹. literally i cried after reading the word's.It was very good❣️and fantastic. Once again thank you so much 🥰🥰.....",
      image: testimonial3,
      rotation: "-rotate-1"
    }
  ];

  return (
    <section id="testimonials" className="py-32 px-6 relative z-10 bg-[#ede6d8]/80 border-y border-[#2c2421]/10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-serif text-[#2c2421] mb-6 relative inline-block">
            Whispers of Love
            <AnimatedCircle delay={500} />
          </h2>
          <p className="text-[#5c4e46] max-w-2xl mx-auto font-mono text-sm leading-relaxed">
            Read what our patrons have to say about the timeless letters we've crafted for their special moments.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Featured Video Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative aspect-[9/16] max-w-sm mx-auto bg-[#2c2421] p-3 shadow-[0_20px_50px_rgb(0,0,0,0.15)] -rotate-2 hover:rotate-0 transition-transform duration-700">
              {/* Decorative tape */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/40 backdrop-blur-sm rotate-2 z-20 shadow-sm border border-white/20 mix-blend-overlay"></div>

              <div className="relative w-full h-full overflow-hidden border border-[#5c4e46]/30 group cursor-pointer" onClick={toggleVideo} onMouseEnter={playHover}>
                <video
                  ref={videoRef}
                  src={heroVideo}
                  className="w-full h-full object-cover sepia-[0.3] group-hover:sepia-0 transition-all duration-700"
                  loop
                  muted
                  playsInline
                />

                {/* Play button overlay */}
                <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100 group-hover:bg-black/40'}`}>
                  <div className="w-16 h-16 rounded-full border-2 border-white/80 flex items-center justify-center backdrop-blur-sm transform group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 text-[#a85c3c] opacity-20 pointer-events-none">
                <Flower2 className="w-32 h-32" />
              </div>
            </div>
          </motion.div>

          {/* Testimonials Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} playHover={playHover} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function EnvelopeForm({ children, submitted, onReset }: { children: ReactNode, submitted: boolean, onReset: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const { playTear, playClick, playHover } = useSound();

  useEffect(() => {
    if (submitted) {
      setIsOpen(false);
    }
  }, [submitted]);

  return (
    <div className="relative max-w-4xl mx-auto mt-24 md:mt-32 pb-12">
      <motion.div
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        whileInView={!submitted && !isOpen ? "open" : undefined}
        viewport={{ once: true, margin: "-100px" }}
        onViewportEnter={() => {
          if (!isOpen && !submitted) {
            setTimeout(() => {
              playTear();
              setIsOpen(true);
            }, 500);
          }
        }}
        className="relative w-full max-w-3xl mx-auto perspective-1000"
      >
        {/* Envelope Container */}
        <div className="absolute inset-x-0 top-24 h-[400px] md:h-[500px]">
          {/* Envelope Back */}
          <div className="absolute inset-0 bg-[#d4c5b0] shadow-2xl rounded-sm"></div>

          {/* Envelope Front Flaps */}
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-sm">
            <div className="absolute top-0 left-0 bottom-0 w-1/2 bg-[#e0d0bc] border-r border-[#2c2421]/5" style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }}></div>
            <div className="absolute top-0 right-0 bottom-0 w-1/2 bg-[#e0d0bc] border-l border-[#2c2421]/5" style={{ clipPath: "polygon(100% 0, 0 50%, 100% 100%)" }}></div>
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#d8c6b2] border-t border-[#2c2421]/5" style={{ clipPath: "polygon(0 100%, 50% 0, 100% 100%)" }}></div>
          </div>

          {/* Envelope Top Flap */}
          <motion.div
            variants={{
              closed: { rotateX: 0, zIndex: 30 },
              open: { rotateX: 180, zIndex: 5 }
            }}
            transition={{ duration: 1, delay: isOpen ? 0.5 : 1.2, ease: "easeInOut" }}
            className="absolute top-0 left-0 right-0 h-[55%] bg-[#e6d5c3] origin-top drop-shadow-md border-b border-[#2c2421]/10"
            style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
          >
            {/* Wax seal */}
            <motion.div
              variants={{
                closed: { opacity: 1, scale: 1 },
                open: { opacity: 0, scale: 1.5 }
              }}
              transition={{ duration: 0.4, delay: isOpen ? 0.4 : 2 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#8c3a3a] rounded-full shadow-lg flex items-center justify-center border-2 border-[#5c2525]"
            >
              <Heart className="w-6 h-6 text-white/80" fill="currentColor" />
            </motion.div>
          </motion.div>

          {/* Confirmation Message on Envelope */}
          <AnimatePresence>
            {submitted && !isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
                transition={{ duration: 0.8, delay: 2.5 }}
                className="absolute inset-0 z-40 flex flex-col items-center justify-center text-[#2c2421]"
              >
                <div className="bg-white/40 backdrop-blur-sm p-8 rounded-lg text-center border border-white/50 shadow-xl">
                  <Send className="w-12 h-12 text-[#8c3a3a] mx-auto mb-4" />
                  <h3 className="text-3xl font-serif italic mb-2">Sealed & Sent</h3>
                  <p className="font-mono text-sm tracking-widest text-[#5c4e46] mb-6">We will begin crafting your letter soon.</p>
                  <button
                    onClick={() => { playClick(); onReset(); setIsOpen(true); }}
                    onMouseEnter={playHover}
                    className="font-mono text-sm tracking-widest uppercase text-[#a85c3c] hover:text-[#2c2421] transition-colors duration-300 relative after:absolute after:-bottom-1 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:duration-300 after:bg-[#2c2421]"
                  >
                    Send another request
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Letter (The Form) */}
        <motion.div
          variants={{
            closed: { y: 200, opacity: 0, zIndex: 10, pointerEvents: 'none' },
            open: { y: 0, opacity: 1, zIndex: 40, pointerEvents: 'auto' }
          }}
          transition={{ duration: 1, delay: isOpen ? 1.2 : 0, ease: "easeOut" }}
          className="relative bg-[#f7f3ea] text-[#2c2421] p-8 md:p-12 shadow-2xl mx-4 md:mx-12 mt-12 min-h-[600px]"
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}

function OrderSection() {
  const { playHover, playClick, playTear } = useSound();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    instagram: '',
    occasion: '',
    details: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        else if (value.trim().length < 2) error = 'Name is too short';
        break;
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email';
        break;
      case 'phone':
        if (!value.trim()) error = 'Phone number is required';
        else if (!/^\+?[\d\s-]{7,15}$/.test(value)) error = 'Please enter a valid phone number';
        break;
      case 'occasion':
        if (!value) error = 'Please select an occasion';
        break;
      case 'details':
        if (!value.trim()) error = 'Message details are required';
        else if (value.trim().length < 10) error = 'Please provide a bit more detail (min 10 characters)';
        break;
    }
    return error;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFocusedField(e.target.name);
    playHover();
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFocusedField(null);
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    playClick();

    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    setTouched({ name: true, email: true, phone: true, occasion: true, details: true });

    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('access_key', import.meta.env.VITE_WEB3FORMS_ACCESS_KEY);
      submitData.append('subject', `New Letter Request from ${formData.name}`);
      submitData.append('from_name', 'Love Beyond Writings');

      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value as string);
      });

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: submitData
      });

      const result = await response.json();

      if (result.success) {
        playTear();
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', instagram: '', occasion: '', details: '' });
        setTouched({});
      } else {
        alert("Something went wrong submitting the form. Please try again.");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Something went wrong submitting the form. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClass = (error: boolean | string | undefined) =>
    `w-full bg-[#ede6d8]/80 px-4 pb-2 pt-6 border focus:outline-none font-serif text-lg transition-all duration-300 shadow-[inset_0_1px_4px_rgba(44,36,33,0.05)] ${error ? 'border-[#8c3a3a] focus:border-[#8c3a3a] focus:shadow-[0_0_0_1px_#8c3a3a,inset_0_1px_4px_rgba(44,36,33,0.05)]' : 'border-[#2c2421]/20 focus:border-[#2c2421] focus:shadow-[0_0_0_1px_#2c2421,inset_0_1px_4px_rgba(44,36,33,0.05)]'}`;

  const getLabelClass = (isFocusedOrFilled: boolean) =>
    `absolute left-4 font-mono tracking-widest uppercase transition-all duration-300 pointer-events-none z-10 ${isFocusedOrFilled ? 'top-2 text-[10px] text-[#a85c3c]' : 'top-[18px] text-sm text-[#5c4e46]'}`;

  const noiseTexture = `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`;

  return (
    <section id="order" className="py-32 px-6 bg-[#2c2421] text-[#f7f3ea] relative overflow-hidden">
      <DecorativeStamp delay={0.2} light={true} />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16 relative z-50">
          <h2 className="text-4xl md:text-5xl font-serif italic mb-4 relative inline-block">
            Request a Letter
            <AnimatedUnderline delay={500} />
          </h2>
          <p className="font-vintage text-2xl text-[#a85c3c]">Let us write your story</p>
        </div>

        <EnvelopeForm submitted={submitted} onReset={() => setSubmitted(false)}>
          {/* Vintage border */}
          <div className="absolute inset-4 border border-[#2c2421]/20 pointer-events-none"></div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10" noValidate>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative">
                <label className={getLabelClass(focusedField === 'name' || !!formData.name)}>Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className={getInputClass(errors.name && touched.name)}
                  style={{ backgroundImage: noiseTexture }}
                />
                {errors.name && touched.name && <span className="text-[#8c3a3a] text-xs font-mono absolute -bottom-5 left-0">{errors.name}</span>}
              </div>
              <div className="relative">
                <label className={getLabelClass(focusedField === 'email' || !!formData.email)}>Your Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className={getInputClass(errors.email && touched.email)}
                  style={{ backgroundImage: noiseTexture }}
                />
                {errors.email && touched.email && <span className="text-[#8c3a3a] text-xs font-mono absolute -bottom-5 left-0">{errors.email}</span>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative">
                <label className={getLabelClass(focusedField === 'phone' || !!formData.phone)}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className={getInputClass(errors.phone && touched.phone)}
                  style={{ backgroundImage: noiseTexture }}
                />
                {errors.phone && touched.phone && <span className="text-[#8c3a3a] text-xs font-mono absolute -bottom-5 left-0">{errors.phone}</span>}
              </div>
              <div className="relative">
                <label className={getLabelClass(focusedField === 'instagram' || !!formData.instagram)}>Instagram Handle (Optional)</label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className={getInputClass(false)}
                  style={{ backgroundImage: noiseTexture }}
                />
              </div>
            </div>

            <div className="relative">
              <label className={getLabelClass(focusedField === 'occasion' || !!formData.occasion)}>Occasion</label>
              <select
                name="occasion"
                value={formData.occasion}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={`${getInputClass(errors.occasion && touched.occasion)} appearance-none cursor-pointer`}
                style={{ backgroundImage: noiseTexture }}
              >
                <option value="" disabled className="hidden"></option>
                <option value="love" className="text-[#2c2421]">Love Letter</option>
                <option value="birthday" className="text-[#2c2421]">Birthday</option>
                <option value="parents" className="text-[#2c2421]">To Parents</option>
                <option value="apology" className="text-[#2c2421]">Apology</option>
                <option value="other" className="text-[#2c2421]">Other</option>
              </select>
              {errors.occasion && touched.occasion && <span className="text-[#8c3a3a] text-xs font-mono absolute -bottom-5 left-0">{errors.occasion}</span>}
            </div>

            <div className="relative">
              <label className={getLabelClass(focusedField === 'details' || !!formData.details)}>Key Details / Message</label>
              <textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                rows={4}
                className={`${getInputClass(errors.details && touched.details)} resize-none`}
                style={{ backgroundImage: noiseTexture }}
              ></textarea>
              {errors.details && touched.details && <span className="text-[#8c3a3a] text-xs font-mono absolute -bottom-5 left-0">{errors.details}</span>}
            </div>

            <div className="pt-6 text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                onMouseEnter={playHover}
                className="group relative px-12 py-4 bg-[#2c2421] text-[#f7f3ea] font-mono text-sm tracking-widest uppercase overflow-hidden transition-all duration-500 hover:bg-[#1a1513] hover:shadow-[0_0_20px_rgba(44,36,33,0.4)] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2 mx-auto"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, transparent 70%)' }}></div>
                <span className="relative z-10 flex items-center gap-2">
                  {isSubmitting ? 'Sealing...' : <><Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" /> Send Inquiry</>}
                </span>
              </button>
              <p className="mt-4 font-mono text-xs text-[#a85c3c]">No payment required yet. We will contact you with a quote.</p>
            </div>
          </form>
        </EnvelopeForm>
      </div>
    </section>
  );
}

function Footer() {
  const { playHover, playClick } = useSound();
  return (
    <footer className="bg-[#2c2421] text-[#f7f3ea] py-12 px-6 border-t border-[#f7f3ea]/10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <Feather className="w-5 h-5 text-[#a85c3c]" />
          <span className="font-handwriting text-2xl">Love Beyond Writings</span>
        </div>

        <div className="flex gap-6 font-mono text-xs tracking-widest uppercase text-[#a85c3c]">
          <a href="https://instagram.com/lovebeyondwritings" target="_blank" rel="noreferrer" onMouseEnter={playHover} onClick={playClick} className="group hover:text-[#f7f3ea] transition-colors duration-300 flex items-center gap-2 relative after:absolute after:-bottom-1 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:duration-300 after:bg-[#f7f3ea]">
            <Instagram className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-300" /> Instagram
          </a>
          <a href="mailto:hello@lovebeyondwritings.com" onMouseEnter={playHover} onClick={playClick} className="group hover:text-[#f7f3ea] transition-colors duration-300 flex items-center gap-2 relative after:absolute after:-bottom-1 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:duration-300 after:bg-[#f7f3ea]">
            <Mail className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-300" /> Email
          </a>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-12 text-center font-mono text-xs text-[#a85c3c]/60">
        &copy; {new Date().getFullYear()} Love Beyond Writings. All rights reserved.
      </div>
    </footer>
  );
}

function DecorativeStamp({ delay = 0, light = false }: { delay?: number, light?: boolean }) {
  const [style, setStyle] = useState<{ top: string, left: string, rotate: number } | null>(null);
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);

  useEffect(() => {
    // Generate random positions constrained to avoid edges and overlapping main content too much
    const top = `${Math.floor(Math.random() * 60) + 15}%`;
    const left = `${Math.floor(Math.random() * 70) + 15}%`;
    const rotate = Math.floor(Math.random() * 60) - 30; // -30 to +30 degrees

    setStyle({ top, left, rotate });
  }, []);

  if (!style) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 2, rotate: style.rotate - 30 }}
      whileInView={{ opacity: light ? 0.2 : 0.4, scale: 1, rotate: style.rotate }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, type: "spring", bounce: 0.4 }}
      className={`absolute pointer-events-none z-20 flex items-center justify-center ${light ? 'mix-blend-screen' : 'mix-blend-multiply'}`}
      style={{ top: style.top, left: style.left, y: yParallax }}
    >
      <div className={`w-36 h-36 rounded-full border-[3px] border-dashed flex items-center justify-center ${light ? 'border-[#f7f3ea] text-[#f7f3ea]' : 'border-[#8c3a3a] text-[#8c3a3a]'}`}>
        <div className={`w-32 h-32 rounded-full border-2 flex items-center justify-center flex-col ${light ? 'border-[#f7f3ea]' : 'border-[#8c3a3a]'}`}>
          <div className="w-10 h-10 mb-1 rounded-full overflow-hidden flex items-center justify-center bg-white/80 relative">
            <img src="/logo.jpg" alt="LBW Logo" className="w-full h-full object-cover z-10" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <Heart className="w-5 h-5 absolute z-0 text-[#8c3a3a]" />
          </div>
          <span className="font-vintage text-sm leading-none text-center">LoveBeyond<br />Writings</span>
          <span className="font-mono text-[8px] tracking-[0.3em] mt-1">#LBW</span>
        </div>
      </div>
    </motion.div>
  );
}

function Typewriter({ text, delay = 0, speed = 50, className = "" }: { text: string, delay?: number, speed?: number, className?: string }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let i = 0;

    const startTyping = () => {
      const typeChar = () => {
        if (i < text.length) {
          setDisplayedText(text.substring(0, i + 1));
          i++;
          timeout = setTimeout(typeChar, speed);
        }
      };
      typeChar();
    };

    timeout = setTimeout(startTyping, delay);
    return () => clearTimeout(timeout);
  }, [text, delay, speed]);

  return <span className={className}>{displayedText}</span>;
}

function PaperTransition({
  state,
  targetId,
  onStateChange,
  onTargetChange
}: {
  state: 'idle' | 'dropping' | 'leaving',
  targetId: string | null,
  onStateChange: (s: 'idle' | 'dropping' | 'leaving') => void,
  onTargetChange: (t: string | null) => void
}) {
  return (
    <AnimatePresence>
      {state !== 'idle' && (
        <motion.div
          className="fixed inset-[-10%] z-[100] flex items-center justify-center bg-[#e8dcc4] shadow-[0_20px_100px_rgba(0,0,0,0.5)] pointer-events-auto"
          initial={{ y: "-110%", rotate: -5 }}
          animate={state === 'dropping' ? { y: "0%", rotate: 0 } : { y: "110%", rotate: 5 }}
          exit={{ y: "110%", rotate: 5 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          onAnimationComplete={() => {
            if (state === 'dropping') {
              if (targetId === '#root') {
                window.scrollTo({ top: 0, behavior: 'instant' });
              } else {
                const element = document.querySelector(targetId || '');
                if (element) {
                  const y = element.getBoundingClientRect().top + window.scrollY;
                  window.scrollTo({ top: y, behavior: 'instant' });
                }
              }
              setTimeout(() => onStateChange('leaving'), 200);
            } else if (state === 'leaving') {
              onStateChange('idle');
              onTargetChange(null);
            }
          }}
        >
          {/* Noise texture */}
          <div className="absolute inset-0 opacity-30 mix-blend-multiply" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")` }}></div>

          {/* Torn Edge Top */}
          <svg className="absolute top-0 left-0 w-full h-12 text-[#e8dcc4] -translate-y-[99%] drop-shadow-md" preserveAspectRatio="none" viewBox="0 0 100 10">
            <polygon fill="currentColor" points="0,10 0,0 2,8 4,2 6,9 8,1 10,7 12,3 14,9 16,2 18,8 20,1 22,9 24,3 26,8 28,2 30,9 32,1 34,8 36,2 38,9 40,0 42,8 44,2 46,9 48,1 50,7 52,3 54,9 56,2 58,8 60,1 62,9 64,3 66,8 68,2 70,9 72,1 74,8 76,2 78,9 80,0 82,8 84,2 86,9 88,1 90,7 92,3 94,9 96,2 98,8 100,0 100,10" />
          </svg>

          {/* Torn Edge Bottom */}
          <svg className="absolute bottom-0 left-0 w-full h-12 text-[#e8dcc4] translate-y-[99%] rotate-180 drop-shadow-md" preserveAspectRatio="none" viewBox="0 0 100 10">
            <polygon fill="currentColor" points="0,10 0,0 2,8 4,2 6,9 8,1 10,7 12,3 14,9 16,2 18,8 20,1 22,9 24,3 26,8 28,2 30,9 32,1 34,8 36,2 38,9 40,0 42,8 44,2 46,9 48,1 50,7 52,3 54,9 56,2 58,8 60,1 62,9 64,3 66,8 68,2 70,9 72,1 74,8 76,2 78,9 80,0 82,8 84,2 86,9 88,1 90,7 92,3 94,9 96,2 98,8 100,0 100,10" />
          </svg>

          {/* Doodles */}
          {/* Coffee Stain */}
          <div className="absolute top-[20%] right-[15%] w-32 h-32 border-4 border-[#8c3a3a]/10 rounded-full mix-blend-multiply filter blur-[1px]"></div>
          <div className="absolute top-[20%] right-[15%] w-28 h-28 border-2 border-[#8c3a3a]/15 rounded-full mix-blend-multiply filter blur-[0.5px] translate-x-2 translate-y-1"></div>

          {/* Squiggle */}
          <svg className="absolute bottom-[25%] left-[15%] w-24 h-24 text-[#a85c3c]/30 -rotate-12" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M10,50 Q25,20 40,50 T70,50 T90,50" />
          </svg>

          {/* Star */}
          <svg className="absolute top-[30%] left-[20%] w-12 h-12 text-[#a85c3c]/30 rotate-12" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50,10 L61,39 L92,39 L67,58 L76,89 L50,70 L24,89 L33,58 L8,39 L39,39 Z" />
          </svg>

          {/* Lines */}
          <svg className="absolute bottom-[30%] right-[20%] w-20 h-20 text-[#a85c3c]/20 rotate-6" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="10" y1="20" x2="90" y2="20" />
            <line x1="10" y1="40" x2="80" y2="40" />
            <line x1="10" y1="60" x2="85" y2="60" />
            <line x1="10" y1="80" x2="70" y2="80" />
          </svg>

          {/* Inner border and content */}
          <div className="w-[80%] h-[80%] border border-[#a85c3c]/30 flex items-center justify-center relative z-10">
            <div className="absolute top-8 left-8 w-16 h-16 border-t border-l border-[#a85c3c]/40"></div>
            <div className="absolute bottom-8 right-8 w-16 h-16 border-b border-r border-[#a85c3c]/40"></div>

            <div className="flex flex-col items-center gap-6">
              <Feather className="w-12 h-12 text-[#a85c3c]" />
              <span className="font-handwriting text-5xl md:text-7xl text-[#2c2421]">Turning the page...</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AnimatedUnderline({ delay = 0 }: { delay?: number }) {
  return (
    <div className="absolute -bottom-2 left-0 right-0 h-4 pointer-events-none">
      <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="w-full h-full text-[#a85c3c]/40 overflow-visible">
        <motion.path
          d="M 0 5 Q 25 8 50 4 T 100 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: delay / 1000, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

function AnimatedCircle({ delay = 0 }: { delay?: number }) {
  return (
    <div className="absolute inset-[-15%] pointer-events-none">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full text-[#a85c3c]/30 overflow-visible">
        <motion.path
          d="M 50 5 C 80 5 95 30 95 50 C 95 80 70 95 50 95 C 20 95 5 70 5 50 C 5 20 30 5 50 5 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: delay / 1000, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

function FloatingDoodles() {
  const [doodles, setDoodles] = useState<{ id: number, x: number, y: number, type: 'heart' | 'star', scale: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDoodles(prev => {
        const newDoodles = prev.length > 8 ? prev.slice(1) : [...prev];
        newDoodles.push({
          id: Date.now(),
          x: Math.random() * 90 + 5, // 5% to 95%
          y: Math.random() * 90 + 5,
          type: Math.random() > 0.5 ? 'heart' : 'star',
          scale: 0.5 + Math.random() * 0.8
        });
        return newDoodles;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-30 mix-blend-multiply">
      <AnimatePresence>
        {doodles.map(doodle => (
          <motion.div
            key={doodle.id}
            initial={{ opacity: 0, top: `${doodle.y}%`, left: `${doodle.x}%`, scale: 0, rotate: -20 }}
            animate={{
              opacity: [0, 0.3, 0],
              top: `${doodle.y - (doodle.type === 'heart' ? 10 : 0)}%`,
              left: `${doodle.x + (Math.random() * 4 - 2)}%`,
              scale: doodle.scale,
              rotate: 20
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 5, ease: "easeInOut" }}
            className="absolute text-[#a85c3c]"
          >
            {doodle.type === 'heart' && <Heart className="w-4 h-4 fill-current opacity-60" />}
            {doodle.type === 'star' && <Sparkles className="w-5 h-5 opacity-60" />}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function VintageInkBlots() {
  const [blots, setBlots] = useState<{ id: number, x: number, y: number, scale: number, rotation: number, type: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlots(prev => {
        // Keep a max of 5 blots on screen at once
        const newBlots = prev.length > 4 ? prev.slice(1) : [...prev];
        newBlots.push({
          id: Date.now(),
          x: Math.random() * 90 + 5,
          y: Math.random() * 90 + 5,
          scale: 0.8 + Math.random() * 1.5,
          rotation: Math.random() * 360,
          type: Math.floor(Math.random() * 3) // 3 different blot types
        });
        return newBlots;
      });
    }, 4000); // Spawn a new blot every 4 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-20 mix-blend-multiply">
      <AnimatePresence>
        {blots.map(blot => (
          <motion.div
            key={blot.id}
            initial={{ opacity: 0, scale: blot.scale * 0.8 }}
            animate={{
              opacity: [0, 0.12, 0], // Very subtle opacity
              scale: blot.scale
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 12, ease: "easeInOut" }} // Slow fade in and out
            className="absolute text-[#2c2421]"
            style={{
              top: `${blot.y}%`,
              left: `${blot.x}%`,
              transform: `translate(-50%, -50%) rotate(${blot.rotation}deg)`
            }}
          >
            {blot.type === 0 && (
              <svg width="64" height="64" viewBox="0 0 100 100" fill="currentColor" className="opacity-60 blur-[1px]">
                <path d="M45,20 C55,15 70,25 75,40 C80,55 70,75 55,80 C40,85 25,75 20,60 C15,45 25,30 45,20 Z" />
                <circle cx="20" cy="30" r="4" />
                <circle cx="80" cy="60" r="3" />
                <circle cx="30" cy="80" r="5" />
                <circle cx="70" cy="20" r="2" />
              </svg>
            )}
            {blot.type === 1 && (
              <svg width="80" height="80" viewBox="0 0 100 100" fill="currentColor" className="opacity-50 blur-[0.5px]">
                <path d="M30,30 C50,20 80,30 85,50 C90,70 70,90 50,85 C30,80 10,70 15,50 C20,30 10,40 30,30 Z" />
                <circle cx="15" cy="25" r="3" />
                <circle cx="85" cy="75" r="4" />
                <circle cx="50" cy="15" r="2" />
              </svg>
            )}
            {blot.type === 2 && (
              <svg width="50" height="50" viewBox="0 0 100 100" fill="currentColor" className="opacity-70 blur-[1px]">
                <path d="M50,10 C70,10 90,30 90,50 C90,70 70,90 50,90 C30,90 10,70 10,50 C10,30 30,10 50,10 Z" />
                <circle cx="10" cy="10" r="5" />
                <circle cx="90" cy="90" r="4" />
                <circle cx="10" cy="90" r="3" />
                <circle cx="90" cy="10" r="6" />
              </svg>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on devices with a fine pointer (mouse)
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'input' ||
        target.tagName.toLowerCase() === 'textarea' ||
        target.closest('a') ||
        target.closest('button') ||
        window.getComputedStyle(target).cursor === 'pointer';

      setIsHovering(!!isInteractive);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  return (
    <>
      <style>{`
        @media (pointer: fine) {
          * {
            cursor: none !important;
          }
        }
      `}</style>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:flex items-center justify-center"
        animate={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
          scale: isHovering ? 1.1 : 1,
          rotate: isHovering ? -15 : 0
        }}
        transition={{
          type: "spring",
          stiffness: 1000,
          damping: 40,
          mass: 0.2
        }}
      >
        <div className="relative">
          <Feather
            className={`w-8 h-8 transition-colors duration-300 drop-shadow-md ${isHovering ? 'text-[#8c3a3a]' : 'text-[#a85c3c]'}`}
            style={{ transform: 'rotate(90deg)' }}
          />
          <AnimatePresence>
            {isHovering && (
              <motion.div
                initial={{ opacity: 0, y: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], y: 15, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute top-1 left-1 w-1.5 h-1.5 bg-[#8c3a3a] rounded-full"
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}

function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { playHover, playClick } = useSound();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    playClick();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onClick={scrollToTop}
          onMouseEnter={playHover}
          className="fixed bottom-8 right-8 z-40 w-12 h-12 flex items-center justify-center bg-[#f7f3ea] text-[#2c2421] border border-[#2c2421]/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-[#2c2421] hover:text-[#f7f3ea] transition-all duration-500 group overflow-hidden"
          aria-label="Back to top"
        >
          {/* Vintage inner border */}
          <div className="absolute inset-1 border border-current opacity-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-40"></div>

          <div className="relative z-10 flex flex-col items-center justify-center">
            <ArrowUp className="w-5 h-5 transition-transform duration-500 group-hover:-translate-y-1" />
          </div>

          {/* Subtle hover background effect */}
          <div className="absolute inset-0 bg-[#a85c3c] opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"></div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}


