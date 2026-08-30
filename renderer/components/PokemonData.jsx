import { useEffect, useState } from 'react';
import { useLoaderData } from 'react-router-dom';

import { CgGenderMale, CgGenderFemale } from "react-icons/cg";
import { MdStar } from "react-icons/md";

const DEFAULT_ICON = 'minis/icon000.png';

const statList = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

export default function PokemonDisplay({
    pokemon,
    build
}) {
    const { moves, items, abilities, natures } = useLoaderData();

    const GenderSymbol = build.gender == 'M' ? CgGenderMale : build.gender == 'F' ? CgGenderFemale : null;
    const genderClass = build.gender == 'M' ? 'male' : build.gender == 'F' ? 'female' : '';

    const [iconSrc, setIconSrc] = useState(pokemon.icon);

    useEffect(() => {

        const img = new Image();

        if (pokemon.num == 55 && build.gender == 'F') {

            setIconSrc(pokemon.femaleIcon);
            img.src = pokemon.femaleIcon;

        } else {

            setIconSrc(pokemon.icon);
            img.src = pokemon.icon;
        }

        img.onerror = () => setIconSrc(DEFAULT_ICON);
    }, [pokemon.icon]);

    const abilityLabel = abilities[build.ability]?.translation ?? build.ability;
    const itemLabel = items[build.item]?.translation ?? build.item;
    const natureLabel = natures[build.nature.toLowerCase()].translation;

    const moveLabels = (build.moves || []).map((moveName) => {
        if (!moveName) return '';

        return moves[moveName]?.translation ?? moveName;
    });

    return (
        <div
            className="
                py-3 px-3 rounded-xl
                flex flex-col gap-2
                bg-white border border-black/10"
            style={{
                boxShadow: 'inset 1px 1px 0px rgba(255,255,255,0.2)',
            }}
        >
            {/* Fila superior: ícono, nombre + nivel, y shiny */}
            <div className="flex flex-row items-center gap-2">

                <div
                    className="mini-icon pointer-events-none select-none "
                    style={{
                        backgroundImage: `url("${iconSrc}")`,
                    }}
                />

                <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-xs font-medium truncate text-left flex flex-row items-center">
                        {pokemon.name}
                        {GenderSymbol && <GenderSymbol className={`${genderClass} text-lg`} />}
                    </span>
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] font-semibold text-black/60">Nv.</span>
                        <span className="text-[10px]">{build.level}</span>
                    </div>
                </div>

                {build.shiny && (
                    <span className="text-[10px] font-semibold text-black/60 shrink-0 flex flex-row items-center gap-1">
                        <MdStar className='text-red-500' /> Shiny
                    </span>
                )}
            </div>

            {/* EVs */}
            <div className="flex flex-row flex-wrap gap-2 items-center justify-center">
                {
                    statList.map((stat) => (
                        <div key={stat} className="flex flex-col items-center gap-0.5">
                            <span className="text-[10px] font-semibold text-black/60">{stat.toUpperCase()}</span>
                            <span className="text-[10px]">{build.evs[stat]}</span>
                        </div>
                    ))
                }
            </div>

            {/* Naturaleza, habilidad, item y movimientos */}
            <div className="flex flex-col gap-1 text-xs">

                <div className="flex justify-between">
                    <span className="font-semibold text-black/60">Naturaleza:</span>
                    <span>{natureLabel || '—'}</span>
                </div>

                <div className="flex justify-between">
                    <span className="font-semibold text-black/60">Habilidad:</span>
                    <span>{abilityLabel || '—'}</span>
                </div>

                <div className="flex justify-between">
                    <span className="font-semibold text-black/60">Objeto:</span>
                    <span>{itemLabel || '—'}</span>
                </div>

                <div className="grid grid-cols-2 gap-1 mt-1">
                    {[0, 1, 2, 3].map((slot) => (
                        <span
                            key={slot}
                            className="text-[11px] rounded-md border border-black/10 px-1 py-0.5 truncate"
                        >
                            {moveLabels[slot] || '—'}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}