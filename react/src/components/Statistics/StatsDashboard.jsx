import React, { useMemo } from 'react';
import { calculateStats, getDueSentences, getSmartSuggestions, predictMastery } from '../../utils/srs';
import { TrendingUp, Target, Award, Calendar, Clock, Zap, BookOpen, CheckCircle } from 'lucide-react';
import './StatsDashboard.css';

export default function StatsDashboard({ sentences, onStartReview }) {
  const stats = useMemo(() => calculateStats(sentences), [sentences]);
  const dueSentences = useMemo(() => getDueSentences(sentences), [sentences]);
  const suggestions = useMemo(() => getSmartSuggestions(stats), [stats]);
  const prediction = useMemo(() => predictMastery(sentences), [sentences]);

  const streak = 7; // TODO: fetch from localStorage or backend

  return (
    <div className="stats-dashboard">
      {/* Header */}
      <div className="stats-header">
        <h1 className="stats-title">📊 Ihre Statistiken</h1>
        <p className="stats-subtitle">Verfolgen Sie Ihren Fortschritt beim Deutschlernen</p>
      </div>

      {/* Main stat cards */}
      <div className="stats-grid">
        <StatCard
          icon={<BookOpen size={32} />}
          title="Sätze gesamt"
          value={stats.total}
          color="#3b82f6"
          subtitle="Hinzugefügte Sätze"
        />
        <StatCard
          icon={<Clock size={32} />}
          title="Heutige Wiederholungen"
          value={stats.due}
          color="#f59e0b"
          subtitle="Sätze warten auf Wiederholung"
          highlight={stats.due > 0}
        />
        <StatCard
          icon={<TrendingUp size={32} />}
          title="Aktives Lernen"
          value={`${stats.masteryPercentage}%`}
          color="#10b981"
          subtitle="Sätze in Bearbeitung"
        />
        <StatCard
          icon={<Zap size={32} />}
          title="Streak"
          value={streak}
          color="#ec4899"
          subtitle="Tage in Folge 🔥"
        />
      </div>

      {/* Progress bar */}
      <div className="progress-section">
        <h2 className="section-title">📈 Gesamtfortschritt</h2>
        <ProgressBar
          new={stats.new}
          hard={stats.hard}
          good={stats.good}
          excellent={stats.excellent}
          mastered={stats.mastered}
          total={stats.total}
        />
      </div>

      {/* Level details */}
      <div className="levels-grid">
        <LevelCard level="Neu"        count={stats.new}      total={stats.total} color="#ef4444" icon="🆕" />
        <LevelCard level="Schwer"     count={stats.hard}     total={stats.total} color="#f97316" icon="😅" />
        <LevelCard level="Gut"        count={stats.good}     total={stats.total} color="#eab308" icon="👍" />
        <LevelCard level="Sehr gut"   count={stats.excellent} total={stats.total} color="#10b981" icon="⭐" />
        <LevelCard level="Beherrscht" count={stats.mastered} total={stats.total} color="#6366f1" icon="🏆" />
      </div>

      {/* Predictions */}
      <div className="prediction-section">
        <h2 className="section-title">🔮 Prognose</h2>
        <div className="prediction-card">
          <div className="prediction-item">
            <Calendar size={24} />
            <div>
              <div className="prediction-label">Vollständige Beherrschung</div>
              <div className="prediction-value">
                {prediction.daysNeeded} Tage ({prediction.weeksNeeded} Wochen ca.)
              </div>
            </div>
          </div>
          <div className="prediction-item">
            <Target size={24} />
            <div>
              <div className="prediction-label">Voraussichtliches Datum</div>
              <div className="prediction-value">
                {prediction.estimatedDate.toLocaleDateString('de-DE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
        <p className="prediction-note">* Basierend auf 15 Wiederholungen pro Tag</p>
      </div>

      {/* Smart suggestions */}
      <div className="suggestions-section">
        <h2 className="section-title">💡 Intelligente Vorschläge</h2>
        <div className="suggestions-list">
          {suggestions.map((suggestion, index) => {
            const isReviewAction =
              suggestion.action === 'راجع الآن' ||
              suggestion.action === 'ابدأ المراجعة الآن' ||
              suggestion.action === 'Jetzt wiederholen' ||
              suggestion.action === 'Wiederholung starten';
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

      {/* Achievements */}
      <div className="achievements-section">
        <h2 className="section-title">🏆 Erfolge</h2>
        <div className="achievements-grid">
          <Achievement icon="🎯" title="Starker Start"      description="10 Sätze hinzufügen"    achieved={stats.total >= 10} />
          <Achievement icon="📚" title="Aktiver Lerner"     description="50 Sätze hinzufügen"    achieved={stats.total >= 50} />
          <Achievement icon="⭐" title="Meisterstern"       description="25 Sätze beherrschen"   achieved={stats.mastered >= 25} />
          <Achievement icon="🔥" title="Streak Master"      description="7 Tage in Folge"        achieved={streak >= 7} />
          <Achievement icon="💯" title="Volle Beherrschung" description="100% Fortschritt"       achieved={stats.masteryPercentage >= 100} />
          <Achievement icon="👑" title="Legende"            description="100 Sätze beherrschen"  achieved={stats.mastered >= 100} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, subtitle, highlight }) {
  return (
    <div className={`stat-card ${highlight ? 'highlight' : ''}`} style={{ '--color': color }}>
      <div className="stat-icon" style={{ color }}>{icon}</div>
      <div className="stat-content">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-subtitle">{subtitle}</div>
      </div>
    </div>
  );
}

function ProgressBar({ new: newCount, hard, good, excellent, mastered, total }) {
  const getPercentage = (count) => total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div className="progress-segment new"       style={{ width: `${getPercentage(newCount)}%` }}  title={`Neu: ${newCount}`} />
        <div className="progress-segment hard"      style={{ width: `${getPercentage(hard)}%` }}      title={`Schwer: ${hard}`} />
        <div className="progress-segment good"      style={{ width: `${getPercentage(good)}%` }}      title={`Gut: ${good}`} />
        <div className="progress-segment excellent" style={{ width: `${getPercentage(excellent)}%` }} title={`Sehr gut: ${excellent}`} />
        <div className="progress-segment mastered"  style={{ width: `${getPercentage(mastered)}%` }}  title={`Beherrscht: ${mastered}`} />
      </div>
      <div className="progress-legend">
        <span className="legend-item"><span className="legend-dot new"></span> Neu ({newCount})</span>
        <span className="legend-item"><span className="legend-dot hard"></span> Schwer ({hard})</span>
        <span className="legend-item"><span className="legend-dot good"></span> Gut ({good})</span>
        <span className="legend-item"><span className="legend-dot excellent"></span> Sehr gut ({excellent})</span>
        <span className="legend-item"><span className="legend-dot mastered"></span> Beherrscht ({mastered})</span>
      </div>
    </div>
  );
}

function LevelCard({ level, count, total, color, icon }) {
  const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : 0;

  return (
    <div className="level-card">
      <div className="level-icon">{icon}</div>
      <div className="level-info">
        <div className="level-name">{level}</div>
        <div className="level-count">{count} Satz/Sätze</div>
        <div className="level-bar">
          <div className="level-fill" style={{ width: `${percentage}%`, backgroundColor: color }} />
        </div>
        <div className="level-percentage">{percentage}%</div>
      </div>
    </div>
  );
}

function SuggestionCard({ type, icon, message, action, onAction }) {
  return (
    <div className={`suggestion-card ${type}`}>
      <span className="suggestion-icon">{icon}</span>
      <div className="suggestion-content">
        <p className="suggestion-message">{message}</p>
        {action && (
          <button className="suggestion-action" onClick={onAction}>{action}</button>
        )}
      </div>
    </div>
  );
}

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
