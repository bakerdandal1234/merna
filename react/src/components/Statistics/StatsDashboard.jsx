import React, { useMemo } from 'react';
import { calculateStats, getDueSentences, getSmartSuggestions, predictMastery } from '../../utils/srs';
import { TrendingUp, Target, Award, Calendar, Clock, Zap, BookOpen, CheckCircle } from 'lucide-react';
import './StatsDashboard.css';

export default function StatsDashboard({ sentences, onStartReview }) {
  // حساب الإحصائيات
  const stats = useMemo(() => calculateStats(sentences), [sentences]);
  const dueSentences = useMemo(() => getDueSentences(sentences), [sentences]);
  const suggestions = useMemo(() => getSmartSuggestions(stats), [stats]);
  const prediction = useMemo(() => predictMastery(sentences), [sentences]);

  // حساب الـ streak (افتراضي - يمكن استبداله بالبيانات الحقيقية)
  const streak = 7; // TODO: احصل عليها من localStorage أو Backend

  return (
    <div className="stats-dashboard">
      {/* العنوان */}
      <div className="stats-header">
        <h1 className="stats-title">📊 إحصائياتك</h1>
        <p className="stats-subtitle">تتبع تقدمك في تعلم الألمانية</p>
      </div>

      {/* البطاقات الرئيسية */}
      <div className="stats-grid">
        {/* إجمالي الجمل */}
        <StatCard
          icon={<BookOpen size={32} />}
          title="إجمالي الجمل"
          value={stats.total}
          color="#3b82f6"
          subtitle="جملة مضافة"
        />

        {/* الجمل المستحقة */}
        <StatCard
          icon={<Clock size={32} />}
          title="مراجعات اليوم"
          value={stats.due}
          color="#f59e0b"
          subtitle="جملة تنتظر المراجعة"
          highlight={stats.due > 0}
        />

        {/* نسبة التعلم النشط */}
        <StatCard
          icon={<TrendingUp size={32} />}
          title="التعلم النشط"
          value={`${stats.masteryPercentage}%`}
          color="#10b981"
          subtitle="من الجمل قيد المراجعة"
        />

        {/* الـ Streak */}
        <StatCard
          icon={<Zap size={32} />}
          title="Streak"
          value={streak}
          color="#ec4899"
          subtitle="يوم متتالي 🔥"
        />
      </div>

      {/* شريط التقدم */}
      <div className="progress-section">
        <h2 className="section-title">📈 التقدم العام</h2>
        <ProgressBar
          new={stats.new}
          hard={stats.hard}
          good={stats.good}
          excellent={stats.excellent}
          mastered={stats.mastered}
          total={stats.total}
        />
      </div>

      {/* تفاصيل المستويات */}
      <div className="levels-grid">
        <LevelCard
          level="جديد"
          count={stats.new}
          total={stats.total}
          color="#ef4444"
          icon="🆕"
        />
        <LevelCard
          level="صعب"
          count={stats.hard}
          total={stats.total}
          color="#f97316"
          icon="😅"
        />
        <LevelCard
          level="جيد"
          count={stats.good}
          total={stats.total}
          color="#eab308"
          icon="👍"
        />
        <LevelCard
          level="ممتاز"
          count={stats.excellent}
          total={stats.total}
          color="#10b981"
          icon="⭐"
        />
        <LevelCard
          level="مُتقن"
          count={stats.mastered}
          total={stats.total}
          color="#6366f1"
          icon="🏆"
        />
      </div>

      {/* التوقعات */}
      <div className="prediction-section">
        <h2 className="section-title">🔮 التوقعات</h2>
        <div className="prediction-card">
          <div className="prediction-item">
            <Calendar size={24} />
            <div>
              <div className="prediction-label">الإتقان الكامل</div>
              <div className="prediction-value">
                {prediction.daysNeeded} يوم
                ({prediction.weeksNeeded} أسبوع تقريباً)
              </div>
            </div>
          </div>
          <div className="prediction-item">
            <Target size={24} />
            <div>
              <div className="prediction-label">التاريخ المتوقع</div>
              <div className="prediction-value">
                {prediction.estimatedDate.toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
        <p className="prediction-note">
          * بناءً على معدل 15 مراجعة يومياً
        </p>
      </div>

      {/* الاقتراحات الذكية */}
      <div className="suggestions-section">
        <h2 className="section-title">💡 اقتراحات ذكية</h2>
        <div className="suggestions-list">
          {suggestions.map((suggestion, index) => {
            const isReviewAction = suggestion.action === 'راجع الآن' || suggestion.action === 'ابدأ المراجعة الآن';
            return (
              <SuggestionCard 
                key={index} 
                {...suggestion}
                onAction={isReviewAction ? onStartReview : null}
              />
            );
          })}
        </div>
      </div>

      {/* الإنجازات */}
      <div className="achievements-section">
        <h2 className="section-title">🏆 الإنجازات</h2>
        <div className="achievements-grid">
          <Achievement
            icon="🎯"
            title="البداية القوية"
            description="أضف 10 جمل"
            achieved={stats.total >= 10}
          />
          <Achievement
            icon="📚"
            title="متعلم نشط"
            description="أضف 50 جملة"
            achieved={stats.total >= 50}
          />
          <Achievement
            icon="⭐"
            title="نجم الإتقان"
            description="أتقن 25 جملة"
            achieved={stats.mastered >= 25}
          />
          <Achievement
            icon="🔥"
            title="Streak Master"
            description="7 أيام متتالية"
            achieved={streak >= 7}
          />
          <Achievement
            icon="💯"
            title="الإتقان الكامل"
            description="100% إتقان"
            achieved={stats.masteryPercentage >= 100}
          />
          <Achievement
            icon="👑"
            title="الأسطورة"
            description="أتقن 100 جملة"
            achieved={stats.mastered >= 100}
          />
        </div>
      </div>
    </div>
  );
}

// Component للبطاقة الإحصائية
function StatCard({ icon, title, value, color, subtitle, highlight }) {
  return (
    <div className={`stat-card ${highlight ? 'highlight' : ''}`} style={{ '--color': color }}>
      <div className="stat-icon" style={{ color }}>
        {icon}
      </div>
      <div className="stat-content">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-subtitle">{subtitle}</div>
      </div>
    </div>
  );
}

// Component لشريط التقدم
function ProgressBar({ new: newCount, hard, good, excellent, mastered, total }) {
  const getPercentage = (count) => total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div
          className="progress-segment new"
          style={{ width: `${getPercentage(newCount)}%` }}
          title={`جديد: ${newCount}`}
        />
        <div
          className="progress-segment hard"
          style={{ width: `${getPercentage(hard)}%` }}
          title={`صعب: ${hard}`}
        />
        <div
          className="progress-segment good"
          style={{ width: `${getPercentage(good)}%` }}
          title={`جيد: ${good}`}
        />
        <div
          className="progress-segment excellent"
          style={{ width: `${getPercentage(excellent)}%` }}
          title={`ممتاز: ${excellent}`}
        />
        <div
          className="progress-segment mastered"
          style={{ width: `${getPercentage(mastered)}%` }}
          title={`مُتقن: ${mastered}`}
        />
      </div>
      <div className="progress-legend">
        <span className="legend-item">
          <span className="legend-dot new"></span> جديد ({newCount})
        </span>
        <span className="legend-item">
          <span className="legend-dot hard"></span> صعب ({hard})
        </span>
        <span className="legend-item">
          <span className="legend-dot good"></span> جيد ({good})
        </span>
        <span className="legend-item">
          <span className="legend-dot excellent"></span> ممتاز ({excellent})
        </span>
        <span className="legend-item">
          <span className="legend-dot mastered"></span> مُتقن ({mastered})
        </span>
      </div>
    </div>
  );
}

// Component لبطاقة المستوى
function LevelCard({ level, count, total, color, icon }) {
  const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : 0;

  return (
    <div className="level-card">
      <div className="level-icon">{icon}</div>
      <div className="level-info">
        <div className="level-name">{level}</div>
        <div className="level-count">{count} جملة</div>
        <div className="level-bar">
          <div
            className="level-fill"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
        <div className="level-percentage">{percentage}%</div>
      </div>
    </div>
  );
}

// Component للاقتراح
function SuggestionCard({ type, icon, message, action, onAction }) {
  return (
    <div className={`suggestion-card ${type}`}>
      <span className="suggestion-icon">{icon}</span>
      <div className="suggestion-content">
        <p className="suggestion-message">{message}</p>
        {action && (
          <button 
            className="suggestion-action"
            onClick={onAction}
          >
            {action}
          </button>
        )}
      </div>
    </div>
  );
}

// Component للإنجاز
function Achievement({ icon, title, description, achieved }) {
  return (
    <div className={`achievement ${achieved ? 'achieved' : 'locked'}`}>
      <div className="achievement-icon">{icon}</div>
      <div className="achievement-info">
        <div className="achievement-title">{title}</div>
        <div className="achievement-description">{description}</div>
      </div>
      {achieved && <CheckCircle className="achievement-check" size={20} />}
    </div>
  );
}
