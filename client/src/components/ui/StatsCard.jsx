import Icon from './Icons.jsx';

/**
 * Dashboard statistic card.
 * `tone` picks the colour of the icon tile: indigo | amber | green | sky | rose.
 */
export default function StatsCard({ label, value, hint, icon = 'dashboard', tone = 'indigo', loading = false }) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <span className="stat-card__icon" aria-hidden="true">
        <Icon name={icon} size={20} />
      </span>
      <div className="stat-card__body">
        <p className="stat-card__label">{label}</p>
        {loading ? (
          <span className="stat-card__skeleton" aria-hidden="true" />
        ) : (
          <p className="stat-card__value">
            <span className="visually-hidden">{`${label}: `}</span>
            {value}
          </p>
        )}
        {hint ? <p className="stat-card__hint">{hint}</p> : null}
      </div>
    </article>
  );
}
