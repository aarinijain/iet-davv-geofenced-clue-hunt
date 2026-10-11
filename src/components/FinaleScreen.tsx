import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Download, RotateCcw, Share2, Check, Sparkles, AlertTriangle, Clock, Award } from 'lucide-react';
import { Checkpoint } from '../types/game';
import { sanitizeSquadName, triggerHaptic } from '../App';

export interface CheckpointStateSummary {
  currentStep: 'QUIZ' | 'CLUE' | 'SELFIE' | 'COMPLETED' | 'PENALIZED_LOCKOUT';
  capturedSelfie: string | null;
  clearedAt: string | null;
  warningCount: number;
}

interface FinaleScreenProps {
  squadName: string;
  score: number;
  checkpoints: Checkpoint[];
  checkpointsState: Record<string, CheckpointStateSummary>;
  onPlayAgain: () => void;
  totalTimeFormatted?: string;
  soundSynth?: {
    playRubberStampSlam: () => void;
    playTicketSelect: () => void;
  };
}

export const FinaleScreen: React.FC<FinaleScreenProps> = ({
  squadName,
  score,
  checkpoints,
  checkpointsState,
  onPlayAgain,
  totalTimeFormatted,
  soundSynth,
}) => {
  const [isGeneratingCollage, setIsGeneratingCollage] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute rank title by score: under 300 Rookie Explorer, 300-599 Trailblazer, 600+ Campus Legend
  const getRankTitle = (pts: number): string => {
    if (pts < 300) return 'Rookie Explorer';
    if (pts < 600) return 'Trailblazer';
    return 'Campus Legend';
  };
  const rankTitle = getRankTitle(score);
  const totalTime = totalTimeFormatted || '0:00';

  // Compute stats
  const total = checkpoints.length;
  const clearedCount = checkpoints.filter(
    (cp) => checkpointsState[cp.id]?.currentStep === 'COMPLETED'
  ).length;
  const lockedCount = checkpoints.filter(
    (cp) => checkpointsState[cp.id]?.currentStep === 'PENALIZED_LOCKOUT'
  ).length;

  // Fire celebratory confetti on mount
  useEffect(() => {
    soundSynth?.playRubberStampSlam();
    triggerHaptic([100, 50, 150]);

    // Burst of colorful paper confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2B3FE0', '#FFB627', '#0F8A68', '#EEF0F7'],
    });

    const timer = setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 100,
        origin: { y: 0.4 },
        colors: ['#FFB627', '#0F8A68', '#ffffff'],
      });
    }, 450);

    return () => clearTimeout(timer);
  }, [soundSynth]);

  // Generate downloadable squad collage canvas
  const handleDownloadCollage = async () => {
    soundSynth?.playTicketSelect();
    triggerHaptic(40);
    setIsGeneratingCollage(true);

    try {
      const canvas = hiddenCanvasRef.current || document.createElement('canvas');
      const width = 1200;
      const height = 900;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // 1. Draw passport paper desk background
      ctx.fillStyle = '#101A4A';
      ctx.fillRect(0, 0, width, height);

      // Inner passport page
      const margin = 40;
      ctx.fillStyle = '#EEF0F7';
      ctx.beginPath();
      ctx.roundRect(margin, margin, width - margin * 2, height - margin * 2, 24);
      ctx.fill();

      // Top decorative bar
      ctx.fillStyle = '#2B3FE0';
      ctx.fillRect(margin, margin, width - margin * 2, 80);

      // Header text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px "Bricolage Grotesque", sans-serif';
      ctx.fillText('DAVV CAMPUS QUEST · OFFICIAL PASSPORT RECORD', margin + 30, margin + 52);

      // Squad & Score Subheader
      ctx.fillStyle = '#101A4A';
      ctx.font = 'bold 24px "Bricolage Grotesque", sans-serif';
      ctx.fillText(`Squad: ${sanitizeSquadName(squadName)}`, margin + 30, margin + 120);

      ctx.fillStyle = '#2B3FE0';
      ctx.font = 'bold 18px "Bricolage Grotesque", sans-serif';
      ctx.fillText(`Rank: ${rankTitle}  ·  Time: ${totalTime}`, margin + 30, margin + 146);

      ctx.fillStyle = '#0F8A68';
      ctx.font = 'bold 24px "Bricolage Grotesque", sans-serif';
      ctx.fillText(`Final Score: ${score} PTS  (${clearedCount}/${total} Cleared)`, width - margin - 420, margin + 130);

      // 2. Draw 6 Polaroid spots (3 cols x 2 rows)
      const cols = 3;
      const rows = 2;
      const startX = margin + 30;
      const startY = margin + 160;
      const cardW = 340;
      const cardH = 290;
      const gapX = 35;
      const gapY = 30;

      // Helper to load image
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error('Image failed to load'));
          img.src = src;
        });
      };

      for (let i = 0; i < checkpoints.length; i++) {
        const cp = checkpoints[i];
        const st = checkpointsState[cp.id];
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (cardW + gapX);
        const y = startY + row * (cardH + gapY);

        // Draw polaroid card background
        ctx.save();
        // subtle rotation
        const angles = [-1.5, 1, -0.8, 1.2, -1, 0.5];
        const angle = (angles[i % angles.length] * Math.PI) / 180;
        ctx.translate(x + cardW / 2, y + cardH / 2);
        ctx.rotate(angle);
        ctx.translate(-(x + cardW / 2), -(y + cardH / 2));

        // Polaroid card shadow
        ctx.shadowColor = 'rgba(0,0,0,0.18)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 6;

        ctx.fillStyle = '#FAF9F5';
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, 6);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#DCD6C8';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Photo inner frame
        const photoX = x + 16;
        const photoY = y + 16;
        const photoW = cardW - 32;
        const photoH = 190;

        ctx.fillStyle = '#101A4A';
        ctx.fillRect(photoX, photoY, photoW, photoH);

        if (st?.currentStep === 'COMPLETED' && st.capturedSelfie) {
          try {
            const img = await loadImage(st.capturedSelfie);
            ctx.drawImage(img, photoX, photoY, photoW, photoH);
          } catch {
            // Draw placeholder if image fails
            ctx.fillStyle = '#0F8A68';
            ctx.fillRect(photoX, photoY, photoW, photoH);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText('STAMPED & VERIFIED', photoX + 40, photoY + 100);
          }
        } else if (st?.currentStep === 'PENALIZED_LOCKOUT') {
          ctx.fillStyle = '#551515';
          ctx.fillRect(photoX, photoY, photoW, photoH);
          ctx.fillStyle = '#D8281F';
          ctx.font = 'bold 24px "Bricolage Grotesque", sans-serif';
          ctx.fillText('VOID', photoX + photoW / 2 - 35, photoY + photoH / 2 + 8);
        } else {
          ctx.fillStyle = '#E2E8F0';
          ctx.fillRect(photoX, photoY, photoW, photoH);
          ctx.fillStyle = '#64748B';
          ctx.font = 'italic 16px sans-serif';
          ctx.fillText('Unvisited Checkpoint', photoX + 50, photoY + photoH / 2);
        }

        // Caption text
        ctx.fillStyle = '#101A4A';
        ctx.font = '24px "Caveat", cursive, sans-serif';
        const label =
          st?.currentStep === 'COMPLETED'
            ? `${cp.place}`
            : st?.currentStep === 'PENALIZED_LOCKOUT'
            ? `${cp.name} · Locked`
            : `${cp.name}`;
        ctx.fillText(label, photoX + 8, photoY + photoH + 34);

        ctx.font = '13px monospace';
        ctx.fillStyle = '#666';
        const stampMeta = st?.clearedAt ? `Cleared ${st.clearedAt}` : `Target #${i + 1}`;
        ctx.fillText(stampMeta, photoX + 8, photoY + photoH + 54);

        ctx.restore();
      }

      // Trigger automatic file download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `davv-quest-${sanitizeSquadName(squadName).toLowerCase().replace(/\s+/g, '-')}-passport.png`;
      link.href = dataUrl;
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to create collage:', err);
    } finally {
      setIsGeneratingCollage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2B3FE0] flex items-center justify-center p-3 sm:p-6 select-none font-sans">
      {/* Background patterned desk surface */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

      <canvas ref={hiddenCanvasRef} className="hidden" />

      {/* Main Finale Spread Container */}
      <div className="relative w-full max-w-4xl my-auto animate-fadeIn">
        <div className="passport-paper rounded-2xl shadow-2xl border border-white/60 overflow-hidden text-[#101A4A]">
          {/* Top Banner */}
          <div className="bg-[#101A4A] text-white px-6 py-5 flex flex-wrap items-center justify-between gap-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#FFB627] text-[#101A4A] font-heading font-black text-xl flex items-center justify-center shadow-md">
                DQ
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-[#FFB627] font-semibold block">
                  Field Mission Concluded
                </span>
                <h1 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight">
                  Quest Passport Completed
                </h1>
              </div>
            </div>

            {/* Score & Squad Emblem */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] text-white/60 uppercase block">Squad Registered</span>
                <strong className="text-[#FFB627] font-heading font-bold text-base">
                  {sanitizeSquadName(squadName)}
                </strong>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#FFB627]" />
                <span className="font-heading font-black text-lg text-[#FFB627]">{score} pts</span>
              </div>
            </div>
          </div>

          {/* Main Body: Stamped Polaroids Grid */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Rank & Run Time Achievement Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#FAF9F5] border-2 border-[#FFB627] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFB627] text-[#101A4A] flex items-center justify-center font-heading font-black text-xl shadow-xs">
                  <Award className="w-6 h-6 text-[#101A4A]" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#101A4A]/60 block">
                    Official Rank
                  </span>
                  <h2 className="font-heading font-black text-lg sm:text-xl text-[#101A4A]">
                    {rankTitle}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#101A4A] text-white shadow-xs">
                <Clock className="w-4 h-4 text-[#FFB627]" />
                <span className="text-xs font-semibold text-white/80">Total Time:</span>
                <span className="font-mono font-bold text-sm text-[#FFB627]">{totalTime}</span>
              </div>
            </div>

            {/* Mission Stats Badge Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-[#101A4A]/15 shadow-sm text-center">
                <span className="text-[10px] uppercase font-semibold text-[#101A4A]/60 block">Checkpoints</span>
                <strong className="font-heading font-black text-xl text-[#101A4A]">{total}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#0F8A68]/30 shadow-sm text-center">
                <span className="text-[10px] uppercase font-semibold text-[#0F8A68] block">Cleared</span>
                <strong className="font-heading font-black text-xl text-[#0F8A68]">{clearedCount}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#D8281F]/30 shadow-sm text-center">
                <span className="text-[10px] uppercase font-semibold text-[#D8281F] block">Void / Locked</span>
                <strong className="font-heading font-black text-xl text-[#D8281F]">{lockedCount}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#FFB627]/40 shadow-sm text-center">
                <span className="text-[10px] uppercase font-semibold text-[#101A4A]/60 block">Total Bounty</span>
                <strong className="font-heading font-black text-xl text-[#2B3FE0]">{score} pts</strong>
              </div>
            </div>

            {/* Polaroid Collage Display */}
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-[#101A4A]/10 pb-2">
                <h3 className="font-heading font-extrabold text-base text-[#101A4A] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FFB627]" />
                  <span>Stamped Passport Polaroids</span>
                </h3>
                <span className="text-xs text-[#101A4A]/60 font-medium">
                  {clearedCount} of {total} captured
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
                {checkpoints.map((cp, idx) => {
                  const st = checkpointsState[cp.id];
                  const isCleared = st?.currentStep === 'COMPLETED';
                  const isLocked = st?.currentStep === 'PENALIZED_LOCKOUT';

                  // Rotations for authentic pinboard desk look
                  const rotations = ['rotate-[-2deg]', 'rotate-[1.5deg]', 'rotate-[-1deg]', 'rotate-[2deg]', 'rotate-[-1.5deg]', 'rotate-[1deg]'];
                  const rot = rotations[idx % rotations.length];

                  return (
                    <div
                      key={cp.id}
                      className={`bg-[#FAF9F5] p-3 pb-5 rounded-sm shadow-md border border-slate-300 transition-transform hover:scale-102 hover:rotate-0 hover:shadow-xl ${rot}`}
                    >
                      <div className="aspect-video bg-[#101A4A] rounded-xs overflow-hidden mb-2 relative">
                        {isCleared && st.capturedSelfie ? (
                          <img
                            src={st.capturedSelfie}
                            alt={cp.place}
                            className="w-full h-full object-cover"
                          />
                        ) : isLocked ? (
                          <div className="w-full h-full bg-[#3d0f0f] flex flex-col items-center justify-center p-2 text-center text-[#D8281F]">
                            <span className="font-heading font-black text-xl tracking-wider">VOID</span>
                            <span className="text-[10px] text-white/70">3 warnings exceeded</span>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs italic">
                            Unvisited
                          </div>
                        )}

                        {/* Stamp ribbon */}
                        {isCleared && (
                          <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-[#0F8A68] text-white text-[9px] font-heading font-bold shadow-sm">
                            CLEARED
                          </span>
                        )}
                      </div>

                      {/* Handwritten Landmark Caption */}
                      <div className="text-center font-handwriting text-lg sm:text-xl text-[#101A4A] leading-tight truncate">
                        {isCleared ? cp.place : cp.name}
                      </div>
                      <div className="text-[10px] text-center text-[#101A4A]/50 font-mono mt-0.5">
                        {st?.clearedAt ? `Cleared ${st.clearedAt}` : `Target #${idx + 1}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions: Download Collage & Play Again */}
            <div className="pt-4 border-t border-[#101A4A]/15 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={onPlayAgain}
                className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 border border-[#101A4A]/25 text-[#101A4A] font-heading font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play again</span>
              </button>

              <button
                onClick={handleDownloadCollage}
                disabled={isGeneratingCollage}
                className="px-6 py-3.5 rounded-xl bg-[#101A4A] hover:bg-[#1C2C75] text-[#FFB627] font-heading font-black text-sm uppercase tracking-wider shadow-lg transition active:scale-98 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-[#0F8A68]" />
                    <span>Collage downloaded</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{isGeneratingCollage ? 'Creating collage...' : 'Download squad collage'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
