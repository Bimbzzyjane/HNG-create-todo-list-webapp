import Icon from './Icons.jsx';

/**
 * Button.
 *
 * Variants: primary | secondary | ghost | danger | success
 * Sizes:    sm | md
 * Passing an icon without children produces a square icon button, which still
 * requires an `aria-label` so screen readers know what it does.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  type = 'button',
  className = '',
  loading = false,
  disabled = false,
  ...rest
}) {
  const iconOnly = !children;
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    iconOnly ? 'btn--icon-only' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="spinner spinner--sm" aria-hidden="true" /> : null}
      {icon ? <Icon name={icon} size={size === 'sm' ? 16 : 18} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={size === 'sm' ? 16 : 18} /> : null}
    </button>
  );
}
