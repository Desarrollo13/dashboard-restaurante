// src/pages/Mozos.jsx
import { useEffect, useState } from 'react'
import api from '../api/axios'
import Layout from '../components/Layout'
import { useExport } from '../hooks/useExport'
import BotonesExport from '../components/BotonesExport'

export default function Mozos() {
  const [mozos,   setMozos]   = useState([])
  const [fecha,   setFecha]   = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)

  const { exportarPDF, exportarExcel } = useExport()

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`/reportes/mozos/?fecha=${fecha}`)
        setMozos(data.resultados)
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [fecha])

  // ── Exportación ────────────────────────────────────────────────────────────
  const exportar = (tipo) => {
    const columnas = ['Mozo', 'Órdenes', 'Total vendido']
    const filas = mozos.map(m => [
      m.nombre || 'Sin nombre',
      m.total_ordenes,
      `$${parseFloat(m.total_vendido || 0).toLocaleString('es-AR')}`,
    ])
    const titulo = `Rendimiento por mozo — ${fecha}`
    if (tipo === 'pdf') {
      exportarPDF(titulo, columnas, filas, 'rendimiento_mozos')
    } else {
      exportarExcel(titulo, columnas, filas, 'rendimiento_mozos')
    }
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-2xl font-bold">👥 Rendimiento por mozo</h2>
        <div className="flex gap-2 items-center">
          <BotonesExport
            onPDF={() => exportar('pdf')}
            onExcel={() => exportar('excel')}
            disabled={mozos.length === 0}
          />
          <input
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            className="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"/>
        </div>
      ) : mozos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mozos.map((mozo, i) => (
            <div key={i} className="bg-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {(mozo.nombre || 'S').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold">{mozo.nombre || 'Sin nombre'}</p>
                  <p className="text-gray-400 text-sm">Mozo</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Órdenes</span>
                  <span className="text-white font-bold">{mozo.total_ordenes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Total vendido</span>
                  <span className="text-green-400 font-bold">
                    ${parseFloat(mozo.total_vendido || 0).toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-2xl p-12 text-center text-gray-400">
          No hay datos para esta fecha
        </div>
      )}
    </Layout>
  )
}