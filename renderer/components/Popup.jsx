import { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import { IoWarning } from "react-icons/io5";

export default function ConfirmDialog({
  open = true,
  title = "¿Confirmar acción?",
  description = "Esta acción no se puede deshacer.",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger", // "danger" | "default"
  onConfirm = () => {},
  onCancel = () => {},
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="w-full max-w-sm rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-start gap-3 p-5 pb-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              isDanger ? "bg-red-100" : "bg-slate-100"
            }`}
          >
            <IoWarning
              size={18}
              className={isDanger ? "text-red-600" : "text-slate-600"}
            />
          </div>

          <div className="flex-1 pt-0.5">
            <h2
              id="confirm-dialog-title"
              className="text-base font-semibold text-slate-900"
            >
              {title}
            </h2>
            <p
              id="confirm-dialog-description"
              className="mt-1 text-sm text-slate-500"
            >
              {description}
            </p>
          </div>

          <button
            onClick={onCancel}
            aria-label="Cerrar"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <FiX size={16} />
          </button>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 p-4">
          <button
            onClick={onCancel}
            className="rounded-md px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`bg-red-600 hover:bg-red-500 active:translate-y-[0.5] active:-translate-x-[0.5] active:border-1
                   text-white font-bold text-md py-2 px-3 rounded-sm
                   border-l-[3px] border-b-[3px] border-t-[1px] border-r-[1px] border-red-900
                   transition-all duration-100 ${
              isDanger
                ? "bg-red-600 hover:bg-red-500 border-red-900"
                : "bg-slate-900 hover:bg-slate-800 border-slate-900"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}