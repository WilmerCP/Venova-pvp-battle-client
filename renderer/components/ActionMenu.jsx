export default function ActionMenu({ onFight, onSwitch, onRun }) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4">

      <button
        onClick={onFight}
        className="bg-red-600 hover:bg-red-500 active:translate-y-1 active:border-b-2
                   text-white font-bold text-lg py-3 px-4 rounded-lg
                   border-b-[6px] border-red-900
                   transition-all duration-100"
      >
        Luchar
      </button>

      <button
        onClick={onSwitch}
        className="bg-green-600 hover:bg-green-500 active:translate-y-1 active:border-b-2
                   text-white font-bold text-lg py-3 px-4 rounded-lg
                   border-b-[6px] border-green-900
                   transition-all duration-100"
      >
        Cambiar
      </button>

      <button
        onClick={onRun}
        className="bg-gray-500 hover:bg-gray-400 active:translate-y-1 active:border-b-2
                   text-white font-bold text-lg py-3 px-4 rounded-lg
                   border-b-[6px] border-gray-700
                   transition-all duration-100 col-span-2"
      >
        Rendirse
      </button>

    </div>
  )
}