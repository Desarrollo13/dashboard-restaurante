// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import api from '../api/axios'
import Layout from '../components/Layout'

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
  const [resumen,   setResumen]   = useState(null)
  const [mensual,   setMensual]   = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    const fetchData = async () => {
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
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"/>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <h2 className="text-white text-2xl font-bold mb-6">
        Resumen del día — {resumen?.fecha}
      </h2>

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