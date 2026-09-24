export function Loader({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-mist-400">
      <div className="w-8 h-8 rounded-full border-2 border-ink-600 border-t-accent animate-spin" />
      <span className="text-sm font-mono">{label}</span>
    </div>
  );
}

export function EmptyState({ title = "Nothing here", message = "No results found." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
      <div className="w-12 h-12 rounded-full bg-ink-800 border border-ink-600 flex items-center justify-center text-mist-400 text-xl">
        ∅
      </div>
      <p className="text-mist-200 font-medium">{title}</p>
      <p className="text-sm text-mist-400">{message}</p>
    </div>
  );
}

export function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
      <div className="w-12 h-12 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center text-danger text-xl">
        !
      </div>
      <p className="text-mist-200 font-medium">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-1">
          Retry
        </button>
      )}
    </div>
  );
}
