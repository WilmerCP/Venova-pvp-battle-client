import { useMemo } from "react";
import MENSAJES from "../lib/mensajes";
import BlockyButton from "./BlockyButton";

const TRAINERS = [
    "/trainers/trainer000.png",
    "/trainers/trainer001.png",
    "/trainers/trainer005.png",
    "/trainers/trainer004.png",
    "/trainers/trainer056.png",
    "/trainers/trainer057.png",
    "/trainers/trainer058.png",
    "/trainers/trainer059.png",
    "/trainers/trainer060.png",
    "/trainers/trainer061.png",
    "/trainers/trainer062.png",
    "/trainers/trainer063.png",
    "/trainers/trainer064.png",
    "/trainers/trainer065.png",
    "/trainers/trainer066.png",
    "/trainers/trainer067.png",
    "/trainers/trainer068.png",
    "/trainers/trainer069.png",
    "/trainers/trainer070.png",
    "/trainers/trainer071.png",
];

function getRandomTrainers(count = 2) {
    const shuffled = [...TRAINERS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

export default function PopupEnd({ winner, onClose }) {

    const [trainerLeft, trainerRight] = useMemo(() => getRandomTrainers(2), []);

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm">
            <div className="relative bg-white rounded p-6 pt-8 w-80 shadow-2xl border-4 border-gray-800">

                {/* Sprite del entrenador, parado en la esquina */}
                <img
                    src={trainerLeft}
                    alt="Entrenador ganador"
                    className="absolute -bottom-15 -right-20 w-36 h-36 object-contain"
                    style={{ imageRendering: "pixelated" }}
                />

                <img
                    src={trainerRight}
                    alt="Entrenador ganador"
                    className="absolute -top-18 -left-20 w-36 h-36 object-contain scale-x-[-1]"
                    style={{ imageRendering: "pixelated" }}
                />

                <h2 className="text-2xl font-extrabold mb-2 text-center text-gray-800">
                    ¡Batalla Finalizada!
                </h2>

                <p className="text-lg text-center text-gray-600 mb-2">
                    {MENSAJES[`winner-${winner}`]}
                </p>

                <div className="flex justify-center">
                    <BlockyButton color="#d97706" onClick={onClose}>
                        Cerrar
                    </BlockyButton>
                </div>
            </div>
        </div>
    )

}