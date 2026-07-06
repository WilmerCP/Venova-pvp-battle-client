import { TiArrowBack } from "react-icons/ti";
import PokemonButton from './PokemonButton.jsx';

export default function PokeSelection({ onSelectPokemon, onBack, availablePokemon, forced }) {
    return (
        <div className="flex flex-row h-full gap-2 p-2">
            <div className="flex flex-col items-center justify-center gap-2 w-24 shrink-0">
                <span className="text-xs font-semibold text-center leading-tight text-black/70">
                    ¿A qué Venomon quieres cambiar?
                </span>
                {!forced && (
                    <button
                        onClick={onBack}
                        className="flex items-center justify-center w-10 h-10 rounded-xl
                              bg-red-500 hover:bg-red-400 active:translate-y-0.5
                              border-b-4 border-red-700 active:border-b-2
                              shadow-sm transition-all duration-100"
                    >
                        <TiArrowBack className="w-6 h-6 text-white" />
                    </button>
                )}
            </div>
            <div className="grid grid-cols-3 gap-2 flex-1 min-w-0 min-h-0 overflow-y-auto content-start">
                {availablePokemon.map((pokemon) => (
                    <PokemonButton
                        key={`icon-${pokemon.num}`}
                        pokemon={pokemon}
                        onClick={() => onSelectPokemon(pokemon)}
                    />
                ))}
            </div>
        </div>
    )
}