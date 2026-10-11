export type CheckpointDifficulty = 'easy' | 'standard' | 'medium' | 'hard' | 'extreme' | 'high';

export type PowerUpType =
  | 'radius_boost'
  | 'hint_reveal'
  | 'time_bonus'
  | 'compass_sonar'
  | 'double_score';

export type GameMode = 'free_roam' | 'time_trial' | 'squad_race' | 'stopwatch';

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  lat?: number;
  lng?: number;
}

export interface SelfieVerificationRecord {
  checkpointId: string;
  checkpointTitle?: string;
  landmarkName?: string;
  timestamp: number | string;
  photoDataUrl?: string;
  photoUrl: string;
  coordinates?: Coordinates;
  latitude: number;
  longitude: number;
  accuracy?: number;
  squadName?: string;
  playerName?: string;
  [key: string]: any;
}

export interface LeaderboardEntry {
  id: string;
  name?: string;
  squadName: string;
  avatarSeed: string;
  avatar?: string;
  score: number;
  checkpointsSolved: number;
  totalCheckpoints?: number;
  totalTimeSeconds?: number;
  timeSeconds?: number;
  isCurrentSquad?: boolean;
  isTeam?: boolean;
  department?: string;
  lastActive?: string;
  rank?: number;
  powerUpsUsed?: number;
  gameMode?: string;
  [key: string]: any;
}

export interface PlayerProfile {
  id: string;
  name: string;
  squadName: string;
  avatarSeed: string;
  avatar?: string;
  score: number;
  isCaptain?: boolean;
  isTeam?: boolean;
  department?: string;
  year?: string;
  [key: string]: any;
}

export interface TrackedSquad {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  currentCheckpointIndex: number;
  score: number;
  coordinates: Coordinates;
  latitude: number;
  longitude: number;
  status?: string;
  currentObjective?: string;
  department?: string;
  lastUpdated: number;
  [key: string]: any;
}

export interface PowerUp {
  id: PowerUpType;
  name: string;
  description: string;
  icon: string;
  cost: number;
  durationSeconds?: number;
}

export interface CheckpointPuzzle {
  type: string;
  title: string;
  instruction: string;
  solution: string;
  options?: string[];
  hint: string;
  encryptedText?: string;
  scrambledWord?: string;
  [key: string]: any;
}

export interface CheckpointQuiz {
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

export interface Checkpoint {
  id: string;
  name: string;
  place: string;
  lat: number;
  lng: number;
  radius: number;
  hint: string;
  quiz: CheckpointQuiz;

  title?: string;
  buildingName?: string;
  latitude?: number;
  longitude?: number;
  points?: number;
  puzzle?: CheckpointPuzzle;
  clueRiddle?: string;
  hintText?: string;
  challengeQuestion?: string;
  challengeOptions?: string[];
  correctAnswer?: string;
  orderIndex?: number;
  difficulty?: CheckpointDifficulty;
  requiresCameraSelfie?: boolean;
  selfiePrompt?: string;
  powerUpReward?: PowerUpType;
  loreFact?: string;
  [key: string]: any;
}

export interface PlayerProgress {
  unlockedClueCheckpointIds: string[];
  solvedCheckpointIds: string[];
  activePowerUps: {
    type: PowerUpType;
    expiresAt: number;
  }[];
  inventory: {
    [key in PowerUpType]: number;
  };
}

export interface SquadMember {
  id: string;
  name: string;
  avatarSeed: string;
  isCaptain?: boolean;
}

export interface SquadProfile {
  name: string;
  slogan: string;
  avatarColor: string;
  members: SquadMember[];
}
