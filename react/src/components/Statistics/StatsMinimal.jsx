import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Zap, TrendingUp, Target } from 'lucide-react';
import { getStats } from '../../services/sentencesApi';
import './StatsMinimal.css';

export default function StatsMinimal() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // جلب الإحصائيات من Backend
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (err) {
      console.error('خطأ في جلب الإحصائيات:', err);
      setError('فشل تحميل الإحصائيات');
    } finally {
      setLoading(false);
    }
  };

  // حساب الـ streak من localStorage (مؤقتاً حتى يتم إضافته للـ Backend)
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
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="stats-minimal">
      {/* الجمل المستحقة اليوم */}
      <div className="stat-card due">
        <div className="stat-icon">
          <Clock size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{stats.due || 0}</div>
          <div className="stat-label">للمراجعة اليوم</div>
        </div>
      </div>

      {/* إجمالي الجمل */}
      <div className="stat-card total">
        <div className="stat-icon">
          <Target size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{stats.total || 0}</div>
          <div className="stat-label">إجمالي الجمل</div>
        </div>
      </div>

      {/* نسبة الإتقان */}
      <div className="stat-card mastery">
        <div className="stat-icon">
          <TrendingUp size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{stats.masteryPercentage || 0}%</div>
          <div className="stat-label">نسبة الإتقان</div>
        </div>
      </div>

      {/* عداد الـ Streak */}
      {streak > 0 && (
        <div className="stat-card streak">
          <div className="stat-icon">
            <Zap size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{streak} 🔥</div>
            <div className="stat-label">يوم متتالي</div>
          </div>
        </div>
      )}
    </div>
  );
}
