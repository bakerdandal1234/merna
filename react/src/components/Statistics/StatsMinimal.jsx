import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Zap, TrendingUp, Target } from 'lucide-react';
import { getStats } from '../../services/sentencesApi';
import './StatsMinimal.css';

export default function StatsMinimal() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getStats();
      if (response.success) setStats(response.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Statistiken konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  // Streak from localStorage (temporary until backend supports it)
  const streak = useMemo(() => {
    return parseInt(localStorage.getItem('reviewStreak') || '0');
  }, []);

  if (loading) {
    return (
      <div className="stats-minimal">
        <div className="stat-card skeleton">
          <div className="skeleton-icon"></div>
          <div className="skeleton-content">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
          </div>
        </div>
        <div className="stat-card skeleton">
          <div className="skeleton-icon"></div>
          <div className="skeleton-content">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-minimal-error">
        <p>{error}</p>
        <button onClick={fetchStats} className="retry-btn">
          Erneut versuchen
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="stats-minimal">
      {/* Due today */}
      <div className="stat-card due">
        <div className="stat-icon"><Clock size={24} /></div>
        <div className="stat-content">
          <div className="stat-value">{stats.due || 0}</div>
          <div className="stat-label">Heute fällig</div>
        </div>
      </div>

      {/* Total sentences */}
      <div className="stat-card total">
        <div className="stat-icon"><Target size={24} /></div>
        <div className="stat-content">
          <div className="stat-value">{stats.total || 0}</div>
          <div className="stat-label">Sätze gesamt</div>
        </div>
      </div>

      {/* Active learning percentage */}
      <div className="stat-card mastery">
        <div className="stat-icon"><TrendingUp size={24} /></div>
        <div className="stat-content">
          <div className="stat-value">{stats.masteryPercentage || 0}%</div>
          <div className="stat-label">Aktives Lernen</div>
        </div>
      </div>

      {/* Streak counter */}
      {streak > 0 && (
        <div className="stat-card streak">
          <div className="stat-icon"><Zap size={24} /></div>
          <div className="stat-content">
            <div className="stat-value">{streak} 🔥</div>
            <div className="stat-label">Tage in Folge</div>
          </div>
        </div>
      )}
    </div>
  );
}
