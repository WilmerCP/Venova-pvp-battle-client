import { useEffect, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';

import PokemonData from './components/PokemonData.jsx';
import ComboBox from './components/ComboBox';
import { getMiniSrc, getGenderFromRatio } from './helpers';
import BlockyButton from './components/BlockyButton';
import Toast from './components/Toast';

const EMPTY_SLOT = {
    num: null,
    species: '',
    gender: 'M',
    ability: '',
    item: '',
    evs: { "hp": 0, "atk": 0, "def": 0, "spa": 0, "spd": 0, "spe": 0 },
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
        femaleIcon: getMiniSrc(v.num, { femaleSprite: v.num == 55 ? true : false }),
    }));


    // Estado del equipo completo: 6 slots, cada uno con su configuración
    const [team, setTeam] = useState(
        Array.from({ length: 6 }, () => ({ ...EMPTY_SLOT }))
    );

    while (team.length < 6) {
        team.push(EMPTY_SLOT)
    }

    const team_empty = team.every((value) => value.num === null);

    const [msg, setMsg] = useState(null); //Toast Component

    const handleStartBattle = async () => {

        const team_empty = team.every((value) => value.num === null);

        if (team_empty) {

            setMsg("¡Necesitas un equipo para combatir!");

        } else {

            let result = await window.electronAPI.setSelectedTeam(team);

            if (result.success) {

                navigate('/battle');

            } else {

                setMsg(result.message);

            }

        }


    }


    const handleImportTeam = async () => {


        let importedTeam = await window.electronAPI.importTeam();

        if (importedTeam) {

            let result = await window.electronAPI.setSelectedTeam(importedTeam);
            if (result.success) {

                setTeam(importedTeam);
                setMsg("Importación exitosa");

            }else{

                setMsg(result.message);

            }

        }else{

            setMsg("No se pudo importar el equipo. Asegúrate de tener un equipo guardado en Venova Reforged.");

        }

    }

    useEffect(() => {

        async function getTeam() {

            const prevTeam = await window.electronAPI.getSelectedTeam();

            if (prevTeam !== null) {

                setTeam(prevTeam);

                console.log("Team cargado desde el main process:", prevTeam);

            }

        }

        getTeam();


    }, [])

    return (
        <div className="min-h-screen p-6 isometric-background pb-20">
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
                Mi equipo
            </h1>

            {team_empty &&

                <div
                    className="py-10 px-3 rounded-xl font-bold text-white
                                flex flex-col gap-2 items-center justify-center
                                bg-black/[0.40] border-2 border-dashed border-white/60
                                max-w-[600px] m-auto"
                >
                    ¡Importa tu equipo de Venova Reforged para jugar!
                </div>

            }

            {!team_empty &&

                <div className="grid grid-cols-2 gap-4 p-4 max-w-3xl mx-auto">
                    {team.map((slot, slotIndex) => {
                        const pokemon = venomonWithIcons.find((v) => v.num === slot.num);

                        if (pokemon) {
                            return (
                                <PokemonData
                                    pokemon={pokemon}
                                    build={team[slotIndex]}
                                    key={slotIndex}
                                />

                            );
                        } else {

                            return (<div
                                className="
        py-3 px-3 rounded-xl font-bold text-gray-400
        flex flex-col gap-2 items-center justify-center
        bg-black/[0.02] border-2 border-dashed border-black/15"
                                key={slotIndex}
                            >
                                -- Slot {slotIndex} --
                            </div>)

                        }
                    })}
                </div>
            }

            {/* Acciones: volver o iniciar combate con el equipo armado */}
            <div className="flex justify-center gap-3 mt-6 max-w-3xl mx-auto">
                <BlockyButton
                    onClick={() => { navigate('/'); }}
                    color="#dd8c21"
                >
                    Volver
                </BlockyButton>

                <BlockyButton
                    onClick={() => { handleStartBattle() }}
                    color="#e43926"
                >
                    Iniciar combate
                </BlockyButton>

                <BlockyButton
                    onClick={() => { handleImportTeam() }}
                    color="#4d9722"
                >
                    Importar equipo
                </BlockyButton>
            </div>
            <Toast show={msg !== null} onClose={() => setMsg(null)} message={msg} />
        </div >
    );
}