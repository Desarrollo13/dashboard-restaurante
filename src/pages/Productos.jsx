// src/pages/Productos.jsx
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api/axios'
import Layout from '../components/Layout'
import { useExport } from '../hooks/useExport'
import BotonesExport from '../components/BotonesExport'

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [dias,      setDias]      = useState(7)
  const [loading,   setLoading]   = useState(true)

  const { exportarPDF, exportarExcel } = useExport()

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`/reportes/productos/?dias=${dias}&top=10`)
        setProductos(data.productos.map(p => ({
          nombre:   p.menu_item__nombre,
          cantidad: p.cantidad_vendida,
          total:    parseFloat(p.total_generado || 0),
        })))
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [dias])

  // ── Exportación ────────────────────────────────────────────────────────────
  const exportar = (tipo) => {
    const columnas = ['#', 'Producto', 'Cantidad vendida', 'Total generado']
    const filas = productos.map((p, i) => [
      i + 1,
      p.nombre,
      p.cantidad,
      `$${p.total.toLocaleString('es-AR')}`,
    ])
    const titulo = `Productos más vendidos — últimos ${dias} días`
    if (tipo === 'pdf') {
      exportarPDF(titulo, columnas, filas, 'productos_vendidos')
    } else {
      exportarExcel(titulo, columnas, filas, 'productos_vendidos')
    }
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-2xl font-bold">🍽️ Productos más vendidos</h2>
        <div className="flex gap-2 items-center">
          <BotonesExport
            onPDF={() => exportar('pdf')}
            onExcel={() => exportar('excel')}
            disabled={productos.length === 0}
          />
          <select
            value={dias}
            onChange={e => setDias(Number(e.target.value))}
            className="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700"
          >
            <option value={7}>Últimos 7 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={90}>Últimos 90 días</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"/>
        </div>
      ) : productos.length > 0 ? (
        <>
          <div className="bg-gray-800 rounded-2xl p-6 mb-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={productos} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="nombre" type="category" stroke="#9CA3AF" width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                />
                <Bar dataKey="cantidad" fill="#6366F1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-300">#</th>
                  <th className="px-6 py-3 text-left text-gray-300">Producto</th>
                  <th className="px-6 py-3 text-right text-gray-300">Cantidad</th>
                  <th className="px-6 py-3 text-right text-gray-300">Total generado</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p, i) => (
                  <tr key={i} className="border-t border-gray-700 hover:bg-gray-750">
                    <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                    <td className="px-6 py-4 text-white font-medium">{p.nombre}</td>
                    <td className="px-6 py-4 text-right text-indigo-400 font-bold">{p.cantidad}</td>
                    <td className="px-6 py-4 text-right text-green-400">${p.total.toLocaleString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-gray-800 rounded-2xl p-12 text-center text-gray-400">
          No hay datos de ventas en este período
        </div>
      )}
    </Layout>
  )
}