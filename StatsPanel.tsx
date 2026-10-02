import { useEffect, useState } from "react";
import { supabase, type HangmanResult } from "../lib/supabase";
import { Trophy, BarChart3, Flame, Target, TrendingUp } from "lucide-react";

type StatsPanelProps = {
  refreshKey: number;
};

type Stats = {
  total: number;
  wins: number;
  losses: number;
  winRate: number;
  bestStreak: number;
  currentStreak: number;
};

export function StatsPanel({ refreshKey }: StatsPanelProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<HangmanResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("hangman_results")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (cancelled) return;

      if (error || !data) {
        setLoading(false);
        return;
      }

      const results = data as HangmanResult[];
      const total = results.length;
      const wins = results.filter((r) => r.won).length;
      const losses = total - wins;
      const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

      let bestStreak = 0;
      let currentStreak = 0;
      const chronological = [...results].reverse();
      for (const r of chronological) {
        if (r.won) {
          currentStreak++;
          bestStreak = Math.max(bestStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }

      setStats({ total, wins, losses, winRate, bestStreak, currentStreak });
      setRecent(results.slice(0, 8));
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="stats-panel">
        <div className="stats-loading">Loading stats…</div>
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="stats-panel">
        <h3 className="stats-title">
          <BarChart3 size={20} />
          Your Stats
        </h3>
        <p className="stats-empty">Play your first game to see stats here!</p>
      </div>
    );
  }

  return (
    <div className="stats-panel">
      <h3 className="stats-title">
        <BarChart3 size={20} />
        Your Stats
      </h3>

      <div className="stats-grid">
        <div className="stat-card">
          <Target size={18} className="stat-icon" />
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Games</span>
        </div>
        <div className="stat-card stat-win">
          <Trophy size={18} className="stat-icon" />
          <span className="stat-value">{stats.wins}</span>
          <span className="stat-label">Wins</span>
        </div>
        <div className="stat-card stat-loss">
          <SkullIcon />
          <span className="stat-value">{stats.losses}</span>
          <span className="stat-label">Losses</span>
        </div>
        <div className="stat-card">
          <TrendingUp size={18} className="stat-icon" />
          <span className="stat-value">{stats.winRate}%</span>
          <span className="stat-label">Win Rate</span>
        </div>
        <div className="stat-card stat-streak">
          <Flame size={18} className="stat-icon" />
          <span className="stat-value">{stats.bestStreak}</span>
          <span className="stat-label">Best Streak</span>
        </div>
        <div className="stat-card">
          <Flame size={18} className="stat-icon" />
          <span className="stat-value">{stats.currentStreak}</span>
          <span className="stat-label">Current Streak</span>
        </div>
      </div>

      <h4 className="recent-title">Recent Games</h4>
      <div className="recent-list">
        {recent.map((r) => (
          <div key={r.id} className={`recent-item ${r.won ? "win" : "lose"}`}>
            <span className={`recent-badge ${r.won ? "win" : "lose"}`}>
              {r.won ? "WIN" : "LOSS"}
            </span>
            <span className="recent-word">{r.word.toUpperCase()}</span>
            <span className="recent-category">{r.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkullIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
      <path d="M8 20v2h8v-2" />
      <path d="M12.5 17l0-2" />
      <path d="M17 4a7 7 0 0 0-10 0c-1.5 1.5-2 3.5-2 5a5 5 0 0 0 2 4v2h10v-2a5 5 0 0 0 2-4c0-1.5-.5-3.5-2-5Z" />
    </svg>
  );
}
