import { useEffect, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import ComboBox from './ComboBox';

const DEFAULT_ICON = 'minis/icon000.png';
const DEFAULT_LEVEL = 100;

export default function PokemonEditor({
    pokemon,
    onClick,
    onAbilityChange,
    onMoveChange,
    onShinyChange,
    onItemChange,
    onLevelChange,
}) {
    const { moves, items, abilities } = useLoaderData();

    const itemOptions = Object.entries(items).map(([name, item]) => ({
        value: name,
        label: item.translation ?? name,
    }));

    const [iconSrc, setIconSrc] = useState(pokemon.icon);
    const [selectedAbility, setSelectedAbility] = useState('');
    const [selectedMoves, setSelectedMoves] = useState(['', '', '', '']);
    const [selectedItem, setSelectedItem] = useState('');
    const [level, setLevel] = useState(DEFAULT_LEVEL);
    const [shiny, setShiny] = useState(false);

    useEffect(() => {
        setIconSrc(pokemon.icon);
        const img = new Image();
        img.src = pokemon.icon;
        img.onerror = () => setIconSrc(DEFAULT_ICON);
    }, [pokemon.icon]);

    const handleAbilityChange = (value) => {
        setSelectedAbility(value);
        onAbilityChange?.(value);
    };

    const handleMoveChange = (slot, value) => {
        setSelectedMoves((prev) => {
            const next = [...prev];
            next[slot] = value;
            return next;
        });
        onMoveChange?.(slot, value);
    };

    const handleShinyChange = (checked) => {
        setShiny(checked);
        onShinyChange?.(checked);
    };

    const handleItemChange = (value) => {
        setSelectedItem(value);
        onItemChange?.(value);
    };

    const handleLevelChange = (value) => {
        const parsed = Math.max(1, Math.min(100, Number(value) || 1));
        setLevel(parsed);
        onLevelChange?.(parsed);
    };

    // Movimientos que este pokemon puede aprender según su learnset,
    // resueltos contra el diccionario completo de moves del loader
    const learnableMoves = Object.keys(pokemon.learnset)
        .map((moveId) => moves[moveId])
        .filter(Boolean);

    return (
        <div
            onClick={onClick}
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
                    <span className="text-xs font-medium truncate text-left">
                        {pokemon.name}
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
                            value={level}
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
                        checked={shiny}
                        onChange={(e) => handleShinyChange(e.target.checked)}
                    />
                    <span className="text-[10px] font-semibold text-black/60">Shiny</span>
                </label>
            </div>

            {/* Selectores de configuración: habilidad, item y movimientos */}
            <div
                className="flex flex-col gap-1"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Habilidad: opciones limitadas a las que puede tener este pokemon */}
                <select
                    className="text-xs rounded-md border border-black/10 px-1 py-0.5"
                    value={selectedAbility}
                    onChange={(e) => handleAbilityChange(e.target.value)}
                >
                    <option value="" disabled>Habilidad</option>
                    {Object.entries(pokemon.abilities).map(([slot, name]) => (
                        <option key={slot} value={name}>
                            {abilities[name]?.translation ?? name}
                        </option>
                    ))}
                </select>

                {/* Item: combobox con traducciones */}
                <ComboBox
                    options={itemOptions}
                    value={selectedItem}
                    onChange={handleItemChange}
                    placeholder="-- Objeto --"
                />

                {/* 4 slots de movimientos, cada uno con las opciones del learnset */}
                <div className="grid grid-cols-2 gap-1">
                    {[0, 1, 2, 3].map((slot) => (
                        <select
                            key={slot}
                            className="text-xs rounded-md border border-black/10 px-1 py-0.5"
                            value={selectedMoves[slot]}
                            onChange={(e) => handleMoveChange(slot, e.target.value)}
                        >
                            <option value="">-- Movimiento --</option>
                            {learnableMoves.map((m) => (
                                <option key={m.id ?? m.name} value={m.name}>{m.translation}</option>
                            ))}
                        </select>
                    ))}
                </div>
            </div>
        </div>
    );
}