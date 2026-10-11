import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Volume2,
  VolumeX,
  Camera,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Unlock,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  X,
  Upload,
  Pin,
  Edit2,
  Check,
  FileText,
  HelpCircle,
  Award,
  Home,
  Sun,
  Moon,
  Clock,
} from 'lucide-react';
import { SquadLeaderboard } from './components/SquadLeaderboard';
import { Checkpoint } from './types/game';
import { DEFAULT_CHECKPOINTS } from './data/defaultCheckpoints';
import { PlayerMap, MapPinItem } from './components/PlayerMap';
import { IntroScreen } from './components/IntroScreen';
import { FinaleScreen } from './components/FinaleScreen';

const DEMO_TOOLS_ENABLED = true;

// ==========================================
// 1. SOUND EFFECTS SYNTHESIZER (WEB AUDIO API)
// ==========================================
class PassportSoundSynth {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // Tactile ticket punch / select
  public playTicketSelect() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(640, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.06);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  // Wax seal break & envelope open
  public playWaxSealBreak() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Crinkle / snap burst
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc1.type = 'square';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(420, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    osc2.frequency.setValueAtTime(880, now + 0.08);
    osc2.frequency.exponentialRampToValueAtTime(1320, now + 0.28);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);
    osc1.start(now);
    osc2.start(now + 0.08);
    osc1.stop(now + 0.15);
    osc2.stop(now + 0.3);
  }

  // Envelope wrong answer buzz
  public playWrongBuzz() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.setValueAtTime(140, now + 0.15);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Strike warning alarm
  public playPerimeterStrike() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [0, 0.11].forEach((offset) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now + offset);
      osc.frequency.setValueAtTime(320, now + offset + 0.05);
      gain.gain.setValueAtTime(0.18, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.09);
    });
  }

  // Camera shutter mechanical click
  public playCameraShutter() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(950, now);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.04);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(540, now + 0.07);
    gain2.gain.setValueAtTime(0.28, now + 0.07);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.07);
    osc2.stop(now + 0.13);
  }

  // Heavy rubber stamp slam impact
  public playRubberStampSlam() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.22);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);

    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((freq, idx) => {
      const noteOsc = this.ctx!.createOscillator();
      const noteGain = this.ctx!.createGain();
      const noteTime = now + 0.05 + idx * 0.04;
      noteOsc.type = 'sine';
      noteOsc.frequency.setValueAtTime(freq, noteTime);
      noteGain.gain.setValueAtTime(0.12, noteTime);
      noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);
      noteOsc.connect(noteGain);
      noteGain.connect(this.ctx!.destination);
      noteOsc.start(noteTime);
      noteOsc.stop(noteTime + 0.35);
    });
  }

  // Red VOID stamp slam
  public playVoidStampSlam() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.4);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  }
}

const sounds = new PassportSoundSynth();

// Vibration API / Haptic Trigger Helper
export const triggerHaptic = (pattern: number | number[]) => {
  if (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    'vibrate' in navigator &&
    typeof navigator.vibrate === 'function'
  ) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Graceful fallback
    }
  }
};

// Safe Squad Name Sanitizer
export const sanitizeSquadName = (input: string): string => {
  if (!input) return 'Squad Phoenix';
  return input
    .replace(/[<>'"&/]/g, '')
    .trim()
    .slice(0, 24);
};

// ==========================================
// 2. GEOLOCATION HAVERSINE FORMULA
// ==========================================
interface Coordinates {
  lat: number;
  lng: number;
}

// Compute player's live distance to target using the haversine formula internally
function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's mean radius in meters
  const rad1 = (lat1 * Math.PI) / 180;
  const rad2 = (lat2 * Math.PI) / 180;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(rad1) * Math.cos(rad2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// ==========================================
// 3. TYPES & 6 CHECKPOINTS (IET DAVV, INDORE)
// ==========================================
export type PassportStep = 'QUIZ' | 'CLUE' | 'SELFIE' | 'COMPLETED' | 'PENALIZED_LOCKOUT';

export interface CheckpointRunState {
  currentStep: PassportStep;
  selectedOption: number | null;
  quizError: string | null;
  warningCount: number; // 0, 1, 2, 3
  warningMessage: string | null;
  penaltyApplied: boolean;
  capturedSelfie: string | null;
  clearedAt: string | null;
}

// The exact 6 checkpoints for IET DAVV, Indore
export const CHECKPOINTS_DATA: Checkpoint[] = DEFAULT_CHECKPOINTS;

const CAMPUS_ORIGIN: Coordinates = {
  lat: CHECKPOINTS_DATA[0].lat,
  lng: CHECKPOINTS_DATA[0].lng,
};

const WARNING_LIMIT = 3;
const PENALTY_POINTS = 50;
const STAGE_CLEAR_POINTS = 150;
const STORAGE_KEY = 'davv_squad_passport_v3';
const MAP_THEME_STORAGE_KEY = 'davv_map_theme_v1';
const TIMER_START_KEY = 'davv_quest_timer_start_v1';
const TIMER_FINISH_KEY = 'davv_quest_timer_finish_v1';

// ==========================================
// 4. MAIN PASSPORT REACT COMPONENT
// ==========================================
export default function App() {
  // Load saved state or default
  const [squadName, setSquadName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.squadName) return parsed.squadName;
      }
    } catch {
      // Ignore
    }
    return 'Squad Phoenix';
  });

  const [isEditingSquad, setIsEditingSquad] = useState<boolean>(false);
  const [squadInputText, setSquadInputText] = useState<string>(squadName);

  const [score, setScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.score === 'number') return parsed.score;
      }
    } catch {
      // Ignore
    }
    return 100;
  });

  const [activeCpIndex, setActiveCpIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.activeCpIndex === 'number' && parsed.activeCpIndex < CHECKPOINTS_DATA.length) {
          return parsed.activeCpIndex;
        }
      }
    } catch {
      // Ignore
    }
    return 0;
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPinboardOpen, setIsPinboardOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [mapTheme, setMapTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(MAP_THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {
      // Ignore
    }
    return 'dark';
  });
  const [showFront, setShowFront] = useState<boolean>(true);
  const [showIntroScreen, setShowIntroScreen] = useState<boolean>(false);
  const [isRevisitingIntro, setIsRevisitingIntro] = useState<boolean>(false);
  const [showFinaleScreen, setShowFinaleScreen] = useState<boolean>(false);
  const [isConfirmingRestart, setIsConfirmingRestart] = useState<boolean>(false);
  const restartConfirmTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Run Timer: Starts when leaving front page for the first time, persisted across reloads
  const [questStartTime, setQuestStartTime] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(TIMER_START_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return null;
  });

  const [questFinishTime, setQuestFinishTime] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(TIMER_FINISH_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return null;
  });

  const [currentTimestamp, setCurrentTimestamp] = useState<number>(Date.now());

  // Timer ticker
  useEffect(() => {
    if (!questStartTime || questFinishTime) return;
    const interval = setInterval(() => {
      setCurrentTimestamp(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [questStartTime, questFinishTime]);

  const elapsedSeconds = useMemo(() => {
    if (!questStartTime) return 0;
    const end = questFinishTime || currentTimestamp;
    return Math.max(0, Math.floor((end - questStartTime) / 1000));
  }, [questStartTime, questFinishTime, currentTimestamp]);

  const formatTimer = (totalSec: number): string => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Lock timer once finale is accessed
  useEffect(() => {
    if (showFinaleScreen && questStartTime && !questFinishTime) {
      const finish = Date.now();
      try {
        localStorage.setItem(TIMER_FINISH_KEY, finish.toString());
      } catch {
        // Ignore
      }
      setQuestFinishTime(finish);
    }
  }, [showFinaleScreen, questStartTime, questFinishTime]);

  // Checkpoints State
  const [checkpointsState, setCheckpointsState] = useState<Record<string, CheckpointRunState>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.checkpointsState && Object.keys(parsed.checkpointsState).length === CHECKPOINTS_DATA.length) {
          return parsed.checkpointsState;
        }
      }
    } catch {
      // Ignore
    }
    const initial: Record<string, CheckpointRunState> = {};
    CHECKPOINTS_DATA.forEach((cp) => {
      initial[cp.id] = {
        currentStep: 'QUIZ',
        selectedOption: null,
        quizError: null,
        warningCount: 0,
        warningMessage: null,
        penaltyApplied: false,
        capturedSelfie: null,
        clearedAt: null,
      };
    });
    return initial;
  });

  // Geolocation & Simulator State
  const [userLocation, setUserLocation] = useState<Coordinates>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.userLocation) return parsed.userLocation;
      }
    } catch {
      // Ignore
    }
    return { ...CAMPUS_ORIGIN };
  });

  const [isVirtualMode, setIsVirtualMode] = useState<boolean>(DEMO_TOOLS_ENABLED);
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(0);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState<boolean>(false);
  const [stepNudgeSize, setStepNudgeSize] = useState<number>(15);

  // Envelope Shake & Wax Break animation triggers
  const [isEnvelopeShaking, setIsEnvelopeShaking] = useState<boolean>(false);
  const [isSealBroken, setIsSealBroken] = useState<boolean>(false);

  // Camera & Photo State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewCapturedImage, setPreviewCapturedImage] = useState<string | null>(null);

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active Checkpoint
  const currentCheckpoint = CHECKPOINTS_DATA[activeCpIndex] || CHECKPOINTS_DATA[0];
  const currentState = checkpointsState[currentCheckpoint.id] || {
    currentStep: 'QUIZ',
    selectedOption: null,
    quizError: null,
    warningCount: 0,
    warningMessage: null,
    penaltyApplied: false,
    capturedSelfie: null,
    clearedAt: null,
  };

  // Internal distance calculation (Haversine + 15m GPS accuracy forgiveness)
  // KEPT STRICTLY INTERNAL - NEVER DISPLAYED TO PLAYER
  const rawDistance = useMemo(() => {
    return calculateHaversineDistanceMeters(
      userLocation.lat,
      userLocation.lng,
      currentCheckpoint.lat,
      currentCheckpoint.lng
    );
  }, [userLocation, currentCheckpoint]);

  const forgivenAccuracyMeters = Math.min(15, Math.round(gpsAccuracy || 0));
  const effectiveDistance = Math.max(0, rawDistance - forgivenAccuracyMeters);
  const currentRadius = currentCheckpoint.radius || 40;
  const isInsideRadius = effectiveDistance <= currentRadius;

  // Fixed per-checkpoint offset bearings for the 150m search area circle (shifted by 50m)
  const searchArea = useMemo(() => {
    // Only show while the current checkpoint is in the CLUE step (never in QUIZ, and not after cleared/locked)
    if (currentState.currentStep !== 'CLUE') {
      return undefined;
    }

    const bearingsDeg = [45, 135, 225, 315, 60, 200];
    const bearingDeg = bearingsDeg[activeCpIndex % bearingsDeg.length];
    const bearingRad = (bearingDeg * Math.PI) / 180;
    // 50m offset: 1 deg lat ~ 111111 meters
    const dLat = (50 * Math.cos(bearingRad)) / 111111;
    const dLng = (50 * Math.sin(bearingRad)) / (111111 * Math.cos((currentCheckpoint.lat * Math.PI) / 180));

    return {
      lat: Number((currentCheckpoint.lat + dLat).toFixed(6)),
      lng: Number((currentCheckpoint.lng + dLng).toFixed(6)),
      radius: 150,
    };
  }, [currentState.currentStep, currentCheckpoint, activeCpIndex]);

  // Proximity bands for clue step: over 300m Cold, 150-300m Cool, 60-150m Warm, under 60m Hot
  const proximityBand = useMemo<'Cold' | 'Cool' | 'Warm' | 'Hot'>(() => {
    if (rawDistance > 300) return 'Cold';
    if (rawDistance >= 150) return 'Cool';
    if (rawDistance >= 60) return 'Warm';
    return 'Hot';
  }, [rawDistance]);

  const [proximityTrend, setProximityTrend] = useState<'getting warmer' | 'getting colder' | null>(null);
  const prevDistRef = useRef<number | null>(null);
  const activeCpTrackIdRef = useRef<string>(currentCheckpoint.id);

  useEffect(() => {
    if (activeCpTrackIdRef.current !== currentCheckpoint.id) {
      activeCpTrackIdRef.current = currentCheckpoint.id;
      prevDistRef.current = rawDistance;
      setProximityTrend(null);
      return;
    }

    if (prevDistRef.current !== null) {
      const delta = rawDistance - prevDistRef.current;
      if (delta < -0.5) {
        setProximityTrend('getting warmer');
      } else if (delta > 0.5) {
        setProximityTrend('getting colder');
      }
    }
    prevDistRef.current = rawDistance;
  }, [userLocation, currentCheckpoint.id, rawDistance]);

  // Build Map Pins Array for PlayerMap component
  // Only pass pins with status 'cleared' or 'locked' to PlayerMap so answers are not revealed.
  // Active and pending pins are NOT drawn at their real positions.
  const mapPins = useMemo<MapPinItem[]>(() => {
    const list: MapPinItem[] = [];
    CHECKPOINTS_DATA.forEach((cp, idx) => {
      const st = checkpointsState[cp.id];
      if (st.currentStep === 'COMPLETED') {
        list.push({
          id: cp.id,
          number: idx + 1,
          lat: cp.lat,
          lng: cp.lng,
          status: 'cleared',
          label: cp.name,
          place: cp.place,
        });
      } else if (st.currentStep === 'PENALIZED_LOCKOUT') {
        list.push({
          id: cp.id,
          number: idx + 1,
          lat: cp.lat,
          lng: cp.lng,
          status: 'locked',
          label: cp.name,
          place: cp.place,
        });
      }
    });
    return list;
  }, [checkpointsState]);

  // Save State to LocalStorage
  useEffect(() => {
    try {
      const payload = {
        squadName,
        score,
        activeCpIndex,
        checkpointsState,
        userLocation,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Could not persist quest state:', e);
    }
  }, [squadName, score, activeCpIndex, checkpointsState, userLocation]);

  // Real GPS Watcher with haversine calculation, accuracy forgiveness & clear denied message
  useEffect(() => {
    if (showFront || isVirtualMode || !navigator.geolocation) return;

    let watchId: number | null = null;

    const startGps = () => {
      if (watchId !== null) return;
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setLocationPermissionDenied(false);
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setGpsAccuracy(pos.coords.accuracy || 0);
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            setLocationPermissionDenied(true);
          }
          console.warn('Real GPS unavailable, falling back to simulator:', err.message);
          if (DEMO_TOOLS_ENABLED) {
            setIsVirtualMode(true);
          }
        },
        { enableHighAccuracy: true, maximumAge: 2500, timeout: 8000 }
      );
    };

    const stopGps = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
    };

    startGps();

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        stopGps();
      } else {
        startGps();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stopGps();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [showFront, isVirtualMode]);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, [cameraStream]);

  // Start camera helper
  const startCamera = useCallback(
    async (facing: 'user' | 'environment' = cameraFacing) => {
      setCameraError(null);
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera hardware not accessible in this browser.');
        }
        if (cameraStream) {
          cameraStream.getTracks().forEach((t) => t.stop());
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        setCameraStream(stream);
        setIsCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err: any) {
        console.warn('Camera stream error:', err);
        setCameraError('Camera access unavailable. You can upload a photo or use the simulator button.');
        setIsCameraActive(false);
      }
    },
    [cameraFacing, cameraStream]
  );

  // Start camera when step changes to 'SELFIE'
  useEffect(() => {
    if (!showFront && currentState.currentStep === 'SELFIE' && !previewCapturedImage) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [showFront, currentState.currentStep, previewCapturedImage, activeCpIndex, startCamera, stopCamera]);

  // Stop camera when tab is hidden
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        stopCamera();
      } else if (!showFront && currentState.currentStep === 'SELFIE' && !previewCapturedImage) {
        startCamera();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [showFront, currentState.currentStep, previewCapturedImage, startCamera, stopCamera]);

  // Re-attach video stream if videoRef updates
  useEffect(() => {
    if (cameraStream && videoRef.current && isCameraActive) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraStream, isCameraActive]);

  // Toggle Mute Audio
  const handleToggleAudio = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Save squad name
  const handleSaveSquadName = () => {
    const safe = sanitizeSquadName(squadInputText);
    setSquadName(safe);
    setSquadInputText(safe);
    setIsEditingSquad(false);
  };

  // ----------------------------------------------------
  // STEP 1: QUIZ SUBMISSION (WAX-SEALED ENVELOPE)
  // ----------------------------------------------------
  const handleSelectQuizOption = (optionIndex: number) => {
    sounds.playTicketSelect();
    setCheckpointsState((prev) => ({
      ...prev,
      [currentCheckpoint.id]: {
        ...prev[currentCheckpoint.id],
        selectedOption: optionIndex,
        quizError: null,
      },
    }));
  };

  const handleQuizSubmit = () => {
    if (currentState.selectedOption === null) {
      triggerHaptic([150, 70, 150]);
      setIsEnvelopeShaking(true);
      setTimeout(() => setIsEnvelopeShaking(false), 500);
      sounds.playWrongBuzz();
      setCheckpointsState((prev) => ({
        ...prev,
        [currentCheckpoint.id]: {
          ...prev[currentCheckpoint.id],
          quizError: 'Please select a ticket stub answer before opening the dispatch.',
        },
      }));
      return;
    }

    if (currentState.selectedOption === currentCheckpoint.quiz.correctAnswer) {
      triggerHaptic([60, 40, 80]);
      setIsSealBroken(true);
      sounds.playWaxSealBreak();

      setTimeout(() => {
        setIsSealBroken(false);
        setCheckpointsState((prev) => ({
          ...prev,
          [currentCheckpoint.id]: {
            ...prev[currentCheckpoint.id],
            currentStep: 'CLUE',
            quizError: null,
            warningMessage: null,
          },
        }));
      }, 450);
    } else {
      triggerHaptic([250, 100, 250]);
      setIsEnvelopeShaking(true);
      setTimeout(() => setIsEnvelopeShaking(false), 500);
      sounds.playWrongBuzz();
      setCheckpointsState((prev) => ({
        ...prev,
        [currentCheckpoint.id]: {
          ...prev[currentCheckpoint.id],
          quizError: 'Cipher solution incorrect. Inspect the question and try another option.',
        },
      }));
    }
  };

  // ----------------------------------------------------
  // STEP 2 & 3: ARRIVAL CHECK (NO DISTANCE DISPLAYED)
  // ----------------------------------------------------
  const handleArrivalCheck = () => {
    if (currentState.currentStep !== 'CLUE') return;

    if (isInsideRadius) {
      // Arrived inside checkpoint radius!
      triggerHaptic([80]);
      sounds.playWaxSealBreak();
      setCheckpointsState((prev) => ({
        ...prev,
        [currentCheckpoint.id]: {
          ...prev[currentCheckpoint.id],
          currentStep: 'SELFIE',
          warningMessage: null,
        },
      }));
    } else {
      // Outside radius perimeter -> Warning issued
      const nextWarnings = currentState.warningCount + 1;

      if (nextWarnings >= WARNING_LIMIT) {
        // Strike 3: LOCKOUT & -50 POINTS PENALTY
        triggerHaptic([350, 120, 350, 120, 500]);
        sounds.playVoidStampSlam();
        setScore((s) => Math.max(0, s - PENALTY_POINTS));
        stopCamera();

        setCheckpointsState((prev) => ({
          ...prev,
          [currentCheckpoint.id]: {
            ...prev[currentCheckpoint.id],
            warningCount: 3,
            penaltyApplied: true,
            currentStep: 'PENALIZED_LOCKOUT',
            warningMessage: `Three perimeter warnings reached. A penalty of -${PENALTY_POINTS} points has been deducted and this checkpoint is now locked.`,
          },
        }));
      } else {
        // Strike 1 or 2: exact text specified without any numbers
        triggerHaptic([220, 90, 220]);
        sounds.playPerimeterStrike();

        setCheckpointsState((prev) => ({
          ...prev,
          [currentCheckpoint.id]: {
            ...prev[currentCheckpoint.id],
            warningCount: nextWarnings,
            warningMessage: `Warning ${nextWarnings}/${WARNING_LIMIT}: You are not at the checkpoint yet. Check the map, move closer and try again.`,
          },
        }));
      }
    }
  };

  // Test helper override
  const handleResetStageSecurity = () => {
    sounds.playWaxSealBreak();
    setCheckpointsState((prev) => ({
      ...prev,
      [currentCheckpoint.id]: {
        ...prev[currentCheckpoint.id],
        warningCount: 0,
        warningMessage: null,
        penaltyApplied: false,
        currentStep: 'CLUE',
      },
    }));
  };

  // ----------------------------------------------------
  // STEP 4: SELFIE CAPTURE & DEVELOPING POLAROID
  // ----------------------------------------------------
  // Draw passport watermark onto HTML canvas: ARRIVAL VERIFIED instead of distance
  const drawPolaroidWatermark = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    timestamp: string,
    modeLabel: string
  ) => {
    ctx.strokeStyle = '#FFB627';
    ctx.lineWidth = 3;
    const bLen = 24;

    // Top left
    ctx.beginPath();
    ctx.moveTo(12, 12 + bLen);
    ctx.lineTo(12, 12);
    ctx.lineTo(12 + bLen, 12);
    ctx.stroke();

    // Top right
    ctx.beginPath();
    ctx.moveTo(w - 12 - bLen, 12);
    ctx.lineTo(w - 12, 12);
    ctx.lineTo(w - 12, 12 + bLen);
    ctx.stroke();

    // Bottom info strip
    const stripH = 76;
    ctx.fillStyle = 'rgba(16, 26, 74, 0.9)';
    ctx.fillRect(8, h - stripH - 8, w - 16, stripH);
    ctx.strokeStyle = '#FFB627';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(8, h - stripH - 8, w - 16, stripH);

    // Header Tag
    ctx.fillStyle = '#FFB627';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('DAVV CAMPUS QUEST · VERIFIED ARRIVAL', 20, h - stripH + 16);

    // Stamped Squad & Target
    ctx.fillStyle = '#EEF0F7';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(
      `SQUAD: ${sanitizeSquadName(squadName)} · ${currentCheckpoint.name}`,
      20,
      h - stripH + 34
    );

    // Coordinates & ARRIVAL VERIFIED (Strictly no distance numbers)
    ctx.fillStyle = '#94A3B8';
    ctx.font = '11px monospace';
    ctx.fillText(
      `GPS: ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)} · ARRIVAL VERIFIED`,
      20,
      h - stripH + 50
    );
    ctx.fillText(`${timestamp} · [${modeLabel}]`, 20, h - stripH + 65);

    // Green Stamp Seal
    ctx.fillStyle = '#0F8A68';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('STAMPED ✓', w - 110, h - stripH + 20);
  };

  // Re-check distance at capture time with strict message (no numbers)
  const handleCaptureLiveSelfie = () => {
    if (!isInsideRadius) {
      triggerHaptic([250, 100, 250]);
      sounds.playPerimeterStrike();
      alert('Arrival check failed. You are no longer at the checkpoint. Check the map, go back and try again.');
      return;
    }

    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    sounds.playCameraShutter();
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;

    ctx.drawImage(video, 0, 0, w, h);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    drawPolaroidWatermark(ctx, w, h, timeStr, 'OPTICAL CAM');

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setPreviewCapturedImage(dataUrl);
    stopCamera();
  };

  // File Input Fallback (capture="user")
  const handleFileInputUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isInsideRadius) {
      triggerHaptic([250, 100, 250]);
      sounds.playPerimeterStrike();
      alert('Arrival check failed. You are no longer at the checkpoint. Check the map, go back and try again.');
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        sounds.playCameraShutter();
        const w = 640;
        const h = 480;
        canvas.width = w;
        canvas.height = h;

        ctx.drawImage(img, 0, 0, w, h);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        drawPolaroidWatermark(ctx, w, h, timeStr, 'DEVICE UPLOAD');

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setPreviewCapturedImage(dataUrl);
        stopCamera();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Simulated Snapshot
  const handleCaptureSimulatedSelfie = () => {
    if (!isInsideRadius) {
      triggerHaptic([250, 100, 250]);
      sounds.playPerimeterStrike();
      alert('Arrival check failed. You are no longer at the checkpoint. Check the map, go back and try again.');
      return;
    }

    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    sounds.playCameraShutter();
    const w = 640;
    const h = 480;
    canvas.width = w;
    canvas.height = h;

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#101A4A');
    grad.addColorStop(1, '#0A0F2D');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255, 182, 39, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(w / 2, 190, 80, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#FFB627';
    ctx.font = 'bold 18px serif';
    ctx.textAlign = 'center';
    ctx.fillText('IET DAVV INDORE CAMPUS', w / 2, 195);
    ctx.textAlign = 'start';

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    drawPolaroidWatermark(ctx, w, h, timeStr, 'FIELD DISPATCH');

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setPreviewCapturedImage(dataUrl);
    stopCamera();
  };

  // Confirm final selfie & slam rubber stamp
  const handleConfirmFinalSelfie = () => {
    if (!isInsideRadius) {
      triggerHaptic([250, 100, 250]);
      sounds.playPerimeterStrike();
      alert('Arrival check failed. You are no longer at the checkpoint. Check the map, go back and try again.');
      return;
    }

    if (!previewCapturedImage) return;

    // Award +150 Points & Sound
    setScore((s) => s + STAGE_CLEAR_POINTS);
    triggerHaptic([70, 50, 120]);
    sounds.playRubberStampSlam();

    // Celebratory Confetti
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0F8A68', '#FFB627', '#2B3FE0', '#EEF0F7'],
    });

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setCheckpointsState((prev) => ({
      ...prev,
      [currentCheckpoint.id]: {
        ...prev[currentCheckpoint.id],
        currentStep: 'COMPLETED',
        capturedSelfie: previewCapturedImage,
        clearedAt: nowStr,
      },
    }));

    setPreviewCapturedImage(null);
  };

  // D-Pad Walk Nudge
  const handleNudgeLocation = (direction: 'N' | 'S' | 'W' | 'E') => {
    const deltaLat = (stepNudgeSize / 111111) * (direction === 'N' ? 1 : direction === 'S' ? -1 : 0);
    const deltaLng =
      (stepNudgeSize / (111111 * Math.cos((userLocation.lat * Math.PI) / 180))) *
      (direction === 'E' ? 1 : direction === 'W' ? -1 : 0);

    setUserLocation((prev) => ({
      lat: Number((prev.lat + deltaLat).toFixed(6)),
      lng: Number((prev.lng + deltaLng).toFixed(6)),
    }));
  };

  // Instant Teleport inside current checkpoint's zone
  const handleTeleportInside = () => {
    setUserLocation({
      lat: Number((currentCheckpoint.lat + 0.0001).toFixed(6)),
      lng: Number((currentCheckpoint.lng + 0.0001).toFixed(6)),
    });
    sounds.playWaxSealBreak();
  };

  // Teleport outside to test warnings
  const handleTeleportOutside = () => {
    setUserLocation({
      lat: Number((currentCheckpoint.lat + 0.0007).toFixed(6)),
      lng: Number((currentCheckpoint.lng + 0.0006).toFixed(6)),
    });
    sounds.playPerimeterStrike();
  };

  // Reset entire quest session
  const performFullReset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TIMER_START_KEY);
      localStorage.removeItem(TIMER_FINISH_KEY);
    } catch {
      // Ignore
    }
    setQuestStartTime(null);
    setQuestFinishTime(null);
    sounds.playWaxSealBreak();
    setScore(100);
    setActiveCpIndex(0);
    setUserLocation({ ...CAMPUS_ORIGIN });
    setShowFinaleScreen(false);
    setIsPinboardOpen(false);
    setIsLeaderboardOpen(false);
    setIsEnvelopeShaking(false);
    setIsSealBroken(false);

    const fresh: Record<string, CheckpointRunState> = {};
    CHECKPOINTS_DATA.forEach((cp) => {
      fresh[cp.id] = {
        currentStep: 'QUIZ',
        selectedOption: null,
        quizError: null,
        warningCount: 0,
        warningMessage: null,
        penaltyApplied: false,
        capturedSelfie: null,
        clearedAt: null,
      };
    });
    setCheckpointsState(fresh);
    setPreviewCapturedImage(null);
    stopCamera();
    setIsConfirmingRestart(false);
    if (restartConfirmTimerRef.current) {
      clearTimeout(restartConfirmTimerRef.current);
      restartConfirmTimerRef.current = null;
    }
  }, []);

  const handleRestartEntireQuest = () => {
    if (isConfirmingRestart) {
      performFullReset();
    } else {
      setIsConfirmingRestart(true);
      triggerHaptic(50);
      sounds.playTicketSelect();
      if (restartConfirmTimerRef.current) {
        clearTimeout(restartConfirmTimerRef.current);
      }
      restartConfirmTimerRef.current = setTimeout(() => {
        setIsConfirmingRestart(false);
        restartConfirmTimerRef.current = null;
      }, 4000);
    }
  };

  // Test tool: skip to specific checkpoint, set to CLUE, and teleport 15m away
  const handleSkipToCheckpoint = (targetIndex: number) => {
    stopCamera();
    setPreviewCapturedImage(null);
    setActiveCpIndex(targetIndex);

    const targetCp = CHECKPOINTS_DATA[targetIndex];
    if (!targetCp) return;

    // Teleport simulator to 15m North of target checkpoint
    // 15 meters in latitude offset: 15 / 111111 degrees ~ 0.000135
    setUserLocation({
      lat: Number((targetCp.lat + 15 / 111111).toFixed(6)),
      lng: Number(targetCp.lng.toFixed(6)),
    });

    setCheckpointsState((prev) => ({
      ...prev,
      [targetCp.id]: {
        ...(prev[targetCp.id] || {
          warningCount: 0,
          warningMessage: null,
          penaltyApplied: false,
          capturedSelfie: null,
          clearedAt: null,
        }),
        currentStep: 'CLUE',
        selectedOption: targetCp.quiz.correctAnswer,
        quizError: null,
        warningMessage: null,
      },
    }));

    sounds.playWaxSealBreak();
    triggerHaptic(60);
  };

  // Toggle map theme between Dark and Light mode
  const handleToggleMapTheme = () => {
    setMapTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(MAP_THEME_STORAGE_KEY, next);
      } catch {
        // Ignore
      }
      sounds.playTicketSelect();
      return next;
    });
  };

  // Completed Count
  const completedCount = useMemo(() => {
    return Object.values(checkpointsState).filter((s) => s.currentStep === 'COMPLETED').length;
  }, [checkpointsState]);

  // Check if saved progress exists
  const hasSavedProgress = useMemo(() => {
    return (
      completedCount > 0 ||
      activeCpIndex > 0 ||
      checkpointsState[CHECKPOINTS_DATA[0]?.id]?.currentStep !== 'QUIZ' ||
      score !== 100
    );
  }, [completedCount, activeCpIndex, checkpointsState, score]);

  // Go back to front page without losing progress
  const handleGoToFront = () => {
    stopCamera();
    setShowFront(true);
  };

  // Helper when leaving front page (starts run timer if not already running)
  const handleLeaveFrontPage = useCallback(() => {
    sounds.playTicketSelect();
    setShowFront(false);
    if (!questStartTime) {
      const now = Date.now();
      try {
        localStorage.setItem(TIMER_START_KEY, now.toString());
      } catch {
        // Ignore
      }
      setQuestStartTime(now);
    }
  }, [questStartTime, sounds]);

  // Quick reset link ?reset=1 check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('reset') === '1') {
        performFullReset();
        params.delete('reset');
        const newSearch = params.toString();
        const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [performFullReset]);

  return (
    <>
      {showFront ? (
        /* ==================================================== */
        /* FRONT PAGE / WELCOME SCREEN                          */
        /* ==================================================== */
        <div className="min-h-screen bg-[#2B3FE0] flex items-center justify-center p-4 sm:p-6 desk-surface text-white">
          <div className="w-full max-w-md bg-[#0E1A6B] rounded-3xl border-2 border-[#FFB627]/30 shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden flex flex-col gap-6">
            {/* Gold Corner Accents */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#FFB627]/50 pointer-events-none" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#FFB627]/50 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#FFB627]/50 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#FFB627]/50 pointer-events-none" />

            {/* Emblem & Title */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-2xl bg-[#FFB627]/15 border-2 border-[#FFB627] flex items-center justify-center text-[#FFB627] shadow-inner">
                <span className="font-heading font-black text-2xl tracking-wider">DQ</span>
              </div>
              <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-[#FFB627] uppercase mt-1">
                DAVV Campus Quest
              </h1>
              <p className="text-white/85 text-xs sm:text-sm font-medium tracking-wide">
                Solve it. Find it. Prove it with a selfie.
              </p>
            </div>

            {/* Squad Name Input */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="front-squad-name" className="block text-xs font-semibold uppercase tracking-wider text-[#FFB627]">
                Squad Name
              </label>
              <div className="relative">
                <input
                  id="front-squad-name"
                  type="text"
                  maxLength={24}
                  value={squadName}
                  onChange={(e) => {
                    const sanitized = sanitizeSquadName(e.target.value.slice(0, 24));
                    setSquadName(sanitized);
                    setSquadInputText(sanitized);
                  }}
                  placeholder="Enter squad name..."
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-[#FFB627]/40 text-white placeholder-white/40 font-heading font-bold text-base focus:outline-none focus:border-[#FFB627] focus:ring-2 focus:ring-[#FFB627]/30 transition"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-white/50">
                  {squadName.length}/24
                </div>
              </div>
            </div>

            {/* How to Play Strip: Three small items with icons and one line each */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-left space-y-2">
              <div className="flex items-center gap-2.5 text-xs text-white/90">
                <div className="w-6 h-6 rounded-lg bg-[#FFB627]/20 border border-[#FFB627]/40 flex items-center justify-center shrink-0 text-[#FFB627]">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">Solve the quiz</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-white/90">
                <div className="w-6 h-6 rounded-lg bg-[#FFB627]/20 border border-[#FFB627]/40 flex items-center justify-center shrink-0 text-[#FFB627]">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">Find the place</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-white/90">
                <div className="w-6 h-6 rounded-lg bg-[#FFB627]/20 border border-[#FFB627]/40 flex items-center justify-center shrink-0 text-[#FFB627]">
                  <Camera className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">Take a selfie inside the ring</span>
              </div>
            </div>

            {/* Saved Progress Stats (Shown when progress exists) */}
            {hasSavedProgress && (
              <div className="flex items-center justify-center gap-4 py-2.5 px-4 rounded-xl bg-white/10 border border-[#FFB627]/30 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 text-white/90">
                  <Trophy className="w-4 h-4 text-[#FFB627]" />
                  <span>Score:</span>
                  <strong className="text-[#FFB627] font-bold">{score} pts</strong>
                </div>
                <div className="h-4 w-px bg-white/20" />
                <div className="flex items-center gap-1.5 text-white/90">
                  <CheckCircle2 className="w-4 h-4 text-[#0F8A68]" />
                  <span>Cleared:</span>
                  <strong className="text-[#0F8A68] font-bold">
                    {completedCount} of {CHECKPOINTS_DATA.length}
                  </strong>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Primary Button */}
              <button
                onClick={handleLeaveFrontPage}
                disabled={!squadName.trim()}
                className="w-full py-3.5 px-6 rounded-xl bg-[#0F8A68] hover:bg-[#0c7054] disabled:opacity-50 disabled:cursor-not-allowed text-white font-heading font-black text-sm sm:text-base uppercase tracking-wider shadow-lg shadow-black/20 transition transform active:scale-98 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
              >
                <span>{hasSavedProgress ? `Continue from Checkpoint ${activeCpIndex + 1}` : 'Start the quest'}</span>
                <ArrowRight className="w-4 h-4 text-[#FFB627]" />
              </button>

              {/* Secondary Buttons: How to Play & Leaderboard */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    sounds.playTicketSelect();
                    setIsRevisitingIntro(true);
                    setShowIntroScreen(true);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
                >
                  <HelpCircle className="w-4 h-4 text-[#FFB627]" />
                  <span>How to play</span>
                </button>
                <button
                  onClick={() => {
                    sounds.playTicketSelect();
                    setIsLeaderboardOpen(true);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
                >
                  <Trophy className="w-4 h-4 text-[#FFB627]" />
                  <span>Leaderboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen desk-surface text-[#101A4A] flex flex-col font-sans selection:bg-[#FFB627]/40">
      {/* ==================================================== */}
      {/* TOP BAR: SQUAD PASSPORT HEADER                        */}
      {/* ==================================================== */}
      <header className="sticky top-0 z-40 bg-[#101A4A]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 sm:px-6 shadow-xl text-white">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Escaped Squad Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFB627] text-[#101A4A] flex items-center justify-center font-heading font-black text-lg shadow-md">
              DQ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-bold text-base sm:text-lg tracking-tight">
                  DAVV Campus Quest
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-medium">
                  Squad passport
                </span>
              </div>

              {/* Escaped squad name with inline editing */}
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <span>Squad:</span>
                {isEditingSquad ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={squadInputText}
                      onChange={(e) => setSquadInputText(e.target.value.slice(0, 24))}
                      className="bg-white/10 border border-[#FFB627] text-[#FFB627] rounded px-1.5 py-0.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#FFB627] w-28 sm:w-36"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveSquadName}
                      className="p-1 rounded bg-[#FFB627] text-[#101A4A] hover:bg-[#ffa700] focus:outline-none focus:ring-2 focus:ring-white"
                      title="Save squad name"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <strong className="text-[#FFB627] font-semibold">{squadName}</strong>
                    <button
                      onClick={() => setIsEditingSquad(true)}
                      className="p-0.5 text-white/50 hover:text-white focus:outline-none focus:ring-1 focus:ring-white rounded"
                      title="Rename squad"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stamp Slots per Checkpoint & Score */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* 6 Visa Stamp Slots */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[11px] text-white/60 mr-1 font-medium">Stamps:</span>
              {CHECKPOINTS_DATA.map((cp, idx) => {
                const st = checkpointsState[cp.id];
                const isCleared = st.currentStep === 'COMPLETED';
                const isLocked = st.currentStep === 'PENALIZED_LOCKOUT';

                return (
                  <div
                    key={cp.id}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                      isCleared
                        ? 'bg-[#0F8A68] border-[#0F8A68] text-white shadow-sm'
                        : isLocked
                        ? 'bg-[#D8281F] border-[#D8281F] text-white'
                        : idx === activeCpIndex
                        ? 'border-[#FFB627] border-dashed text-[#FFB627]'
                        : 'border-white/20 text-white/30 border-dashed'
                    }`}
                    title={`${cp.name}: ${isCleared ? 'Cleared' : isLocked ? 'Locked' : 'Pending'}`}
                  >
                    {isCleared ? '✓' : isLocked ? '✕' : idx + 1}
                  </div>
                );
              })}
            </div>

            {/* Score */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15">
              <Trophy className="w-4 h-4 text-[#FFB627]" />
              <div className="flex flex-col">
                <span className="text-[10px] text-white/60 font-medium leading-none">Score</span>
                <span className="font-heading font-extrabold text-sm sm:text-base text-[#FFB627] leading-tight">
                  {score} pts
                </span>
              </div>
            </div>

            {/* Run Timer (small m:ss) */}
            {questStartTime !== null && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white/90"
                title="Quest run time"
                aria-label={`Quest run time: ${formatTimer(elapsedSeconds)}`}
              >
                <Clock className="w-3.5 h-3.5 text-[#FFB627]" />
                <span className="font-mono font-bold text-white text-xs tracking-wider">
                  {formatTimer(elapsedSeconds)}
                </span>
              </div>
            )}

            {/* Pinboard / Album */}
            <button
              onClick={() => setIsPinboardOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white flex items-center gap-1.5 transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
              title="Open Polaroid Pinboard"
            >
              <Pin className="w-3.5 h-3.5 text-[#FFB627]" />
              <span>Pinboard</span>
              <span className="px-1.5 py-0.2 rounded bg-white/20 text-[#FFB627] text-[10px] font-bold">
                {completedCount}/{CHECKPOINTS_DATA.length}
              </span>
            </button>

            {/* Restart Quest (Next to Pinboard) */}
            <button
              onClick={handleRestartEntireQuest}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition active:scale-95 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#FFB627] ${
                isConfirmingRestart
                  ? 'bg-[#D8281F] text-white border-white animate-pulse shadow-md font-bold'
                  : 'bg-white/10 hover:bg-white/20 border-white/15 text-white/90 hover:text-white'
              }`}
              title={isConfirmingRestart ? 'Tap again to erase progress' : 'Restart quest from Checkpoint 1'}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isConfirmingRestart ? 'animate-spin' : ''}`} />
              <span>{isConfirmingRestart ? 'Tap again to erase progress' : 'Restart quest'}</span>
            </button>

            {/* Back to Front Page Home Button */}
            <button
              onClick={handleGoToFront}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white flex items-center gap-1.5 transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
              title="Back to front page"
            >
              <Home className="w-3.5 h-3.5 text-[#FFB627]" />
              <span className="hidden sm:inline">Home</span>
            </button>

            {/* Squad Leaderboard */}
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white flex items-center gap-1.5 transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
              title="Open Squad Leaderboard"
            >
              <Trophy className="w-3.5 h-3.5 text-[#FFB627]" />
              <span className="hidden sm:inline">Leaderboard</span>
            </button>

            {/* How to Play / Intro Reopen */}
            <button
              onClick={() => {
                sounds.playTicketSelect();
                setIsRevisitingIntro(true);
                setShowIntroScreen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white flex items-center gap-1.5 transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
              title="How to play"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#FFB627]" />
              <span className="hidden sm:inline">How to play</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleAudio}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
              title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-[#D8281F]" /> : <Volume2 className="w-4 h-4 text-[#0F8A68]" />}
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================== */}
      {/* GEOLOCATION PERMISSION DENIED BANNER WITH HELP       */}
      {/* ==================================================== */}
      {locationPermissionDenied && (
        <div className="bg-[#D8281F] text-white px-4 py-3 shadow-md border-b border-red-900 flex items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-start sm:items-center gap-2.5 max-w-4xl">
            <AlertTriangle className="w-5 h-5 shrink-0 text-[#FFB627]" />
            <div>
              <strong className="font-semibold">Location permission was denied:</strong>{' '}
              DAVV Campus Quest requires GPS access to detect when you reach checkpoint coordinates.
              <span className="block sm:inline text-white/90 ml-0 sm:ml-1 mt-0.5 sm:mt-0">
                To fix: click the padlock/tune icon in your browser address bar, set <em>Location</em> to <strong>Allow</strong>, and refresh the page. You can also use the <strong>Simulator</strong> below while indoors.
              </span>
            </div>
          </div>
          <button
            onClick={() => setLocationPermissionDenied(false)}
            className="p-1 text-white/80 hover:text-white shrink-0 focus:outline-none focus:ring-2 focus:ring-white rounded"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ==================================================== */}
      {/* MAIN DESK & SQUAD PASSPORT NOTEBOOK                   */}
      {/* ==================================================== */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / CENTER: THE SQUAD PASSPORT BOOKLET (COLS 1-7) */}
        <section className="lg:col-span-7">
          <div className="relative passport-paper rounded-2xl shadow-2xl border border-white/40 overflow-hidden text-[#101A4A]">
            {/* Left Punched Binder Holes Strip */}
            <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-10 flex flex-col justify-around items-center py-8 border-r border-[#101A4A]/10 pointer-events-none z-10 bg-[#EEF0F7]">
              {[1, 2, 3, 4].map((hole) => (
                <div
                  key={hole}
                  className="w-4 h-4 rounded-full bg-[#2B3FE0] shadow-inner border border-black/25 flex items-center justify-center"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-black/20" />
                </div>
              ))}
            </div>

            {/* Passport Page Content */}
            <div className="pl-10 sm:pl-14 pr-5 sm:pr-8 py-6 space-y-6">
              {/* Top Passport Page Header: Tabs & Checkpoint Indicator */}
              <div className="border-b border-[#101A4A]/15 pb-4">
                {/* Checkpoint Page Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                  {CHECKPOINTS_DATA.map((cp, idx) => {
                    const st = checkpointsState[cp.id];
                    const isSelected = idx === activeCpIndex;
                    const isCleared = st.currentStep === 'COMPLETED';
                    const isLocked = st.currentStep === 'PENALIZED_LOCKOUT';

                    return (
                      <button
                        key={cp.id}
                        onClick={() => {
                          stopCamera();
                          setActiveCpIndex(idx);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 border whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#FFB627] ${
                          isSelected
                            ? 'bg-[#101A4A] text-white border-[#101A4A] shadow-sm'
                            : isCleared
                            ? 'bg-[#0F8A68]/15 border-[#0F8A68]/40 text-[#0F8A68]'
                            : isLocked
                            ? 'bg-[#D8281F]/15 border-[#D8281F]/40 text-[#D8281F]'
                            : 'bg-white/60 border-[#101A4A]/20 text-[#101A4A]/70 hover:bg-white'
                        }`}
                      >
                        <span>Target {idx + 1}</span>
                        {isCleared && <span className="text-[10px] text-[#0F8A68]">✓</span>}
                        {isLocked && <span className="text-[10px] text-[#D8281F]">✕</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Page Title & Strikes System - Strictly NO perimeter or radius size in text */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
                  <div>
                    <span className="text-xs font-medium text-[#101A4A]/60 block">
                      Checkpoint {activeCpIndex + 1} of {CHECKPOINTS_DATA.length}
                    </span>
                    <h2 className="font-heading font-black text-xl sm:text-2xl text-[#101A4A] tracking-tight">
                      {/* STRICTLY NO REAL PLACE NAME UNTIL COMPLETED! */}
                      {currentState.currentStep === 'COMPLETED'
                        ? currentCheckpoint.place
                        : currentCheckpoint.name}
                    </h2>
                  </div>

                  {/* STRIKES: THREE CIRCULAR MARKS THAT FILL RED */}
                  <div className="flex items-center gap-2 bg-white/70 border border-[#101A4A]/15 px-3 py-1.5 rounded-xl">
                    <span className="text-xs font-medium text-[#101A4A]/70">Strikes:</span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3].map((strike) => {
                        const isFilled = currentState.warningCount >= strike;
                        return (
                          <div
                            key={strike}
                            className={`w-4 h-4 rounded-full border transition-all flex items-center justify-center text-[10px] font-bold ${
                              isFilled
                                ? 'bg-[#D8281F] border-[#D8281F] text-white shadow-sm scale-110'
                                : 'border-[#101A4A]/30 bg-transparent text-transparent'
                            }`}
                            title={`Strike ${strike} of 3`}
                          >
                            {isFilled ? '✕' : ''}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* ======================================================= */}
              {/* STAGE 1: GATEKEEPER QUIZ (WAX-SEALED ENVELOPE)          */}
              {/* ======================================================= */}
              {currentState.currentStep === 'QUIZ' && (
                <div className="space-y-6">
                  {/* WAX-SEALED ENVELOPE CONTAINER */}
                  <div
                    className={`relative bg-[#F4F1EA] border-2 border-[#DCD6C8] rounded-2xl p-5 sm:p-6 shadow-md overflow-hidden transition-transform ${
                      isEnvelopeShaking ? 'animate-envelope-shake' : ''
                    }`}
                  >
                    {/* Envelope Flap Geometry & Wax Seal */}
                    <div className="relative mb-5 flex items-center justify-between border-b border-[#DCD6C8] pb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#FFB627]" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#101A4A]/60">
                          Sealed gatekeeper dispatch ({currentCheckpoint.quiz.points} pts)
                        </span>
                      </div>

                      {/* Wax Seal Emblem */}
                      <div
                        className={`w-10 h-10 rounded-full bg-[#B91C1C] text-white font-heading font-black flex items-center justify-center text-xs shadow-md border-2 border-[#7F1D1D] ${
                          isSealBroken ? 'animate-seal-pop' : ''
                        }`}
                        title="Wax seal - solve quiz to unseal"
                      >
                        IET
                      </div>
                    </div>

                    {/* Quiz Riddle Text */}
                    <p className="text-base sm:text-lg font-medium text-[#101A4A] leading-relaxed mb-5">
                      {currentCheckpoint.quiz.question}
                    </p>

                    {/* Perforated Ticket Stub Options */}
                    <div className="space-y-3">
                      {currentCheckpoint.quiz.options.map((option, idx) => {
                        const isSelected = currentState.selectedOption === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectQuizOption(idx)}
                            className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center justify-between ticket-stub focus:outline-none focus:ring-2 focus:ring-[#FFB627] ${
                              isSelected
                                ? 'bg-[#FFB627]/20 border-[#FFB627] text-[#101A4A] shadow-sm font-semibold'
                                : 'bg-white border-[#DCD6C8] text-[#101A4A]/80 hover:border-[#101A4A]/40'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-6 h-6 rounded-md text-xs font-heading font-bold flex items-center justify-center border ${
                                  isSelected
                                    ? 'bg-[#101A4A] text-white border-[#101A4A]'
                                    : 'bg-[#EEF0F7] text-[#101A4A]/60 border-[#DCD6C8]'
                                }`}
                              >
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="text-sm">{option}</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-[#101A4A]" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Quiz Error Message */}
                    {currentState.quizError && (
                      <div className="mt-4 p-3 rounded-xl bg-[#D8281F]/10 border border-[#D8281F]/30 text-[#D8281F] text-xs font-medium flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{currentState.quizError}</span>
                      </div>
                    )}
                  </div>

                  {/* Submit Quiz Action Button */}
                  <button
                    onClick={handleQuizSubmit}
                    className="w-full py-3.5 rounded-xl bg-[#101A4A] hover:bg-[#1C2C75] text-white font-heading font-bold text-sm tracking-wide shadow-lg shadow-[#101A4A]/20 transition active:scale-98 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
                  >
                    <Unlock className="w-4 h-4 text-[#FFB627]" />
                    <span>Break seal and reveal location clue</span>
                  </button>
                </div>
              )}

              {/* ======================================================= */}
              {/* STAGE 2: HUNT SCREEN (CRYPTIC CLUE & ARRIVAL BUTTON)    */}
              {/* DISTANCE IS COMPLETELY HIDDEN FROM PLAYER               */}
              {/* ======================================================= */}
              {currentState.currentStep === 'CLUE' && (
                <div className="space-y-6">
                  {/* Cryptic Clue Slip (Strictly NO real place names!) */}
                  <div className="bg-[#FAF9F5] border-2 border-[#E2DDCF] rounded-2xl p-5 shadow-sm space-y-2 relative">
                    <div className="flex items-center justify-between text-xs text-[#101A4A]/60">
                      <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#FFB627]" />
                        <span>Cryptic location clue</span>
                      </span>
                      <span className="text-[11px] font-mono bg-[#101A4A]/5 px-2 py-0.5 rounded">
                        Target #{activeCpIndex + 1}
                      </span>
                    </div>

                    <p className="text-base sm:text-lg italic font-serif text-[#101A4A] leading-relaxed pt-1">
                      "{currentCheckpoint.hint}"
                    </p>
                  </div>

                  {/* Warning Strike Notification Alert (Strictly without distance numbers) */}
                  {currentState.warningMessage && (
                    <div className="p-3.5 rounded-xl bg-[#D8281F]/10 border border-[#D8281F]/30 text-[#D8281F] text-xs font-medium space-y-1">
                      <div className="flex items-center gap-2 font-bold">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Perimeter Warning</span>
                      </div>
                      <p>{currentState.warningMessage}</p>
                      <p className="text-[11px] text-[#D8281F]/80">
                        Reminder: On the 3rd warning, 50 points are deducted and this checkpoint is locked.
                      </p>
                    </div>
                  )}

                  {/* "I HAVE ARRIVED AT LOCATION" BUTTON */}
                  {/* Must look uniform whether player is close or not (no green colour or pulse) */}
                  <button
                    onClick={handleArrivalCheck}
                    className="w-full py-4 rounded-xl font-heading font-bold text-sm sm:text-base tracking-wide transition-all shadow-xl flex items-center justify-center gap-2 active:scale-98 bg-[#101A4A] hover:bg-[#1C2C75] text-white shadow-[#101A4A]/20 focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
                  >
                    <MapPin className="w-5 h-5 text-[#FFB627]" />
                    <span>I have arrived at location</span>
                  </button>
                </div>
              )}

              {/* ======================================================= */}
              {/* STAGE 3: SELFIE & DEVELOPING POLAROID                   */}
              {/* ======================================================= */}
              {currentState.currentStep === 'SELFIE' && (
                <div className="space-y-6">
                  {/* Verified header banner (strictly without radius size) */}
                  <div className="p-3.5 rounded-xl bg-[#0F8A68]/15 border border-[#0F8A68]/40 text-[#0F8A68] text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Location verified. Take a live verification selfie to clear this checkpoint.
                    </span>
                  </div>

                  {!previewCapturedImage ? (
                    // Live Viewfinder Screen
                    <div className="space-y-4">
                      {/* Viewfinder with Corner Brackets & Info Strip */}
                      <div className="relative bg-black rounded-2xl overflow-hidden border-2 border-[#101A4A] aspect-video flex items-center justify-center shadow-xl">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />

                        {/* Viewfinder Corner Brackets Overlay */}
                        <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div className="w-6 h-6 border-t-2 border-l-2 border-[#FFB627]" />
                            <div className="text-[10px] bg-black/60 text-[#FFB627] px-2 py-0.5 rounded font-mono">
                              SQUAD: {sanitizeSquadName(squadName)}
                            </div>
                            <div className="w-6 h-6 border-t-2 border-r-2 border-[#FFB627]" />
                          </div>

                          <div className="flex justify-between items-end">
                            <div className="w-6 h-6 border-b-2 border-l-2 border-[#FFB627]" />
                            {/* Viewfinder label shows ARRIVAL VERIFIED instead of a distance */}
                            <div className="text-[10px] bg-black/60 text-[#0F8A68] px-2 py-0.5 rounded font-mono font-bold">
                              ARRIVAL VERIFIED
                            </div>
                            <div className="w-6 h-6 border-b-2 border-r-2 border-[#FFB627]" />
                          </div>
                        </div>

                        {cameraError && (
                          <div className="absolute inset-0 bg-[#101A4A]/90 p-4 flex flex-col items-center justify-center text-center space-y-2 text-white">
                            <Camera className="w-8 h-8 text-[#FFB627]" />
                            <p className="text-xs text-white/80 max-w-xs">{cameraError}</p>
                          </div>
                        )}
                      </div>

                      {/* Selfie Capture Controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          onClick={handleCaptureLiveSelfie}
                          className="py-3 px-4 rounded-xl bg-[#0F8A68] hover:bg-[#0c7054] text-white font-heading font-bold text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-98 focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Take selfie</span>
                        </button>

                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="py-3 px-4 rounded-xl bg-white hover:bg-slate-50 border border-[#101A4A]/20 text-[#101A4A] font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
                        >
                          <Upload className="w-4 h-4 text-[#2B3FE0]" />
                          <span>Upload photo fallback</span>
                        </button>
                      </div>

                      <div className="flex justify-between items-center text-xs text-[#101A4A]/60 pt-1">
                        <button
                          onClick={() => {
                            const next = cameraFacing === 'user' ? 'environment' : 'user';
                            setCameraFacing(next);
                            startCamera(next);
                          }}
                          className="flex items-center gap-1 hover:text-[#101A4A] focus:outline-none focus:underline"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Flip camera</span>
                        </button>

                        <button
                          onClick={handleCaptureSimulatedSelfie}
                          className="hover:underline text-[#2B3FE0] focus:outline-none"
                        >
                          Simulate snapshot
                        </button>
                      </div>

                      {/* Hidden File Input with capture="user" */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="user"
                        className="hidden"
                        onChange={handleFileInputUpload}
                      />
                    </div>
                  ) : (
                    // Developing Polaroid Preview
                    <div className="space-y-5">
                      <div className="text-xs font-semibold text-[#101A4A]/70">
                        Developing polaroid:
                      </div>

                      {/* Authentic Polaroid Card */}
                      <div className="bg-[#FAF9F5] p-3.5 pb-8 rounded-sm shadow-xl border border-slate-300 max-w-sm mx-auto rotate-[-1deg] transition-transform">
                        <div className="aspect-video bg-black rounded-xs overflow-hidden mb-3 border border-slate-200">
                          <img
                            src={previewCapturedImage}
                            alt="Developing verification polaroid"
                            className="w-full h-full object-cover animate-polaroid-develop"
                          />
                        </div>

                        {/* Handwritten Polaroid Caption in Caveat */}
                        <div className="text-center font-handwriting text-xl sm:text-2xl text-[#101A4A] leading-tight">
                          {sanitizeSquadName(squadName)} · Target #{activeCpIndex + 1} · Verified Arrival
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setPreviewCapturedImage(null);
                            startCamera();
                          }}
                          className="w-1/2 py-3 rounded-xl bg-white hover:bg-slate-50 border border-[#101A4A]/20 text-[#101A4A] font-semibold text-xs transition focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
                        >
                          Retake selfie
                        </button>

                        <button
                          onClick={handleConfirmFinalSelfie}
                          className="w-1/2 py-3 rounded-xl bg-[#0F8A68] hover:bg-[#0c7054] text-white font-heading font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98 focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
                        >
                          <Check className="w-4 h-4" />
                          <span>Confirm & Claim +150 pts</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}

              {/* ======================================================= */}
              {/* STAGE 4: RESULT / RUBBER STAMP SLAMMED (CLEARED)        */}
              {/* ======================================================= */}
              {currentState.currentStep === 'COMPLETED' && (
                <div className="space-y-6">
                  {/* GREEN RUBBER STAMP SLAMS ONTO THE PAGE */}
                  <div className="relative p-6 rounded-2xl bg-white border-2 border-[#0F8A68]/30 shadow-md space-y-4 overflow-hidden">
                    {/* The Cleared Rubber Stamp */}
                    <div className="border-4 border-[#0F8A68] text-[#0F8A68] font-heading font-black text-xl sm:text-2xl tracking-wider py-2 px-4 rounded-xl inline-block rotate-[-4deg] animate-stamp-slam shadow-sm">
                      CLEARED · +150 PTS
                    </div>

                    {/* Did you know paper note below stamp */}
                    {currentCheckpoint.loreFact && (
                      <div className="bg-[#FAF9F5] border border-[#101A4A]/15 rounded-xl p-3 shadow-xs">
                        <span className="text-[11px] font-heading font-black uppercase tracking-wider text-[#FFB627] block">
                          Did you know?
                        </span>
                        <p className="text-xs text-[#101A4A]/80 font-serif leading-snug line-clamp-2 mt-0.5">
                          {currentCheckpoint.loreFact}
                        </p>
                      </div>
                    )}

                    {/* REAL PLACE NAME REVEALED ONLY AFTER CLEARING! */}
                    <div className="pt-2">
                      <span className="text-xs uppercase font-semibold text-[#101A4A]/50 block">
                        Official campus landmark revealed:
                      </span>
                      <h3 className="font-heading font-black text-xl sm:text-2xl text-[#101A4A] mt-0.5">
                        {currentCheckpoint.place}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#101A4A]/80 leading-relaxed pt-2">
                        Clue solved: "{currentCheckpoint.hint}"
                      </p>
                      <div className="text-[11px] font-mono text-[#101A4A]/60 pt-1">
                        GPS: {currentCheckpoint.lat.toFixed(6)}, {currentCheckpoint.lng.toFixed(6)}
                      </div>
                    </div>

                    {/* Verified Polaroid Thumbnail */}
                    {currentState.capturedSelfie && (
                      <div className="pt-2">
                        <span className="text-xs text-[#101A4A]/50 font-medium block mb-2">
                          Filed passport photo:
                        </span>
                        <div className="max-w-xs bg-[#FAF9F5] p-2 pb-6 rounded-sm shadow-md border border-slate-300 rotate-[1deg]">
                          <img
                            src={currentState.capturedSelfie}
                            alt={currentCheckpoint.place}
                            className="w-full h-36 object-cover rounded-xs"
                          />
                          <p className="text-center font-handwriting text-base text-[#101A4A] pt-1">
                            Cleared at {currentState.clearedAt}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Next Checkpoint Navigation */}
                  {activeCpIndex < CHECKPOINTS_DATA.length - 1 ? (
                    <button
                      onClick={() => {
                        stopCamera();
                        setActiveCpIndex((i) => i + 1);
                      }}
                      className="w-full py-3.5 rounded-xl bg-[#101A4A] hover:bg-[#1C2C75] text-white font-heading font-bold text-sm tracking-wide transition shadow-md flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
                    >
                      <span>Turn to Checkpoint {activeCpIndex + 2}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-[#0F8A68]/15 border border-[#0F8A68]/40 text-[#0F8A68] text-center font-heading font-bold text-sm">
                        All 6 IET DAVV checkpoints conquered!
                      </div>
                      <button
                        onClick={() => setShowFinaleScreen(true)}
                        className="w-full py-3.5 rounded-xl bg-[#0F8A68] hover:bg-[#0c7054] text-white font-heading font-bold text-sm tracking-wide transition shadow-md flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
                      >
                        <Award className="w-4 h-4 text-[#FFB627]" />
                        <span>View quest finale</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================= */}
              {/* STAGE 5: RESULT / PENALIZED LOCKOUT (VOID STAMP)        */}
              {/* ======================================================= */}
              {currentState.currentStep === 'PENALIZED_LOCKOUT' && (
                <div className="space-y-6">
                  {/* RED VOID STAMP SLAMS ONTO THE PAGE */}
                  <div className="p-6 rounded-2xl bg-white border-2 border-[#D8281F]/30 shadow-md space-y-4">
                    <div className="border-4 border-[#D8281F] text-[#D8281F] font-heading font-black text-xl sm:text-2xl tracking-wider py-2 px-4 rounded-xl inline-block rotate-[-6deg] animate-stamp-slam shadow-sm">
                      VOID · -50 PTS
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <h4 className="font-heading font-bold text-lg text-[#D8281F]">
                        Stage locked: 3 perimeter warnings exceeded
                      </h4>
                      <p className="text-xs sm:text-sm text-[#101A4A]/80 leading-relaxed">
                        Three arrival attempts occurred outside the checkpoint perimeter. 50 points were deducted and this stage has been locked.
                      </p>
                    </div>

                    {/* Tester Reset Override */}
                    <div className="pt-2 border-t border-[#101A4A]/10 flex items-center justify-between text-xs">
                      <span className="text-[#101A4A]/60">Testing control:</span>
                      <button
                        onClick={handleResetStageSecurity}
                        className="px-3 py-1.5 rounded-lg bg-[#101A4A] text-white font-medium hover:bg-[#1C2C75] focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
                      >
                        Reset strikes & retry
                      </button>
                    </div>

                    {/* Navigation to next checkpoint or finale even if locked */}
                    <div className="pt-2">
                      {activeCpIndex < CHECKPOINTS_DATA.length - 1 ? (
                        <button
                          onClick={() => {
                            stopCamera();
                            setActiveCpIndex((i) => i + 1);
                          }}
                          className="w-full py-3 rounded-xl bg-[#101A4A] hover:bg-[#1C2C75] text-white font-heading font-bold text-xs tracking-wide transition shadow-md flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
                        >
                          <span>Proceed to Checkpoint {activeCpIndex + 2}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowFinaleScreen(true)}
                          className="w-full py-3 rounded-xl bg-[#101A4A] hover:bg-[#1C2C75] text-[#FFB627] font-heading font-bold text-xs tracking-wide transition shadow-md flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>View quest finale</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT: LIVE CAMPUS MAP & SIMULATOR CONTROLS (COLS 8-12) */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-[#101A4A] rounded-2xl p-5 shadow-2xl border border-white/10 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#FFB627]" />
                <div>
                  <h3 className="font-heading font-bold text-sm tracking-wide">
                    Live campus map
                  </h3>
                  <span className="text-[10px] text-white/60 sm:hidden">
                    IET DAVV Campus
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="hidden sm:inline text-[11px] font-semibold text-white/70">
                  IET DAVV Campus
                </span>

                {/* Map Style Toggle: Dark vs Light for daytime visibility */}
                <button
                  onClick={handleToggleMapTheme}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white flex items-center gap-1.5 transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
                  title={mapTheme === 'dark' ? 'Switch to Light mode for daytime visibility' : 'Switch to Dark map style'}
                  aria-label={`Toggle map style, currently ${mapTheme}`}
                >
                  {mapTheme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-[#FFB627]" />
                      <span>Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-[#FFB627]" />
                      <span>Dark</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* WARMER / COLDER CUE: Status line above map in CLUE step */}
            {currentState.currentStep === 'CLUE' && (
              <div
                role="status"
                aria-live="polite"
                className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between text-xs transition-colors motion-reduce:transition-none"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full motion-reduce:animate-none ${
                      proximityBand === 'Cold'
                        ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]'
                        : proximityBand === 'Cool'
                        ? 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]'
                        : proximityBand === 'Warm'
                        ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                        : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)] animate-pulse'
                    }`}
                  />
                  <span className="font-heading font-black tracking-wide text-white uppercase">
                    {proximityBand}
                  </span>
                  {proximityTrend && (
                    <span className="text-white/80 font-medium">
                      · {proximityTrend}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">
                  Proximity Signal
                </span>
              </div>
            )}

            {/* Live Leaflet PlayerMap (Replacing the distance radar) */}
            <PlayerMap
              pins={mapPins}
              userLocation={userLocation}
              accuracy={gpsAccuracy}
              canMove={isVirtualMode}
              onMove={(lat, lng) => setUserLocation({ lat, lng })}
              mapTheme={mapTheme}
              searchArea={searchArea}
            />

            {/* Map Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] border-t border-white/10">
              <div className="flex items-center gap-1.5 text-white/80">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-[#FFB627] bg-[#FFB627]/20 flex items-center justify-center" />
                <span>Search area</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/80">
                <span className="w-3.5 h-3.5 rounded-full bg-[#2B3FE0] border-2 border-white text-white font-bold text-[8px] flex items-center justify-center shadow-xs">
                  ●
                </span>
                <span>You</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/80">
                <span className="w-3.5 h-3.5 rounded-full bg-[#0F8A68] text-white font-bold text-[9px] flex items-center justify-center">
                  ✓
                </span>
                <span>Cleared</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/80">
                <span className="w-3.5 h-3.5 rounded-full bg-[#D8281F] text-white font-bold text-[9px] flex items-center justify-center">
                  ✕
                </span>
                <span>Locked</span>
              </div>
            </div>

            {/* Simulator Controls & D-Pad */}
            {DEMO_TOOLS_ENABLED && (
              <div className="pt-2 border-t border-white/10 space-y-3">
                <div className="text-[11px] font-semibold text-[#FFB627] leading-snug">
                  Demo mode: simulate walking to test remotely
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70">Navigation mode:</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setIsVirtualMode(true)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#FFB627] ${
                        isVirtualMode ? 'bg-[#FFB627] text-[#101A4A]' : 'bg-white/10 text-white/70 hover:bg-white/15'
                      }`}
                    >
                      Simulator
                    </button>
                    <button
                      onClick={() => setIsVirtualMode(false)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#FFB627] ${
                        !isVirtualMode ? 'bg-[#FFB627] text-[#101A4A]' : 'bg-white/10 text-white/70 hover:bg-white/15'
                      }`}
                    >
                      Live GPS
                    </button>
                  </div>
                </div>

                {isVirtualMode && (
                  <>
                    {/* Step Nudge Buttons */}
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <span>Walk step size:</span>
                      <div className="flex gap-1">
                        {[10, 20, 40].map((s) => (
                          <button
                            key={s}
                            onClick={() => setStepNudgeSize(s)}
                            className={`px-2 py-0.5 rounded text-[11px] transition focus:outline-none focus:ring-2 focus:ring-[#FFB627] ${
                              stepNudgeSize === s
                                ? 'bg-white/30 text-white font-bold'
                                : 'bg-white/5 text-white/50 hover:bg-white/10'
                            }`}
                          >
                            {s}m
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* D-Pad Controls */}
                    <div className="flex flex-col items-center justify-center py-1">
                      <button
                        onClick={() => handleNudgeLocation('N')}
                        className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
                        title="Walk North"
                        aria-label="Walk North"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2 my-1">
                        <button
                          onClick={() => handleNudgeLocation('W')}
                          className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
                          title="Walk West"
                          aria-label="Walk West"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] text-white/40 font-mono">
                          WALK
                        </div>
                        <button
                          onClick={() => handleNudgeLocation('E')}
                          className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
                          title="Walk East"
                          aria-label="Walk East"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleNudgeLocation('S')}
                        className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
                        title="Walk South"
                        aria-label="Walk South"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Teleport Quick Action Buttons (strictly without radius numbers) */}
                    <div className="space-y-2 pt-1">
                      <button
                        onClick={handleTeleportInside}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#0F8A68] hover:bg-[#0c7054] text-white font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98 focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#FFB627]" />
                        <span>Teleport to checkpoint (Sim)</span>
                      </button>

                      <button
                        onClick={handleTeleportOutside}
                        className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-xs transition focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
                      >
                        Teleport away from checkpoint (Sim)
                      </button>
                    </div>

                    {/* Test Tools Section (Visible only in simulator mode) */}
                    <div className="pt-3 mt-2 border-t border-white/15 space-y-2.5 bg-black/20 -mx-2 p-3 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#FFB627]">
                          Test tools
                        </span>
                        <span className="text-[10px] text-white/50">Simulator only</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Restart quest */}
                        <button
                          onClick={performFullReset}
                          className="w-full py-2 px-2.5 rounded-lg bg-white/10 hover:bg-[#D8281F]/80 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-white/15 focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
                          title="Reset game state immediately"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-[#FFB627]" />
                          <span>Restart quest</span>
                        </button>

                        {/* Skip to checkpoint dropdown */}
                        <div className="relative flex items-center">
                          <select
                            value={activeCpIndex}
                            onChange={(e) => handleSkipToCheckpoint(Number(e.target.value))}
                            aria-label="Skip to checkpoint"
                            className="w-full py-2 px-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 focus:outline-none focus:ring-2 focus:ring-[#FFB627] cursor-pointer"
                          >
                            {CHECKPOINTS_DATA.map((cp, idx) => (
                              <option key={cp.id} value={idx} className="bg-[#101A4A] text-white">
                                Skip to {cp.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ==================================================== */}
      {/* FINAL PINBOARD MODAL (POLAROID CORKBOARD)             */}
      {/* ==================================================== */}
      {isPinboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FAF9F5] border-4 border-[#101A4A] rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden text-[#101A4A]">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#101A4A]/15 bg-[#EEF0F7] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Pin className="w-5 h-5 text-[#D8281F]" />
                <div>
                  <h3 className="font-heading font-black text-lg text-[#101A4A]">
                    Squad polaroid pinboard
                  </h3>
                  <p className="text-xs text-[#101A4A]/60">
                    {squadName} · {completedCount} of {CHECKPOINTS_DATA.length} checkpoints cleared
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPinboardOpen(false)}
                className="p-1.5 rounded-lg text-[#101A4A]/60 hover:text-[#101A4A] hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corkboard Grid of Polaroids */}
            <div className="p-6 overflow-y-auto space-y-6 bg-[#E8E2D5] min-h-[320px]">
              {completedCount === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <Camera className="w-12 h-12 text-[#101A4A]/30 mx-auto" />
                  <p className="font-heading font-bold text-base text-[#101A4A]">No polaroids pinned yet</p>
                  <p className="text-xs text-[#101A4A]/60 max-w-sm mx-auto">
                    Travel to checkpoints, verify your arrival, and confirm your selfie to pin your photos here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {CHECKPOINTS_DATA.map((cp, idx) => {
                    const st = checkpointsState[cp.id];
                    if (!st.capturedSelfie) return null;
                    const angles = ['-2deg', '1.5deg', '-1deg', '2.5deg', '-1.5deg', '1.8deg'];
                    const pinColors = ['#D8281F', '#FFB627', '#0F8A68', '#2B3FE0', '#D8281F', '#FFB627'];

                    return (
                      <div
                        key={cp.id}
                        className="bg-white p-3 pb-6 rounded-sm shadow-xl border border-slate-300 relative transition-transform hover:scale-105"
                        style={{ transform: `rotate(${angles[idx % angles.length]})` }}
                      >
                        {/* Decorative Pushpin */}
                        <div
                          className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full shadow-md border border-black/30"
                          style={{ backgroundColor: pinColors[idx % pinColors.length] }}
                        />

                        <div className="aspect-video bg-black rounded-xs overflow-hidden mb-2">
                          <img
                            src={st.capturedSelfie}
                            alt={cp.place}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="text-center font-handwriting text-lg text-[#101A4A] leading-tight">
                          {cp.place}
                        </div>
                        <div className="text-[10px] text-center text-[#101A4A]/50 font-mono mt-0.5">
                          Cleared at {st.clearedAt}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Summary */}
            <div className="p-4 bg-[#EEF0F7] border-t border-[#101A4A]/15 flex items-center justify-between text-xs">
              <span className="font-medium text-[#101A4A]/70">Total squad points:</span>
              <div className="flex items-center gap-3">
                <strong className="font-heading font-black text-base text-[#101A4A]">
                  {score} pts
                </strong>
                <button
                  onClick={() => {
                    setIsPinboardOpen(false);
                    setShowFinaleScreen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#101A4A] text-[#FFB627] font-heading font-bold text-xs hover:bg-[#1C2C75] transition flex items-center gap-1.5"
                >
                  <Award className="w-3 h-3" />
                  <span>Finale screen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      )}

      {/* ==================================================== */}
      {/* SQUAD LEADERBOARD FULL RANKINGS MODAL                */}
      {/* ==================================================== */}
      <SquadLeaderboard
        currentSquadName={squadName}
        currentSquadScore={score}
        currentSquadSolvedCount={completedCount}
        totalCheckpoints={CHECKPOINTS_DATA.length}
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        isCompactSnapshot={false}
      />

      {/* ==================================================== */}
      {/* OPENING SCREEN: OPEN YOUR PASSPORT OVERLAY           */}
      {/* ==================================================== */}
      {showIntroScreen && (
        <IntroScreen
          initialSquadName={squadName}
          isRevisit={isRevisitingIntro}
          onStartQuest={(confirmedSquadName) => {
            setSquadName(confirmedSquadName);
            setSquadInputText(confirmedSquadName);
            try {
              localStorage.setItem('davv_intro_seen_v1', 'true');
            } catch {
              // Ignore
            }
            setShowIntroScreen(false);
            setIsRevisitingIntro(false);
            handleLeaveFrontPage();
          }}
          onDismiss={() => {
            setShowIntroScreen(false);
            setIsRevisitingIntro(false);
          }}
          soundSynth={{
            playTicketSelect: () => sounds.playTicketSelect(),
            playRubberStampSlam: () => sounds.playRubberStampSlam(),
            playWaxSealBreak: () => sounds.playWaxSealBreak(),
          }}
        />
      )}

      {/* ==================================================== */}
      {/* FINALE SCREEN: SQUAD PASSPORT ALBUM & COLLAGE        */}
      {/* ==================================================== */}
      {showFinaleScreen && (
        <FinaleScreen
          squadName={squadName}
          score={score}
          checkpoints={CHECKPOINTS_DATA}
          checkpointsState={checkpointsState}
          totalTimeFormatted={formatTimer(elapsedSeconds)}
          onPlayAgain={() => {
            setShowFinaleScreen(false);
            handleRestartEntireQuest();
          }}
          soundSynth={{
            playRubberStampSlam: () => sounds.playRubberStampSlam(),
            playTicketSelect: () => sounds.playTicketSelect(),
          }}
        />
      )}
    </>
  );
}
