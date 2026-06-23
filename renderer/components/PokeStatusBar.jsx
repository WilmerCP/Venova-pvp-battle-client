import { CgGenderMale, CgGenderFemale } from "react-icons/cg";


export default function PokeStatusBar({ pkm, positionClasses }) {

    const GenderSymbol = pkm.gender == 'male' ? CgGenderMale : pkm.gender == 'female' ? CgGenderFemale : 'div';

    return (
        <div className={`bg-white rounded-lg px-4 py-3 shadow-lg w-[200px] ${positionClasses}`}>
            <div className="flex flex-row justify-between w-full">
                <p className="flex flex-row">
                    <span className="font-bold text-sm">{pkm.name}</span>
                    <GenderSymbol className={`${pkm.gender} `} />
                </p>
                <div className={`status status-${pkm.status}`}></div>
            </div>
            <div className="w-3/4 h-2 bg-gray-300 rounded-full mt-1">
                <div
                    className={`h-2 rounded-full ${pkm.currentHP < 25 ? 'bg-red-500' : pkm.currentHp < 50 ? 'bg-yellow-400' : 'bg-green-500'
                        }`}
                    style={{ width: `${pkm.currentHP}%` }}
                />
            </div>
        </div>
    )

}