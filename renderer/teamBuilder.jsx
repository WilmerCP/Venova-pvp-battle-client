import { useEffect, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';

import PokemonEditor from './components/PokemonEditor';
import ComboBox from './components/ComboBox';
import { getMiniSrc, getGenderFromRatio } from './helpers';


const EMPTY_SLOT = {
    num: null,
    species: '',
    gender: 'M',
    ability: '',
    item: '',
    evs: {"hp": 0, "atk": 0, "def": 0, "spa": 0, "spd": 0, "spe": 0},
    nature: '',
    moves: ['', '', '', ''],
    shiny: false,
    level: 100,
};

export default function TeamBuilder() {
    const dexData = useLoaderData();

    const navigate = useNavigate();

    // Array con los pokemon disponibles + su icono, sin mutar dexData
    const venomonWithIcons = dexData.venomon.map((v) => ({
        ...v,
        icon: getMiniSrc(v.num),
    }));

    // Opciones para el ComboBox de selección de especie
    const speciesOptions = venomonWithIcons.map((v) => ({
        value: v.num,
        label: v.name,
    }));

    // Estado del equipo completo: 6 slots, cada uno con su configuración
    const [team, setTeam] = useState(
        Array.from({ length: 6 }, () => ({ ...EMPTY_SLOT }))
    );

    // Actualiza un campo específico de un slot puntual
    const updateSlot = (slotIndex, changes) => {
        setTeam((prev) => {
            const next = [...prev];
            next[slotIndex] = { ...next[slotIndex], ...changes };

            //console.log(next[slotIndex])
            return next;
        });
    };

    const handleSpeciesSelect = (slotIndex, num) => {
        // Al cambiar de especie, resetea el resto de la configuración de ese slot

       let species = venomonWithIcons.find((v) => v.num === num);

        let gender = getGenderFromRatio(species.genderRatio);

        setTeam((prev) => {
            const next = [...prev];
            next[slotIndex] = { ...EMPTY_SLOT, num, gender, species: species.name };
            return next;
        });
    };

    const handleStartBattle = async ()=>{


        let result = await window.electronAPI.setSelectedTeam(team);

        console.log(result)

        if(result.success){

            navigate('/battle')

        }

    }

    useEffect(()=>{

        async function getTeam() {

            const prevTeam = await window.electronAPI.getSelectedTeam();

            if(prevTeam !== null){

                setTeam(prevTeam);

            }
            
        }

        getTeam();


    },[])

    return (
        <div className="min-h-screen p-6 isometric-background">
            <h1 className="text-center text-4xl font-bold text-white/90 mb-6 tracking-wide font-['Russo_One']"
                style={{
                    textShadow: `
      3px 3px 0 #5a1010,
      -1px -1px 0 #5a1010,
      1px -1px 0 #5a1010,
      -1px 1px 0 #5a1010,
      0 6px 10px rgba(0,0,0,0.4)
    `
                }}
            >
                Team Builder
            </h1>
            <div className="grid grid-cols-2 gap-4 p-4 max-w-3xl mx-auto">
                {team.map((slot, slotIndex) => {
                    const pokemon = venomonWithIcons.find((v) => v.num === slot.num);

                    return (
                        <div key={slotIndex} className="flex flex-col gap-2 rounded-xl p-2
                         bg-white border border-black/10
                         shadow-lg shadow-black/20">
                            {/* Selector de especie para este slot */}
                            <ComboBox
                                options={speciesOptions}
                                value={slot.num}
                                onChange={(num) => handleSpeciesSelect(slotIndex, num)}
                                placeholder={`-- Slot ${slotIndex + 1}: elegir venomon --`}
                            />

                            {/* Solo mostramos el editor si ya se eligió un pokemon en este slot */}
                            {pokemon && (
                                <PokemonEditor
                                    pokemon={pokemon}
                                    build={team[slotIndex]}
                                    onChange={(changes) => updateSlot(slotIndex, { ...changes })}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            {/* Acciones: volver o iniciar combate con el equipo armado */}
            <div className="flex justify-center gap-3 mt-6 max-w-3xl mx-auto">
                <button
                    onClick={() => { navigate('/'); }}
                    className="px-4 py-2 rounded-lg text-sm font-medium
                     bg-white text-black border border-white/20
                     hover:bg-white transition-colors duration-150"
                >
                    Volver
                </button>

                <button
                    onClick={() => { handleStartBattle() }}
                    className="px-4 py-2 rounded-lg text-sm font-medium
                     bg-emerald-500 text-white
                     hover:bg-emerald-400 transition-colors duration-150
                     shadow-md shadow-emerald-500/30"
                >
                    Iniciar combate
                </button>
            </div>
        </div >
    );
}