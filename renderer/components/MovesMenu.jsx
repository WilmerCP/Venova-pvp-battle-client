
import megaIcon from '../assets/mega_stone.png'
import { PiShootingStarFill } from "react-icons/pi";
import { TiArrowBack } from "react-icons/ti";
import MoveButton from './MoveButton.jsx';

export default function MoveMenu({ onSelectMove, onBack, availableMoves }) {

    console.log(availableMoves)
    return (

        <div className="flex flex-row justify-between gap-2 p-2">
            <div className="grid grid-cols-1 gap-1">
                <button className="bg-red-500 hover:bg-red-400 active:translate-y-1 active:border-b-2
                     text-white font-bold rounded-xl w-10 h-10
                     border-b-[3px] border-red-900
                     transition-all duration-100
                     flex flex-col items-center justify-center"
                     onClick={onBack}>
                    <TiArrowBack className="w-6 h-6" />
                </button>
                <button className="bg-amber-500 hover:bg-amber-400 active:translate-y-1 active:border-b-2
                     text-white font-bold rounded-xl w-10 h-10
                     border-b-[3px] border-amber-900
                     transition-all duration-100
                     flex flex-col items-center justify-center">
                    <PiShootingStarFill className="w-6 h-6 " />
                </button>
                <button className="bg-neutral-600 hover:bg-blue-500 active:translate-y-1 active:border-b-2
                     text-white font-bold rounded-xl w-10 h-10
                     border-b-[3px] border-neutral-900
                     transition-all duration-100
                     flex flex-col items-center justify-center">
                    <img src={megaIcon} alt="Mega Stone" className="w-6 h-6" />
                </button>

            </div>
            <div className="grid grid-cols-2 gap-3">

                {availableMoves.map((move) => (

                    <MoveButton key={move.move} name={move.move} type={move.type} ppCurrent={move.pp} ppMax={move.maxpp} disabled={move.disabled} onSelectMove={onSelectMove}/>

                ))}

            </div>
        </div>
    )
}