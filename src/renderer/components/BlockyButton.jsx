import '../buttons.css'

export default function BlockyButton({ children, color = '#333', onClick }) {
  return (
    <button
      className="button-blocky"
      style={{ '--btn-color': color }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}