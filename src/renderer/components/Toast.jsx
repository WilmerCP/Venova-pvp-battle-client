import { useEffect, useState } from "react";
import { FiCheckCircle, FiX, FiClipboard } from "react-icons/fi";
import { IoWarning } from "react-icons/io5";
 
/**
 * Toast de notificación tipo "snackbar": aparece abajo, centrado,
 * y se oculta solo después de `duration` ms.
 *
 * Uso:
 *   const [show, setShow] = useState(false);
 *   ...
 *   onImportSuccess={() => setShow(true)}
 *   <Toast show={show} onClose={() => setShow(false)} message="Importación exitosa" />
 */
export default function Toast({
  show,
  onClose,
  message = "Importación exitosa",
  duration = 3000,
  type = 'success'
}) {
  const [visible, setVisible] = useState(false);
 
  useEffect(() => {
    if (!show) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      // pequeño delay para que la animación de salida termine antes de desmontar
      setTimeout(() => onClose?.(), 200);
    }, duration);
    return () => clearTimeout(timer);
  }, [show, duration, onClose]);
 
  if (!show) return null;

  let icon;

  switch(type){

    case 'success':
      icon = <FiCheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />;
      break;

    case 'warning':
      icon = <IoWarning className="w-5 h-5 text-orange-400 shrink-0" />;
      break;

    case 'copy':
      icon = <FiClipboard className="w-5 h-5 text-yellow-400 shrink-0" />;

    default:

  }
 
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto flex items-center gap-2 rounded-lg bg-neutral-900 text-white px-4 py-3 shadow-lg transition-all duration-200 ease-out
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      >
        {icon}
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(() => onClose?.(), 200);
          }}
          className="ml-2 text-neutral-400 hover:text-white transition-colors"
          aria-label="Cerrar notificación"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}