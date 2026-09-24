"use client";

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, busy }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative card p-6 w-full max-w-sm">
        <h3 className="text-mist-100 font-semibold mb-2">{title}</h3>
        <p className="text-sm text-mist-400 mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="btn-secondary" disabled={busy}>
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-danger" disabled={busy}>
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
