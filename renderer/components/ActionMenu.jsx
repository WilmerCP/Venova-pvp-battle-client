export default function ActionMenu({ onFight, onSwitch, onRun }) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4">

      <button
        onClick={onFight}
        className="bg-red-600 hover:bg-red-500 active:translate-y-[0.5] active:-translate-x-[0.5] active:border-1
                   text-white font-bold text-lg py-3 px-4 rounded-sm
                   border-l-[3px] border-b-[3px] border-t-[1px] border-r-[1px] border-red-900
                   transition-all duration-100"
      >
        Luchar
      </button>

      <button
        onClick={onSwitch}
        className="bg-green-600 hover:bg-green-500 active:translate-y-[0.5] active:-translate-x-[0.5] active:border-1
                   text-white font-bold text-lg py-3 px-4 rounded-sm
                   border-l-[3px] border-b-[3px] border-t-[1px] border-r-[1px] border-green-900
                   transition-all duration-100"
      >
        Cambiar
      </button>

      <button
        onClick={onRun}
        className="bg-gray-500 hover:bg-gray-400 active:translate-y-[0.5] active:-translate-x-[0.5] active:border-1
                   text-white font-bold text-lg py-3 px-4 rounded-sm
                   border-l-[3px] border-b-[3px] border-t-[1px] border-r-[1px] border-gray-700
                   transition-all duration-100 col-span-2"
      >
        Rendirse
      </button>

    </div>
  )
}