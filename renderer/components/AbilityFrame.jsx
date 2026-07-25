export default function AbilityFrame({ pkmName, abilityName, positionClasses, side }) {

    let borderClasses = side == 'left' ? 'rounded-r-xl border-r-4 border-b-2' : 'rounded-l-xl border-l-4 border-b-2'

    return(

        <div className={`bg-gray-900/90 text-white py-2 px-6 ${borderClasses} border-amber-400 shadow-xl z-20 ${positionClasses}`}>

            <p className="font-semibold text-base">
                {`${abilityName} de ${pkmName}`}
                </p>

        </div>

    )


}