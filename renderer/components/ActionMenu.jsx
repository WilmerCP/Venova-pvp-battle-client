import { useTheme } from '../ThemeContext.jsx';

function ActionButton({ onClick, themeClass, children }){

  return <button
        onClick={onClick}
        className={`active:translate-y-[0.5] active:-translate-x-[0.5] active:border-1
                  text-lg py-3 px-4 rounded-sm transition-all duration-100
                   border-l-[3px] border-b-[3px] border-t-[1px] border-r-[1px] 
                  ${themeClass}`}
      >
        {children}
      </button>

}


export default function ActionMenu({ onFight, onSwitch, onRun }) {

  const { theme } = useTheme();

  const { btnPrimary, btnSecondary, btnNeutral } = theme;

  return (
    <div className="grid grid-cols-2 gap-3 p-4">

      <ActionButton onClick={onFight} themeClass={btnPrimary}>
        Luchar
      </ActionButton>

      <ActionButton onClick={onSwitch} themeClass={btnSecondary}>
        Cambiar
      </ActionButton>

      <ActionButton onClick={onRun} themeClass={`${btnNeutral} col-span-2`}>
        Rendirse
      </ActionButton>

    </div>
  )
}