import { useEffect, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import ComboBox from './ComboBox';

import { CgGenderMale, CgGenderFemale } from "react-icons/cg";

const DEFAULT_ICON = 'minis/icon000.png';
const DEFAULT_LEVEL = 100;

const statList = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

export default function PokemonEditor({
    pokemon,
    build,
    onChange
}) {
    const { moves, items, abilities, natures } = useLoaderData();

    console.log("PokemonEditor renderizado con build:", build);
    //console.log("PokemonEditor renderizado con pokemon:", pokemon);

    const GenderSymbol = build.gender == 'M' ? CgGenderMale : build.gender == 'F' ? CgGenderFemale : 'div';
    const genderClass = build.gender == 'M' ? 'male' : build.gender == 'F' ? 'female' : '';

    // Movimientos que este pokemon puede aprender según su learnset,
    // resueltos contra el diccionario completo de moves del loader
    const learnableMoves = Object.keys(pokemon.learnset)
        .map((moveId) => moves[moveId])
        .filter(Boolean);

    const itemOptions = Object.entries(items).map(([name, item]) => ({
        value: name,
        label: item.translation ?? name,
    }));

    const natureOptions = Object.entries(natures).map(([name, nature]) => ({
        value: nature.name,
        label: nature.translation ?? name,
    }));

    const moveOptions = learnableMoves.map((moveData) => ({
        value: moveData.id,
        label: moveData.translation ?? moveData.name,
    }));

    const abilityOptions = Object.entries(pokemon.abilities).map(([slot, name]) => (
        {
            value: name,
            label: abilities[name]?.translation ?? name
        }));

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

    const handleAbilityChange = (value) => {
        onChange({ ability: value });
    };

    const handleMoveChange = (slot, value) => {

        let newMoves = [...build.moves];

        let already = newMoves.findIndex((m) => m === value)

        if (already >= 0) {

            newMoves[already] = '';

        }

        newMoves[slot] = value;

        onChange({ moves: newMoves });
    };

    const handleEvChange = (ev, value) => {

        const parsed = Math.max(0, Math.min(252, Number(value) || 0));

        let newEvs = { ...build.evs };
        newEvs[ev] = parsed;

        const sum = Object.values(newEvs).reduce((acc, v) => acc + v, 0);

        if (sum <= 510 && parsed <= 252) {

            onChange({ evs: newEvs });

        }
    };

    const handleShinyChange = (checked) => {
        onChange({ shiny: checked });
    };

    const handleItemChange = (value) => {
        onChange({ item: value });
    };

    const handleNatureChange = (value) => {
        onChange({ nature: value });
    };

    const handleLevelChange = (value) => {
        const parsed = Math.max(1, Math.min(100, Number(value) || 1));
        onChange({ level: parsed });
    };

    const handleGenderChange = () => {

        if (!pokemon.genderFixed) {
            const newGender = build.gender == 'M' ? 'F' : 'M';

            onChange({ gender: newGender });
        }

    }

    return (
        <div
            className="
                py-1.5 px-3 rounded-xl
                transition-all duration-100
                flex flex-col gap-2
                bg-white border border-black/10 cursor-pointer"
            style={{
                boxShadow: 'inset 1px 1px 0px rgba(255,255,255,0.2)',
            }}
        >
            {/* Fila superior: ícono, nombre + nivel, y checkbox de shiny */}
            <div className="flex flex-row items-center gap-2">

                {/* Ícono del pokemon (con fallback si la imagen no carga) */}
                <div
                    className="mini-icon pointer-events-none select-none shrink-0"
                    style={{
                        backgroundImage: `url("${iconSrc}")`
                    }}
                />

                {/* Nombre de especie (fijo) + selector de nivel (elegido por el usuario) */}
                <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-xs font-medium truncate text-left flex flex-row">
                        {pokemon.name}
                        <GenderSymbol className={`${genderClass} text-lg`} onClick={() => { handleGenderChange() }} />
                    </span>
                    <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span className="text-[10px] font-semibold text-black/60">Nv.</span>
                        <input
                            type="number"
                            min={1}
                            max={100}
                            value={build.level}
                            onChange={(e) => handleLevelChange(e.target.value)}
                            className="w-10 text-[10px] rounded border border-black/10 px-1"
                        />
                    </div>
                </div>

                {/* Checkbox: si el pokemon será shiny */}
                <label
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    <input
                        type="checkbox"
                        checked={!!build.shiny}
                        onChange={(e) => handleShinyChange(e.target.checked)}
                    />
                    <span className="text-[10px] font-semibold text-black/60">Shiny</span>
                </label>
            </div>

            {/* Selectores de puntos de esfuerzo */}
            <div className="flex flex-row flex-wrap gap-2 items-center justify-center" onClick={(e) => e.stopPropagation()}>
                {
                    statList.map((stat) => (
                        <div key={stat} className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-semibold text-black/60">{stat.toUpperCase()}</span>
                            <input
                                type="number"
                                min={0}
                                max={252}
                                value={build.evs[stat]}
                                onChange={(e) => handleEvChange(stat, e.target.value)}
                                className="w-10 text-[10px] rounded border border-black/10 px-1"
                            />
                        </div>
                    ))
                }
            </div>

            {/* Selectores de configuración: naturaleza, habilidad, item y movimientos */}
            <div
                className="flex flex-col gap-1"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Naturaleza: combobox con traducciones */}
                <ComboBox
                    options={natureOptions}
                    value={build.nature}
                    onChange={handleNatureChange}
                    placeholder="-- Naturaleza --"
                />

                {/* Habilidad: opciones limitadas a las que puede tener este pokemon */}

                <ComboBox
                    options={abilityOptions}
                    value={build.ability}
                    onChange={handleAbilityChange}
                    placeholder="-- Habilidad --"
                />

                {/* Item: combobox con traducciones */}
                <ComboBox
                    options={itemOptions}
                    value={build.item}
                    onChange={handleItemChange}
                    placeholder="-- Objeto --"
                />

                {/* 4 slots de movimientos, cada uno con las opciones del learnset */}
                {console.log(build.moves)}
                <div className="grid grid-cols-2 gap-1">
                    {[0, 1, 2, 3].map((slot) => (
                        <ComboBox
                            key={slot}
                            options={moveOptions}
                            value={build.moves[slot]}
                            onChange={(value) => handleMoveChange(slot, value)}
                            placeholder="-- Movimiento --"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}