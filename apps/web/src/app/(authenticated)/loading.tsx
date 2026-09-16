export default function AuthenticatedLoading() {
  return (
    <div className="fpm-route-loading" aria-busy="true" aria-live="polite">
      <span className="visually-hidden">Loading page…</span>
      <div className="fpm-skeleton fpm-skeleton--title" />
      <div className="fpm-skeleton fpm-skeleton--subtitle" />
      <div className="fpm-skeleton-grid">
        <div className="fpm-skeleton fpm-skeleton--card" />
        <div className="fpm-skeleton fpm-skeleton--card" />
        <div className="fpm-skeleton fpm-skeleton--card" />
        <div className="fpm-skeleton fpm-skeleton--card" />
      </div>
      <div className="fpm-skeleton fpm-skeleton--table" />
    </div>
  );
}
