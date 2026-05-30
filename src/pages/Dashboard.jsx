// src/pages/Dashboard.jsx
import { useEffect, useState, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api/axios'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import { useExport } from '../hooks/useExport'
import BotonesExport from '../components/BotonesExport'

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`bg-gray-800 rounded-2xl p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-white text-2xl font-bold mt-1">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [resumen,             setResumen]             = useState(null)
  const [mensual,             setMensual]             = useState([])
  const [loading,             setLoading]             = useState(true)
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null)

  const { exportarPDF, exportarExcel } = useExport()

  const fetchData = useCallback(async (silencioso = false) => {
    if (!silencioso) setLoading(true)
    try {
      const [resumenRes, mensualRes] = await Promise.all([
        api.get('/reportes/resumen/'),
        api.get('/reportes/ventas/mensuales/?meses=6'),
      ])
      setResumen(resumenRes.data)
      setMensual(mensualRes.data.resultados.map(r => ({
        mes:    new Date(r.mes).toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
        ventas: parseFloat(r.total_ventas || 0),
        ordenes: r.total_ordenes,
      })))
      setUltimaActualizacion(new Date())
      if (!silencioso) toast.success('Datos actualizados')
    } catch {
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useAutoRefresh(() => fetchData(true), 60)

  // ── Exportación ────────────────────────────────────────────────────────────
  const exportar = (tipo) => {
    const columnas = ['Concepto', 'Valor']
    const filas = [
      ['Total vendido',      `$${parseFloat(resumen?.ventas?.total || 0).toLocaleString('es-AR')}`],
      ['Órdenes cerradas',   resumen?.ordenes?.cerradas  || 0],
      ['En cocina',          resumen?.ordenes?.en_cocina || 0],
      ['Listas para cobrar', resumen?.ordenes?.listas    || 0],
      ['Abiertas',           resumen?.ordenes?.abiertas  || 0],
      ['Canceladas',         resumen?.ordenes?.canceladas|| 0],
      ['— Efectivo',         `$${parseFloat(resumen?.ventas?.efectivo     || 0).toLocaleString('es-AR')}`],
      ['— Tarjeta',          `$${parseFloat(resumen?.ventas?.tarjeta      || 0).toLocaleString('es-AR')}`],
      ['— Transferencia',    `$${parseFloat(resumen?.ventas?.transferencia|| 0).toLocaleString('es-AR')}`],
    ]
    const titulo = `Resumen del día ${resumen?.fecha}`
    if (tipo === 'pdf') {
      exportarPDF(titulo, columnas, filas, 'resumen_dia')
    } else {
      exportarExcel(titulo, columnas, filas, 'resumen_dia')
    }
  }

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"/>
      </div>
    </Layout>
  )

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-2xl font-bold">
            Resumen del día — {resumen?.fecha}
          </h2>
          {ultimaActualizacion && (
            <p className="text-gray-500 text-xs mt-1">
              Actualizado: {ultimaActualizacion.toLocaleTimeString('es-AR')} · se refresca cada 60s
            </p>
          )}
        </div>
        {/* ← Botones de exportación + actualizar */}
        <div className="flex gap-2">
          <BotonesExport
            onPDF={() => exportar('pdf')}
            onExcel={() => exportar('excel')}
            disabled={!resumen}
          />
          <button
            onClick={() => fetchData()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Tarjetas de stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="💰" label="Total vendido"
          value={`$${parseFloat(resumen?.ventas?.total || 0).toLocaleString('es-AR')}`}
          color="border-green-500" />
        <StatCard icon="📋" label="Órdenes cerradas"
          value={resumen?.ordenes?.cerradas || 0}
          color="border-indigo-500" />
        <StatCard icon="🔄" label="En cocina"
          value={resumen?.ordenes?.en_cocina || 0}
          color="border-yellow-500" />
        <StatCard icon="✅" label="Listas para cobrar"
          value={resumen?.ordenes?.listas || 0}
          color="border-blue-500" />
      </div>

      {/* Ventas por método de pago */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 rounded-2xl p-4 text-center">
          <p className="text-gray-400 text-sm">💵 Efectivo</p>
          <p className="text-white text-xl font-bold mt-1">
            ${parseFloat(resumen?.ventas?.efectivo || 0).toLocaleString('es-AR')}
          </p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-4 text-center">
          <p className="text-gray-400 text-sm">💳 Tarjeta</p>
          <p className="text-white text-xl font-bold mt-1">
            ${parseFloat(resumen?.ventas?.tarjeta || 0).toLocaleString('es-AR')}
          </p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-4 text-center">
          <p className="text-gray-400 text-sm">🏦 Transferencia</p>
          <p className="text-white text-xl font-bold mt-1">
            ${parseFloat(resumen?.ventas?.transferencia || 0).toLocaleString('es-AR')}
          </p>
        </div>
      </div>

      {/* Gráfico ventas mensuales */}
      <div className="bg-gray-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">📈 Ventas últimos 6 meses</h3>
        {mensual.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mensual}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="mes" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="ventas" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#6366F1' }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-center py-12">No hay datos de ventas aún</p>
        )}
      </div>
    </Layout>
  )
}