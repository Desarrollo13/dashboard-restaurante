// src/components/BotonesExport.jsx
export default function BotonesExport({ onPDF, onExcel, disabled }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onPDF}
        disabled={disabled}
        className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-4 py-2 rounded-lg text-sm transition disabled:opacity-40"
      >
        📄 PDF
      </button>
      <button
        onClick={onExcel}
        disabled={disabled}
        className="flex items-center gap-2 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white px-4 py-2 rounded-lg text-sm transition disabled:opacity-40"
      >
        📊 Excel
      </button>
    </div>
  )
}