export default function WaitingIndicator() {
  return (
    <div className="flex gap-1.5 items-center justify-center">
      {/* Punto 1 */}
      <span className="w-3 h-3 bg-white border border-black shadow-[1px_1px_0px_#000] animate-bounce [animation-delay:-0.3s]" />
      {/* Punto 2 */}
      <span className="w-3 h-3 bg-white border border-black shadow-[1px_1px_0px_#000] animate-bounce [animation-delay:-0.15s]" />
      {/* Punto 3 */}
      <span className="w-3 h-3 bg-white border border-black shadow-[1px_1px_0px_#000] animate-bounce" />
    </div>
  );
}