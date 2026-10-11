import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BookOpen, Check, ArrowRight, ArrowLeft, Stamp, Sparkles, HelpCircle } from 'lucide-react';
import { sanitizeSquadName, triggerHaptic } from '../App';

interface IntroScreenProps {
  initialSquadName: string;
  onStartQuest: (confirmedSquadName: string) => void;
  onDismiss?: () => void;
  soundSynth?: {
    playTicketSelect: () => void;
    playRubberStampSlam: () => void;
    playWaxSealBreak: () => void;
  };
  isRevisit?: boolean;
}

const TUTORIAL_CARDS = [
  {
    step: '1',
    title: 'Crack the sealed puzzle',
    subtitle: 'Solve the riddle to break the wax seal and reveal your secret campus destination clue.',
    tag: 'Gatekeeper Stage',
  },
  {
    step: '2',
    title: 'Navigate using the live map',
    subtitle: 'Use the campus map to track your location. When you reach the hidden spot, press "I have arrived".',
    tag: 'Arrival Check',
  },
  {
    step: '3',
    title: 'Take a squad selfie',
    subtitle: 'Capture a selfie on location to get your passport page officially stamped and earn +150 points.',
    tag: 'Verification',
  },
  {
    step: '4',
    title: 'Avoid warning strikes',
    subtitle: 'Three wrong arrival attempts outside the checkpoint perimeter deduct -50 points and lock that stage forever.',
    tag: '3 Strikes Rule',
  },
];

export const IntroScreen: React.FC<IntroScreenProps> = ({
  initialSquadName,
  onStartQuest,
  onDismiss,
  soundSynth,
  isRevisit = false,
}) => {
  // Passport open state
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [coverAngle, setCoverAngle] = useState<number>(0); // 0 = closed, -180 = fully open
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartX = useRef<number>(0);
  const dragStartAngle = useRef<number>(0);

  // Squad name state
  const [squadName, setSquadName] = useState<string>(initialSquadName || '');
  const [isStamped, setIsStamped] = useState<boolean>(Boolean(initialSquadName && initialSquadName !== 'Squad Phoenix'));

  // Tutorial slide state
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);

  // Sync initial squad name
  useEffect(() => {
    if (initialSquadName) {
      setSquadName(initialSquadName);
      if (initialSquadName.trim().length > 0) {
        setIsStamped(true);
      }
    }
  }, [initialSquadName]);

  const handleOpenPassport = useCallback(() => {
    soundSynth?.playWaxSealBreak();
    triggerHaptic([40, 60]);
    setIsOpen(true);
    setCoverAngle(-180);
  }, [soundSynth]);

  // Pointer drag events for realistic cover opening
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isOpen) return;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartAngle.current = coverAngle;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || isOpen) return;
    const deltaX = e.clientX - dragStartX.current;
    // Dragging left (negative deltaX) opens cover towards -180 deg
    const tentativeAngle = Math.max(-180, Math.min(0, dragStartAngle.current + deltaX * 0.7));
    setCoverAngle(tentativeAngle);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }

    // Snap open if rotated past -45 degrees, else snap closed
    if (coverAngle <= -45) {
      handleOpenPassport();
    } else {
      setCoverAngle(0);
      setIsOpen(false);
    }
  };

  const handleSquadInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const clean = sanitizeSquadName(raw);
    setSquadName(clean);
    // If they edit the name, reset the stamped status until they press "Stamp it"
    if (isStamped) {
      setIsStamped(false);
    }
  };

  const handleStampSquad = () => {
    const trimmed = squadName.trim();
    if (!trimmed) return;
    soundSynth?.playRubberStampSlam();
    triggerHaptic([70, 40, 120]);
    setIsStamped(true);
  };

  const handleStartQuest = () => {
    soundSynth?.playTicketSelect();
    triggerHaptic(50);
    const confirmedName = squadName.trim() || 'Squad Phoenix';
    onStartQuest(confirmedName);
  };

  const handleCardNext = () => {
    soundSynth?.playTicketSelect();
    triggerHaptic(30);
    setActiveCardIndex((prev) => (prev + 1) % TUTORIAL_CARDS.length);
  };

  const handleCardPrev = () => {
    soundSynth?.playTicketSelect();
    triggerHaptic(30);
    setActiveCardIndex((prev) => (prev - 1 + TUTORIAL_CARDS.length) % TUTORIAL_CARDS.length);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2B3FE0] flex items-center justify-center p-3 sm:p-6 select-none font-sans">
      {/* Background patterned desk surface */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Dismiss button if reopening via How to play */}
      {isRevisit && onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 z-50 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
        >
          <span>Back to Quest</span>
        </button>
      )}

      {/* Main 3D Passport Stage Container */}
      <div className="relative w-full max-w-4xl my-auto [perspective:1400px]">
        {!isOpen ? (
          /* ======================================================== */
          /* CLOSED PASSPORT (NAVY COVER WITH GOLD EMBOSSED EMBLEM)   */
          /* ======================================================== */
          <div className="flex flex-col items-center justify-center py-6">
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{
                transform: `rotateY(${coverAngle}deg)`,
                transformOrigin: 'left center',
                transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="w-full max-w-sm sm:max-w-md aspect-[3/4.2] rounded-2xl bg-[#101A4A] border-4 border-[#FFB627]/40 shadow-2xl p-6 sm:p-8 flex flex-col justify-between items-center text-center cursor-grab active:cursor-grabbing relative overflow-hidden select-none"
            >
              {/* Subtle leather / woven texture highlight */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />

              {/* Gold border inset frame */}
              <div className="absolute inset-3 rounded-xl border border-[#FFB627]/30 pointer-events-none" />

              {/* Header crest */}
              <div className="relative z-10 pt-2">
                <span className="text-[11px] sm:text-xs tracking-widest text-[#FFB627]/80 uppercase font-semibold block">
                  Official Field Expedition
                </span>
                <div className="w-12 h-0.5 bg-[#FFB627]/60 mx-auto mt-2" />
              </div>

              {/* Gold Embossed Emblem & Title */}
              <div className="relative z-10 my-auto flex flex-col items-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[#FFB627] bg-[#16235e] flex items-center justify-center shadow-inner mb-4 relative">
                  <div className="w-16 h-16 sm:h-20 sm:w-20 rounded-full border border-dashed border-[#FFB627]/60 flex items-center justify-center">
                    <span className="font-heading font-black text-2xl sm:text-3xl text-[#FFB627] tracking-tight">
                      IET
                    </span>
                  </div>
                </div>

                <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#EEF0F7] tracking-tight leading-tight mb-1">
                  DAVV Campus Quest
                </h1>
                <p className="font-handwriting text-xl sm:text-2xl text-[#FFB627]">
                  Takshashila Campus · Indore
                </p>
                <div className="text-[11px] text-white/50 tracking-wider uppercase mt-2">
                  Official Squad Passport
                </div>
              </div>

              {/* Footer instruction */}
              <div className="relative z-10 pb-2">
                <p className="text-xs text-white/70 italic mb-3">
                  Drag the cover open, or press the button.
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenPassport();
                  }}
                  className="w-full py-3 px-6 rounded-xl bg-[#FFB627] hover:bg-[#ffaa0d] text-[#101A4A] font-heading font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-black/30 transition transform active:scale-95 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Open passport</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* OPEN PASSPORT (TWO-PAGE SPREAD ON COBALT DESK)           */
          /* ======================================================== */
          <div className="relative rounded-2xl shadow-2xl bg-[#EEF0F7] border border-white/60 overflow-hidden text-[#101A4A] animate-fadeIn">
            {/* Binder Rings Strip down center (for desktop) / left */}
            <div className="hidden md:flex absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 flex-col justify-around items-center py-6 pointer-events-none z-20">
              {[1, 2, 3, 4, 5].map((hole) => (
                <div
                  key={hole}
                  className="w-4 h-4 rounded-full bg-[#2B3FE0] border border-black/30 shadow-inner flex items-center justify-center"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-black/30" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#101A4A]/10">
              {/* ==================================================== */}
              {/* INSIDE LEFT PAGE: "NAME YOUR SQUAD"                  */}
              {/* ==================================================== */}
              <div className="p-6 sm:p-8 flex flex-col justify-between relative bg-[#EEF0F7]">
                <div className="space-y-4">
                  {/* Page header */}
                  <div className="flex items-center justify-between border-b border-[#101A4A]/15 pb-3">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#101A4A]/60 block">
                        Page 01 · Squad Registry
                      </span>
                      <h2 className="font-heading font-extrabold text-2xl text-[#101A4A] tracking-tight">
                        Name your squad
                      </h2>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#FFB627]/20 border border-[#FFB627] flex items-center justify-center text-[#101A4A] font-heading font-black text-xs">
                      01
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#101A4A]/70 leading-relaxed">
                    Choose a distinct handle for your crew. This name will appear on all stamped polaroids,
                    checkpoint logs, and the squad leaderboard.
                  </p>

                  {/* Name Input Box & Stamp Container */}
                  <div className="relative p-5 rounded-2xl bg-white border-2 border-[#101A4A]/15 shadow-sm space-y-3">
                    <label className="text-xs font-semibold text-[#101A4A]/80 uppercase tracking-wide block">
                      Squad identification (max 24 chars)
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        value={squadName}
                        maxLength={24}
                        placeholder="e.g. Takshashila Titans"
                        onChange={handleSquadInput}
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#101A4A]/20 focus:border-[#2B3FE0] focus:ring-2 focus:ring-[#FFB627] bg-[#EEF0F7]/40 text-[#101A4A] font-heading font-bold text-base outline-none transition"
                      />
                      <span className="absolute right-3 top-3.5 text-xs text-[#101A4A]/50 font-mono">
                        {squadName.length}/24
                      </span>
                    </div>

                    {/* RUBBER STAMP SLAM OVERLAY */}
                    {isStamped && (
                      <div className="pt-2 flex justify-center">
                        <div className="border-4 border-[#0F8A68] text-[#0F8A68] font-heading font-black text-lg sm:text-xl tracking-wider py-1.5 px-4 rounded-xl rotate-[-5deg] animate-stamp-slam shadow-sm select-none">
                          SQUAD REGISTERED
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stamp It Button */}
                  <button
                    onClick={handleStampSquad}
                    disabled={!squadName.trim()}
                    className={`w-full py-3 rounded-xl font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-2 transition shadow-sm ${
                      squadName.trim()
                        ? 'bg-[#101A4A] hover:bg-[#1C2C75] text-[#FFB627] border-[#101A4A] cursor-pointer active:scale-98'
                        : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                    } focus:outline-none focus:ring-2 focus:ring-[#FFB627]`}
                  >
                    <Stamp className="w-4 h-4" />
                    <span>Stamp it</span>
                  </button>
                </div>

                {/* Left Page Footer Note */}
                <div className="pt-4 mt-4 border-t border-[#101A4A]/10 text-[11px] text-[#101A4A]/60 flex items-center justify-between">
                  <span>DAVV Takshashila IET</span>
                  <span className="font-handwriting text-base text-[#101A4A]">Ready for deployment</span>
                </div>
              </div>

              {/* ==================================================== */}
              {/* INSIDE RIGHT PAGE: 4 TAPPABLE TICKET-STUB CARDS      */}
              {/* ==================================================== */}
              <div className="p-6 sm:p-8 flex flex-col justify-between bg-[#EEF0F7]">
                <div className="space-y-4">
                  {/* Page header */}
                  <div className="flex items-center justify-between border-b border-[#101A4A]/15 pb-3">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#101A4A]/60 block">
                        Page 02 · Quest Briefing
                      </span>
                      <h2 className="font-heading font-extrabold text-2xl text-[#101A4A] tracking-tight">
                        Rules of engagement
                      </h2>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#FFB627]/20 border border-[#FFB627] flex items-center justify-center text-[#101A4A] font-heading font-black text-xs">
                      02
                    </div>
                  </div>

                  {/* Tappable Ticket Stub Card Carousel */}
                  <div
                    onClick={handleCardNext}
                    className="relative p-5 rounded-2xl bg-white border-2 border-[#101A4A]/15 shadow-sm ticket-stub cursor-pointer hover:border-[#101A4A]/30 transition select-none min-h-[175px] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-heading font-extrabold bg-[#101A4A] text-[#FFB627] uppercase tracking-wider">
                          Rule {TUTORIAL_CARDS[activeCardIndex].step} of {TUTORIAL_CARDS.length}
                        </span>
                        <span className="text-xs font-semibold text-[#101A4A]/50">
                          {TUTORIAL_CARDS[activeCardIndex].tag}
                        </span>
                      </div>

                      <h3 className="font-heading font-extrabold text-lg text-[#101A4A] leading-snug mt-1">
                        {TUTORIAL_CARDS[activeCardIndex].title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#101A4A]/80 leading-relaxed mt-1.5">
                        {TUTORIAL_CARDS[activeCardIndex].subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 text-[11px] text-[#101A4A]/50 font-medium border-t border-[#101A4A]/10 mt-2">
                      <span>Tap card to cycle rules</span>
                      <span className="text-[#2B3FE0] font-semibold flex items-center gap-1">
                        Next rule <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* Dots Indicator & Card Navigation */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={handleCardPrev}
                      className="p-1.5 rounded-lg border border-[#101A4A]/20 hover:bg-white text-[#101A4A] text-xs transition focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
                      title="Previous rule"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {TUTORIAL_CARDS.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            soundSynth?.playTicketSelect();
                            setActiveCardIndex(idx);
                          }}
                          className={`h-2 rounded-full transition-all ${
                            idx === activeCardIndex
                              ? 'w-6 bg-[#101A4A]'
                              : 'w-2 bg-[#101A4A]/25 hover:bg-[#101A4A]/50'
                          }`}
                          title={`Rule ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleCardNext}
                      className="p-1.5 rounded-lg border border-[#101A4A]/20 hover:bg-white text-[#101A4A] text-xs transition focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
                      title="Next rule"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Start The Quest Primary Action Button */}
                <div className="pt-6">
                  <button
                    onClick={handleStartQuest}
                    className="w-full py-4 rounded-xl bg-[#0F8A68] hover:bg-[#0c7054] text-white font-heading font-black text-sm uppercase tracking-wider shadow-lg shadow-black/15 transition transform active:scale-98 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
                  >
                    <Sparkles className="w-4 h-4 text-[#FFB627]" />
                    <span>Start the quest</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
