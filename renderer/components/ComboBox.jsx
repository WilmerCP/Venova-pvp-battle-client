// components/ComboBox.jsx
import { useState, useRef, useEffect } from 'react';

/**
 * Input con autocompletado propio.
 * - options: array de { value, label } — value es lo que se guarda/emite,
 *   label es lo que se muestra y se usa para filtrar.
 * - value: value actualmente seleccionado (controlado desde el padre)
 * - onChange: recibe el value elegido
 */
export default function ComboBox({ options, value, onChange, placeholder }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const boxRef = useRef(null);

  // Sincroniza el texto mostrado cuando el value cambia desde afuera
  // (ej. al cambiar de pokemon seleccionado)
  useEffect(() => {
    const selected = options.find((o) => o.value === value);
    setQuery(selected?.label ?? '');
  }, [value, options]);

  // Cierra la lista si se hace click afuera del componente
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option.value);
    setQuery(option.label);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={boxRef}>
      <input
        type="text"
        className="text-xs rounded-md border border-black/10 px-1 py-0.5 w-full z-10"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
      />

      {isOpen && (
        <ul className="absolute z-20 mt-1 max-h-40 w-full overflow-y-auto
                       bg-white border border-black/10 rounded-md shadow-md">
          {filteredOptions.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option)}
              className="text-xs px-2 py-1 hover:bg-black/10 cursor-pointer"
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}