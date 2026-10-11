import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Users,
  Flame,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Shield,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Zap,
  TrendingUp,
} from 'lucide-react';

export interface SquadParticipant {
  id: string;
  squadName: string;
  department: string;
  avatar: string;
  checkpointsSolved: number;
  totalCheckpoints: number;
  quizPoints: number;
  arrivalPoints: number;
  penaltyDeductions: number;
  totalScore: number;
  lastActiveTime: string;
  isCurrentSquad?: boolean;
  statusBadge?: string;
}

// Initial realistic campus participant dataset from DAVV departments
export const DEFAULT_PARTICIPANTS: SquadParticipant[] = [
  {
    id: 'squad-1',
    squadName: 'Hackathon Titans',
    department: 'Computer Science (IET M-Block)',
    avatar: '⚡',
    checkpointsSolved: 5,
    totalCheckpoints: 5,
    quizPoints: 250,
    arrivalPoints: 750,
    penaltyDeductions: 0,
    totalScore: 1000,
    lastActiveTime: '2 mins ago',
    statusBadge: 'All Checkpoints Cleared',
  },
  {
    id: 'squad-2',
    squadName: 'Team Pegasus Baja',
    department: 'Mechanical Workshop & SAE Club',
    avatar: '🏎️',
    checkpointsSolved: 4,
    totalCheckpoints: 5,
    quizPoints: 200,
    arrivalPoints: 600,
    penaltyDeductions: 0,
    totalScore: 800,
    lastActiveTime: '4 mins ago',
    statusBadge: 'Target #5 In Range',
  },
  {
    id: 'squad-3',
    squadName: 'Takshashila Scholars',
    department: 'Central University Library Guild',
    avatar: '📚',
    checkpointsSolved: 3,
    totalCheckpoints: 5,
    quizPoints: 150,
    arrivalPoints: 450,
    penaltyDeductions: 0,
    totalScore: 600,
    lastActiveTime: '7 mins ago',
    statusBadge: 'Target #4 En Route',
  },
  {
    id: 'squad-4',
    squadName: 'Indore Poha Mavericks',
    department: 'Campus Cultural & Media Cell',
    avatar: '☕',
    checkpointsSolved: 3,
    totalCheckpoints: 5,
    quizPoints: 150,
    arrivalPoints: 450,
    penaltyDeductions: 50,
    totalScore: 550,
    lastActiveTime: '9 mins ago',
    statusBadge: 'Warning Penalty Applied',
  },
  {
    id: 'squad-5',
    squadName: 'Phoenix GDG Coders',
    department: 'Google Developer Student Club',
    avatar: '🔥',
    checkpointsSolved: 2,
    totalCheckpoints: 5,
    quizPoints: 100,
    arrivalPoints: 300,
    penaltyDeductions: 0,
    totalScore: 400,
    lastActiveTime: '11 mins ago',
    statusBadge: 'Target #3 Decoding Clue',
  },
  {
    id: 'squad-6',
    squadName: 'Circuit Breakers',
    department: 'Electronics & Telecommunication',
    avatar: '🔌',
    checkpointsSolved: 2,
    totalCheckpoints: 5,
    quizPoints: 100,
    arrivalPoints: 300,
    penaltyDeductions: 50,
    totalScore: 350,
    lastActiveTime: '15 mins ago',
    statusBadge: 'Target #2 In Transit',
  },
  {
    id: 'squad-7',
    squadName: 'Civil Matrix Builders',
    department: 'Civil Engineering Department',
    avatar: '📐',
    checkpointsSolved: 1,
    totalCheckpoints: 5,
    quizPoints: 50,
    arrivalPoints: 150,
    penaltyDeductions: 0,
    totalScore: 200,
    lastActiveTime: '22 mins ago',
    statusBadge: 'Target #2 Approaching',
  },
];

interface SquadLeaderboardProps {
  currentSquadName?: string;
  currentSquadScore?: number;
  currentSquadSolvedCount?: number;
  totalCheckpoints?: number;
  isOpen?: boolean;
  onClose?: () => void;
  isCompactSnapshot?: boolean; // When true, renders a compact in-dashboard widget
}

export const SquadLeaderboard: React.FC<SquadLeaderboardProps> = ({
  currentSquadName = 'SQUAD PHOENIX',
  currentSquadScore = 100,
  currentSquadSolvedCount = 0,
  totalCheckpoints = 5,
  isOpen = true,
  onClose,
  isCompactSnapshot = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFilter, setViewFilter] = useState<'top5' | 'all'>('top5');
  const [sortBy, setSortBy] = useState<'score' | 'solved'>('score');

  // Synthesize and aggregate all participants with the live user squad
  const allAggregatedSquads = useMemo(() => {
    // Current user squad representation
    const userSquad: SquadParticipant = {
      id: 'current-user-squad',
      squadName: currentSquadName.trim() || 'You (Active Squad)',
      department: 'DAVV Takshashila Hunter',
      avatar: '🛡️',
      checkpointsSolved: currentSquadSolvedCount,
      totalCheckpoints: totalCheckpoints,
      quizPoints: currentSquadSolvedCount * 50,
      arrivalPoints: currentSquadSolvedCount * 150,
      penaltyDeductions: Math.max(0, currentSquadSolvedCount * 200 - currentSquadScore),
      totalScore: currentSquadScore,
      lastActiveTime: 'Just now (Live)',
      isCurrentSquad: true,
      statusBadge: currentSquadSolvedCount === totalCheckpoints ? 'Quest Completed ✓' : 'Live In Mission',
    };

    // Combine user squad and participants, deduplicating if names match
    const others = DEFAULT_PARTICIPANTS.filter(
      (p) => p.squadName.toLowerCase() !== currentSquadName.toLowerCase().trim()
    );

    const combined = [userSquad, ...others];

    // Sort by total points earned descending
    return combined.sort((a, b) => {
      if (sortBy === 'score') {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        return b.checkpointsSolved - a.checkpointsSolved;
      } else {
        if (b.checkpointsSolved !== a.checkpointsSolved) return b.checkpointsSolved - a.checkpointsSolved;
        return b.totalScore - a.totalScore;
      }
    });
  }, [currentSquadName, currentSquadScore, currentSquadSolvedCount, totalCheckpoints, sortBy]);

  // Find user's exact ranking among all participants
  const userRankIndex = allAggregatedSquads.findIndex((s) => s.isCurrentSquad);
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : 1;

  // Filter for Top 5
  const top5Squads = useMemo(() => {
    return allAggregatedSquads.slice(0, 5);
  }, [allAggregatedSquads]);

  // Squads to display based on viewFilter and searchQuery
  const displayedSquads = useMemo(() => {
    let list = viewFilter === 'top5' ? top5Squads : allAggregatedSquads;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) => s.squadName.toLowerCase().includes(q) || s.department.toLowerCase().includes(q)
      );
    }
    return list;
  }, [viewFilter, top5Squads, allAggregatedSquads, searchQuery]);

  // Medal and Rank styles
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg shadow-amber-500/30 border border-amber-300">
            <Crown className="w-4 h-4 fill-slate-950 text-slate-950" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md border border-white">
            <Medal className="w-4 h-4 text-slate-900" />
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 text-white font-black text-xs flex items-center justify-center shadow-md border border-amber-500/50">
            <Award className="w-4 h-4 text-amber-200" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 font-mono font-bold text-xs flex items-center justify-center border border-slate-700">
            #{rank}
          </div>
        );
    }
  };

  // -------------------------------------------------------------------------
  // COMPACT IN-DASHBOARD SNAPSHOT (Rendered directly on page)
  // -------------------------------------------------------------------------
  if (isCompactSnapshot) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-sm space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs sm:text-sm tracking-wide text-white">
                Top 5 Squad Leaderboard
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Sorted by total points earned
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold uppercase tracking-wide">
            Sample squads for demo
          </span>
        </div>

        {/* Top 5 Snapshot List */}
        <div className="space-y-2">
          {top5Squads.map((squad, idx) => {
            const rank = idx + 1;
            const isUser = squad.isCurrentSquad;

            return (
              <div
                key={squad.id}
                className={`p-2.5 rounded-2xl border transition flex items-center justify-between ${
                  isUser
                    ? 'bg-cyan-950/40 border-[#00FFCC] shadow-md shadow-cyan-500/10'
                    : rank === 1
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono font-extrabold text-xs w-5 text-center text-slate-400">
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white truncate">
                        {squad.squadName}
                      </span>
                      {isUser && (
                        <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-[#00FFCC] font-mono text-[9px] font-extrabold uppercase">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block truncate">
                      {squad.checkpointsSolved}/{squad.totalCheckpoints} Cleared · {squad.department}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <span
                    className={`font-mono font-black text-xs ${
                      isUser ? 'text-[#00FFCC]' : rank === 1 ? 'text-amber-400' : 'text-slate-200'
                    }`}
                  >
                    {squad.totalScore} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* User Standing Callout if not in Top 5 */}
        {userRank > 5 && (
          <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">
              Your Squad Position: <strong className="text-[#00FFCC]">#{userRank}</strong> ({currentSquadScore} pts)
            </span>
            <span className="text-amber-400 text-[11px]">
              +{top5Squads[4].totalScore - currentSquadScore + 1} pts to Top 5
            </span>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // FULL EXPANDED LEADERBOARD MODAL
  // -------------------------------------------------------------------------
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border-cyan-500/20">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  Squad Leaderboard
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-[#00FFCC] font-bold">
                  DAVV QUEST
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-extrabold uppercase tracking-wide">
                  Sample squads for demo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Aggregated total points from all campus participants
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close Leaderboard"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Podium Highlights (Top 3 Showcase) */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-950/90 to-slate-900/40 border-b border-slate-800/80">
          <div className="text-xs font-mono uppercase text-slate-400 font-bold mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Crown className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Top 3 Champions Podium</span>
            </span>
            <span className="text-slate-500 text-[11px]">Ranked by Total Quest Points</span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end pt-1">
            {/* 2nd Place */}
            {top5Squads[1] && (
              <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex flex-col items-center text-center shadow-lg relative">
                <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-950 font-extrabold text-xs flex items-center justify-center mb-1.5 shadow-sm">
                  2
                </div>
                <span className="font-extrabold text-xs text-slate-100 truncate w-full">
                  {top5Squads[1].squadName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono truncate w-full">
                  {top5Squads[1].checkpointsSolved}/5 cleared
                </span>
                <span className="font-mono font-black text-xs sm:text-sm text-cyan-400 mt-1">
                  {top5Squads[1].totalScore} pts
                </span>
              </div>
            )}

            {/* 1st Place (Crown Champion) */}
            {top5Squads[0] && (
              <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-amber-950/40 to-slate-900 border border-amber-500/50 flex flex-col items-center text-center shadow-xl shadow-amber-500/10 relative -translate-y-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black text-sm flex items-center justify-center mb-1.5 shadow-md">
                  👑
                </div>
                <span className="font-black text-xs sm:text-sm text-amber-300 truncate w-full">
                  {top5Squads[0].squadName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono truncate w-full">
                  {top5Squads[0].checkpointsSolved}/5 cleared
                </span>
                <span className="font-mono font-black text-sm sm:text-base text-amber-400 mt-1">
                  {top5Squads[0].totalScore} pts
                </span>
              </div>
            )}

            {/* 3rd Place */}
            {top5Squads[2] && (
              <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-900/90 border border-amber-800/60 flex flex-col items-center text-center shadow-lg relative">
                <div className="w-7 h-7 rounded-full bg-amber-700 text-white font-extrabold text-xs flex items-center justify-center mb-1.5 shadow-sm">
                  3
                </div>
                <span className="font-extrabold text-xs text-slate-100 truncate w-full">
                  {top5Squads[2].squadName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono truncate w-full">
                  {top5Squads[2].checkpointsSolved}/5 cleared
                </span>
                <span className="font-mono font-black text-xs sm:text-sm text-amber-400 mt-1">
                  {top5Squads[2].totalScore} pts
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="p-3 sm:p-4 border-b border-slate-800/80 bg-slate-950/40 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setViewFilter('top5')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition ${
                viewFilter === 'top5'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Top 5 Leaders
            </button>
            <button
              onClick={() => setViewFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition ${
                viewFilter === 'all'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Participants ({allAggregatedSquads.length})
            </button>
          </div>

          <div className="relative flex-1 min-w-[140px] max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search squad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 placeholder:text-slate-600 font-sans"
            />
          </div>
        </div>

        {/* Scrollable Squad Leaderboard List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1">
          {displayedSquads.map((squad, idx) => {
            // Find absolute rank in the full aggregated list
            const rank = allAggregatedSquads.findIndex((s) => s.id === squad.id) + 1;
            const isUser = squad.isCurrentSquad;

            return (
              <div
                key={squad.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isUser
                    ? 'bg-cyan-950/40 border-[#00FFCC] shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                    : rank === 1
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Left: Rank Badge + Avatar + Info */}
                <div className="flex items-center gap-3 min-w-0">
                  {getRankBadge(rank)}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white truncate">
                        {squad.squadName}
                      </span>
                      {isUser && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-[#00FFCC] font-mono text-[10px] font-extrabold border border-cyan-500/40 uppercase">
                          YOUR SQUAD
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                      <span>{squad.department}</span>
                      <span>·</span>
                      <span className="text-slate-500">{squad.lastActiveTime}</span>
                    </div>

                    {/* Breakdown pill */}
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-1">
                      <span className="text-emerald-400">
                        {squad.checkpointsSolved}/{squad.totalCheckpoints} Cleared
                      </span>
                      {squad.penaltyDeductions > 0 && (
                        <span className="text-rose-400">
                          (-{squad.penaltyDeductions} penalty)
                        </span>
                      )}
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400 truncate max-w-[120px]">
                        {squad.statusBadge}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Total Points Earned */}
                <div className="text-right shrink-0">
                  <div
                    className={`font-mono font-black text-base sm:text-lg ${
                      isUser
                        ? 'text-[#00FFCC]'
                        : rank === 1
                        ? 'text-amber-400'
                        : rank <= 3
                        ? 'text-cyan-300'
                        : 'text-slate-200'
                    }`}
                  >
                    {squad.totalScore}
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block -mt-0.5">
                    Total Points
                  </span>
                </div>
              </div>
            );
          })}

          {displayedSquads.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500 font-mono">
              No squads found matching "{searchQuery}"
            </div>
          )}
        </div>

        {/* Footer: User Standing Summary */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-slate-500">Your Standing:</span>
            <strong className="text-[#00FFCC]">#{userRank} of {allAggregatedSquads.length} Squads</strong>
            <span>({currentSquadScore} pts)</span>
          </div>

          {userRank > 1 && (
            <div className="text-amber-400 text-right">
              {allAggregatedSquads[0].totalScore - currentSquadScore} pts to #1 Leader
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
