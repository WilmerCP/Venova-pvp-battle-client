import POKEMON_TYPES from '../lib/tipos.js';

export default function MoveButton({ name, type, ppCurrent, ppMax, disabled, onSelectMove, id }) {
  const config = POKEMON_TYPES[type] || POKEMON_TYPES.Normal;

  return (
    <button
      onClick={() => {

        onSelectMove(id, disabled)

      }}

      // 'relative' y 'overflow-hidden' para que la marca de agua se quede dentro del botón
      className="relative overflow-hidden hover:brightness-110 active:translate-y-1 active:border-b-2
                 text-white font-bold py-3 px-4 rounded-xl
                 transition-all duration-100
                 flex flex-col items-start justify-center w-full h-[64px]"
      style={{
        backgroundColor: disabled ? '#cccccc' : config.color,
        borderBottom: `6px solid rgba(0, 0, 0, 0.4)`,
        boxShadow: 'inset 1px 1px 0px rgba(255,255,255,0.2)',
      }}
    >
      {/* Icono SVG como Marca de Agua de Fondo (a la izquierda) */}
      {config.image && (
        <img
          src={config.image}
          alt={config.name}
          className="absolute left-2 w-10 h-10 object-contain opacity-25 pointer-events-none select-none"
          style={{ imageRendering: 'pixelated' }}
        />
      )}

      {/* Textos del movimiento alineados sobre el fondo */}
      <div className="relative z-10 flex flex-col items-start text-left tracking-wide ml-2">
        <span className="text-sm md:text-base leading-tight drop-shadow-[1px_1px_0px_rgba(0,0,0,0.6)]">
          {name}
        </span>
        {ppCurrent !== undefined && ppMax !== undefined && (
          <span className="text-[10px] md:text-xs font-semibold opacity-90 mt-0.5 drop-shadow-[1px_1px_0px_rgba(0,0,0,0.5)]">
            PP {ppCurrent}/{ppMax}
          </span>
        )}
      </div>
    </button>
  );
}