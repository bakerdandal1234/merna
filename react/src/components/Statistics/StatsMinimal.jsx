import React, { useMemo } from 'react';
import { calculateStats, getDueSentences } from '../../utils/srs';
import { Clock, Zap } from 'lucide-react';
import './StatsMinimal.css';

export default function StatsMinimal({ sentences }) {
  // حساب الإحصائيات الأساسية فقط
  const stats = useMemo(() => calculateStats(sentences), [sentences]);
  const dueSentences = useMemo(() => getDueSentences(sentences), [sentences]);

  // حساب الـ streak (افتراضي - يمكن استبداله بالبيانات الحقيقية من localStorage)
  const streak = parseInt(localStorage.getItem('reviewStreak') || '0');

  return (
    <div className="stats-minimal">
      {/* الجمل المستحقة اليوم */}
      <div className="stat-card due">
        <div className="stat-icon">
          <Clock size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{stats.due}</div>
          <div className="stat-label">للمراجعة اليوم</div>
        </div>
      </div>

      {/* عداد الـ Streak */}
      <div className="stat-card streak">
        <div className="stat-icon">
          <Zap size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{streak} 🔥</div>
          <div className="stat-label">يوم متتالي</div>
        </div>
      </div>
    </div>
  );
}
