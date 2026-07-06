import { useEffect, useState } from 'react';

const DEFAULT_ICON = 'minis/icon000.png';

export default function PokemonButton({ pokemon, onClick }) {

  const [iconSrc, setIconSrc] = useState(pokemon.icon);

  useEffect(() => {
    setIconSrc(pokemon.icon);
    const img = new Image();
    img.src = pokemon.icon;
    img.onerror = () => setIconSrc(DEFAULT_ICON);
  }, [pokemon.icon]);

  const hpPercent = pokemon.maxHp !== 0 ? Math.max(0, Math.min(100, (pokemon.currentHp / pokemon.maxHp) * 100)) : 0;
  const hpColor = hpPercent > 50 ? '#4ade80' : hpPercent > 20 ? '#facc15' : '#f87171';

  return (
    <button
      onClick={onClick}
      className="hover:brightness-110 active:translate-y-1 active:border-b-2
                py-1.5 px-3 rounded-xl
                transition-all duration-100
                flex flex-row items-center justify-start gap-2
                bg-white/90 border border-black/10"
      style={{
        borderBottom: `3px solid rgba(0, 0, 0, 0.4)`,
        boxShadow: 'inset 1px 1px 0px rgba(255,255,255,0.2)',
      }}
    >
      <div
        className="mini-icon pointer-events-none select-none shrink-0"
        style={{
          backgroundImage: `url("${iconSrc}")`
        }}
      >
      </div>

      <div className="flex flex-col items-start flex-1 min-w-0 gap-0.5">
        <div className="flex flex-col items-start flex-1 min-w-0">
          <span className="text-xs font-medium truncate text-left">
            {pokemon.name}
          </span>
          <div className="flex flex-row gap-0.5">
            <span className="text-[10px] font-semibold text-black/60 shrink-0">
            Nv. {pokemon.level}
          </span>
          <div className={`status-selection status-${pokemon.status}-selection`}></div>
          </div>
        </div>

        <div className="w-full h-1.5 rounded-full bg-black/15 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${hpPercent}%`,
              backgroundColor: hpColor,
            }}
          />
        </div>
      </div>
    </button>
  );
}