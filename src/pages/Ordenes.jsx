// src/pages/Ordenes.jsx
import { useEffect, useState, useCallback } from 'react'
import api from '../api/axios'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'
import { useAutoRefresh } from '../hooks/useAutoRefresh'

const ESTADOS = [
  { value: '',          label: 'Todas',      color: 'bg-gray-600' },
  { value: 'abierta',   label: 'Abiertas',   color: 'bg-blue-600' },
  { value: 'en_cocina', label: 'En cocina',  color: 'bg-yellow-600' },
  { value: 'lista',     label: 'Listas',     color: 'bg-green-600' },
  { value: 'cerrada',   label: 'Cerradas',   color: 'bg-gray-500' },
  { value: 'cancelada', label: 'Canceladas', color: 'bg-red-600' },
]

const BADGE = {
  abierta:   'bg-blue-500/20 text-blue-400 border border-blue-500',
  en_cocina: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500',
  lista:     'bg-green-500/20 text-green-400 border border-green-500',
  cerrada:   'bg-gray-500/20 text-gray-400 border border-gray-500',
  cancelada: 'bg-red-500/20 text-red-400 border border-red-500',
}

const ICONOS = {
  abierta:   '🟦',
  en_cocina: '🟨',
  lista:     '🟩',
  cerrada:   '⬜',
  cancelada: '🟥',
}

function OrdenCard({ orden }) {
  return (
    <div className="bg-gray-800 rounded-2xl p-5 hover:bg-gray-750 transition">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-lg">Orden #{orden.id}</span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${BADGE[orden.estado]}`}>
            {ICONOS[orden.estado]} {orden.estado.replace('_', ' ')}
          </span>
        </div>
        <span className="text-green-400 font-bold text-lg">
          ${parseFloat(orden.total || 0).toLocaleString('es-AR')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <span className="text-gray-400">Mesa: </span>
          <span className="text-white font-medium">{orden.mesa}</span>
        </div>
        <div>
          <span className="text-gray-400">Mozo: </span>
          <span className="text-white">{orden.mozo_nombre || '—'}</span>
        </div>
        <div>
          <span className="text-gray-400">Creada: </span>
          <span className="text-white">
            {new Date(orden.creada_en).toLocaleTimeString('es-AR', {
              hour: '2-digit', minute: '2-digit'
            })}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Items: </span>
          <span className="text-white">{orden.items?.length || 0}</span>
        </div>
      </div>

      {orden.items?.length > 0 && (
        <div className="border-t border-gray-700 pt-3 space-y-1">
          {orden.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-300">
                {item.cantidad}x {item.nombre}
                {item.nota && <span className="text-gray-500 ml-1">({item.nota})</span>}
              </span>
              <span className="text-gray-400">
                ${parseFloat(item.subtotal || 0).toLocaleString('es-AR')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Ordenes() {
  const [ordenes,             setOrdenes]             = useState([])
  const [estadoFiltro,        setEstadoFiltro]        = useState('')
  const [fecha,               setFecha]               = useState(new Date().toISOString().split('T')[0])
  const [loading,             setLoading]             = useState(true)
  const [contadores,          setContadores]          = useState({})
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null)

  const fetchOrdenes = useCallback(async (silencioso = false) => {
    if (!silencioso) setLoading(true)
    try {
      const { data } = await api.get('/ordenes/')
      let todas = data.results || data

      // Filtrar por fecha
      todas = todas.filter(o =>
        new Date(o.creada_en).toISOString().split('T')[0] === fecha
      )

      // Calcular contadores
      const counts = {}
      todas.forEach(o => {
        counts[o.estado] = (counts[o.estado] || 0) + 1
      })
      setContadores(counts)

      // Filtrar por estado
      if (estadoFiltro) {
        todas = todas.filter(o => o.estado === estadoFiltro)
      }

      setOrdenes(todas)
      setUltimaActualizacion(new Date())
    } catch {
      if (!silencioso) toast.error('Error al cargar las órdenes')
    } finally {
      if (!silencioso) setLoading(false)
    }
  }, [fecha, estadoFiltro])

  useEffect(() => { fetchOrdenes() }, [fetchOrdenes])
  useAutoRefresh(() => fetchOrdenes(true), 30)

  const totalDia = ordenes.reduce((acc, o) => acc + parseFloat(o.total || 0), 0)

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-2xl font-bold">📋 Órdenes</h2>
          {ultimaActualizacion && (
            <p className="text-gray-500 text-xs mt-1">
              Actualizado: {ultimaActualizacion.toLocaleTimeString('es-AR')} · se refresca cada 30s
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date" value={fecha}
            onChange={e => setFecha(e.target.value)}
            className="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 text-sm"
          />
          <button
            onClick={() => fetchOrdenes()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Filtros por estado */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {ESTADOS.map(e => (
          <button
            key={e.value}
            onClick={() => setEstadoFiltro(e.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition
              ${estadoFiltro === e.value
                ? `${e.color} text-white`
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
          >
            {e.label}
            {e.value && contadores[e.value] ? (
              <span className="ml-2 bg-black/30 px-2 py-0.5 rounded-full text-xs">
                {contadores[e.value]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Stats rápidas */}
      {!estadoFiltro && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {ESTADOS.slice(1).map(e => (
            <div key={e.value} className="bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-gray-400 text-xs">{e.label}</p>
              <p className="text-white text-xl font-bold">{contadores[e.value] || 0}</p>
            </div>
          ))}
        </div>
      )}

      {/* Lista de órdenes */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"/>
        </div>
      ) : ordenes.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400 text-sm">{ordenes.length} orden(es) encontradas</p>
            {estadoFiltro === 'cerrada' && (
              <p className="text-green-400 font-bold">
                Total: ${totalDia.toLocaleString('es-AR')}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {ordenes.map(orden => (
              <OrdenCard key={orden.id} orden={orden} />
            ))}
          </div>
        </>
      ) : (
        <div className="bg-gray-800 rounded-2xl p-12 text-center">
          <p className="text-gray-400 text-lg">No hay órdenes para mostrar</p>
          <p className="text-gray-600 text-sm mt-2">
            {estadoFiltro
              ? `No hay órdenes con estado "${estadoFiltro}"`
              : 'No hay órdenes para esta fecha'
            }
          </p>
        </div>
      )}
    </Layout>
  )
}