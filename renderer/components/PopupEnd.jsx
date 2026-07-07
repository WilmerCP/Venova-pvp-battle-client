import MENSAJES from "../lib/mensajes";

export default function PopupEnd({ winner, onClose }) {

    return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/75">
        <div className="bg-white rounded-lg p-6 w-80">
            <h2 className="text-2xl font-bold mb-4">¡Batalla Finalizada!</h2>
            <p className="text-lg text-center">{MENSAJES[`winner-${winner}`]}</p>
            <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded mt-4" onClick={onClose}>
                Cerrar
            </button>
        </div>
    </div>
    )

}