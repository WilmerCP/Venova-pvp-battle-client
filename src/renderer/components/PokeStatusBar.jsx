import { CgGenderMale, CgGenderFemale } from "react-icons/cg";
import { MdStar } from "react-icons/md";



export default function PokeStatusBar({ pkm , barRef , statusBarRef, positionClasses }) {

    const GenderSymbol = pkm.gender == 'M' ? CgGenderMale : pkm.gender == 'F' ? CgGenderFemale : 'div';
    const genderClass = pkm.gender == 'M' ? 'male' : pkm.gender == 'F' ? 'female' : '';
    //console.log('hp to display:', hpToDisplay);

    return (
        <div className={`bg-white rounded-sm px-4 py-3 shadow-lg w-[220px] ${positionClasses}`} ref={statusBarRef}>
            <div className="flex flex-row justify-between w-full">

                <p className="flex flex-row items-center">
                    <span className="font-bold text-md">{pkm.pkmName}</span>
                    {pkm.shiny && (
                        <MdStar className="text-red-500 text-sm" />
                    )}
                </p>
                <span className="flex flex-row">
                    <GenderSymbol className={`${genderClass} text-lg`} />
                    <p className="text-sm font-bold">Nv. {pkm.level}</p>
                </span>

            </div>
            <div className="flex flex-row items-center justify-between mt-2 w-full">
                <div className={`status status-${pkm.status}`}></div>
                <div className="w-3/4 h-2 bg-gray-300 rounded-full mt-1">
                    <div
                        ref={barRef}
                        className={`h-2 rounded-full ${pkm.currentHPPercentage < 25 ? 'bg-red-500' : pkm.currentHPPercentage < 50 ? 'bg-yellow-400' : 'bg-green-500'
                            }`}
                        style={{ width: `${pkm.currentHPPercentage}%`,
                                transition: 'width 1s ease-out'
                     }}
                    />
                </div>
            </div>
        </div>
    )

}