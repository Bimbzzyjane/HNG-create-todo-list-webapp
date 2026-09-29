/**
 * Loading skeleton shown while a list is fetched for the first time.
 * Marked `aria-hidden` because the page already announces "Loading..." via a
 * live region, so screen readers should not read the placeholders.
 */
export function SkeletonList({ count = 3 }) {
  return (
    <div className="stack stack--sm" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div className="skeleton-card" key={index}>
          <span className="skeleton-card__dot" />
          <span className="skeleton-card__line" />
        </div>
      ))}
    </div>
  );
}
