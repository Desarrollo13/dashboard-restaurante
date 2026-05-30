// src/pages/Mesas.jsx
import { useEffect, useState, useCallback } from 'react'
import api from '../api/axios'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'
import { useAutoRefresh } from '../hooks/useAutoRefresh'

// ── Colores y labels por estado de mesa ───────────────────────────────────────
const MESA_ESTADOS = {
  disponible: {
    bg:     'bg-green-500/20 border-green-500 hover:bg-green-500/30',
    badge:  'bg-green-500/20 text-green-400 border border-green-500',
    icon:   '🟢',
    label:  'Disponible',
  },
  ocupada: {
    bg:     'bg-red-500/20 border-red-500 hover:bg-red-500/30',
    badge:  'bg-red-500/20 text-red-400 border border-red-500',
    icon:   '🔴',
    label:  'Ocupada',
  },
  reservada: {
    bg:     'bg-yellow-500/20 border-yellow-500 hover:bg-yellow-500/30',
    badge:  'bg-yellow-500/20 text-yellow-400 border border-yellow-500',
    icon:   '🟡',
    label:  'Reservada',
  },
}

const RESERVA_ESTADOS = {
  pendiente:  'bg-yellow-500/20 text-yellow-400 border border-yellow-500',
  confirmada: 'bg-green-500/20 text-green-400 border border-green-500',
  cancelada:  'bg-red-500/20 text-red-400 border border-red-500',
  completada: 'bg-gray-500/20 text-gray-400 border border-gray-500',
}

// ── Modal crear reserva ────────────────────────────────────────────────────────
function ModalReserva({ mesas, onGuardar, onCerrar }) {
  const [form, setForm] = useState({
    mesa:             '',
    cliente_nombre:   '',
    cliente_telefono: '',
    fecha_hora:       '',
    personas:         2,
    notas:            '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/reservas/', form)
      toast.success('Reserva creada ✅')
      onGuardar()
    } catch (err) {
      const data = err.response?.data
      if (data) {
        const msg = Object.entries(data)
          .map(([k, v]) => `${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ')
        setError(msg)
      } else {
        setError('Error al crear la reserva.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Fecha mínima = ahora
  const fechaMin = new Date()
  fechaMin.setMinutes(fechaMin.getMinutes() - fechaMin.getTimezoneOffset())
  const fechaMinStr = fechaMin.toISOString().slice(0, 16)

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-white text-xl font-bold mb-5">📅 Nueva reserva</h3>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-gray-400 text-sm mb-1">Mesa</label>
            <select
              name="mesa" value={form.mesa} onChange={handleChange}
              required
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Seleccioná una mesa</option>
              {mesas.filter(m => m.estado === 'disponible').map(m => (
                <option key={m.id} value={m.id}>
                  Mesa {m.numero} — {m.capacidad} personas
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Nombre del cliente</label>
              <input
                name="cliente_nombre" value={form.cliente_nombre}
                onChange={handleChange} required placeholder="Juan Pérez"
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Teléfono</label>
              <input
                name="cliente_telefono" value={form.cliente_telefono}
                onChange={handleChange} required placeholder="1123456789"
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Fecha y hora</label>
              <input
                name="fecha_hora" value={form.fecha_hora}
                onChange={handleChange} required
                type="datetime-local" min={fechaMinStr}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Personas</label>
              <input
                name="personas" value={form.personas}
                onChange={handleChange} required
                type="number" min={1} max={20}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Notas (opcional)</label>
            <textarea
              name="notas" value={form.notas} onChange={handleChange}
              rows={2} placeholder="Cumpleaños, alergias, preferencias..."
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCerrar}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition disabled:opacity-50">
              {loading ? 'Guardando...' : 'Crear reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────────────
export default function Mesas() {
  const [mesas,         setMesas]         = useState([])
  const [reservas,      setReservas]      = useState([])
  const [loading,       setLoading]       = useState(true)
  const [modalReserva,  setModalReserva]  = useState(false)
  const [fechaFiltro,   setFechaFiltro]   = useState(new Date().toISOString().split('T')[0])
  const [ultimaAct,     setUltimaAct]     = useState(null)

  const fetchData = useCallback(async (silencioso = false) => {
    if (!silencioso) setLoading(true)
    try {
      const [mesasRes, reservasRes] = await Promise.all([
        api.get('/mesas/'),
        api.get(`/reservas/?fecha=${fechaFiltro}`),
      ])
      setMesas(mesasRes.data.results     || mesasRes.data)
      setReservas(reservasRes.data.results || reservasRes.data)
      setUltimaAct(new Date())
    } catch {
      if (!silencioso) toast.error('Error al cargar los datos')
    } finally {
      if (!silencioso) setLoading(false)
    }
  }, [fechaFiltro])

  useEffect(() => { fetchData() }, [fetchData])
  useAutoRefresh(() => fetchData(true), 30)

  const handleConfirmar = async id => {
    try {
      await api.patch(`/reservas/${id}/confirmar/`)
      toast.success('Reserva confirmada ✅')
      fetchData(true)
    } catch {
      toast.error('Error al confirmar la reserva')
    }
  }

  const handleCancelar = async id => {
    try {
      await api.patch(`/reservas/${id}/cancelar/`)
      toast.success('Reserva cancelada')
      fetchData(true)
    } catch {
      toast.error('Error al cancelar la reserva')
    }
  }

  const handleCompletar = async id => {
    try {
      await api.patch(`/reservas/${id}/completar/`)
      toast.success('Cliente llegó — mesa ocupada 🍽️')
      fetchData(true)
    } catch {
      toast.error('Error al completar la reserva')
    }
  }

  // Contadores de mesas
  const contadores = {
    disponible: mesas.filter(m => m.estado === 'disponible').length,
    ocupada:    mesas.filter(m => m.estado === 'ocupada').length,
    reservada:  mesas.filter(m => m.estado === 'reservada').length,
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-2xl font-bold">🪑 Mesas y Reservas</h2>
          {ultimaAct && (
            <p className="text-gray-500 text-xs mt-1">
              Actualizado: {ultimaAct.toLocaleTimeString('es-AR')} · refresca cada 30s
            </p>
          )}
        </div>
        <button
          onClick={() => setModalReserva(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          + Nueva reserva
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"/>
        </div>
      ) : (
        <>
          {/* Stats de mesas */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {Object.entries(contadores).map(([estado, cantidad]) => (
              <div key={estado} className="bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm capitalize">
                  {MESA_ESTADOS[estado].icon} {MESA_ESTADOS[estado].label}
                </p>
                <p className="text-white text-2xl font-bold">{cantidad}</p>
              </div>
            ))}
          </div>

          {/* Mapa de mesas */}
          <div className="bg-gray-800 rounded-2xl p-6 mb-8">
            <h3 className="text-white font-semibold mb-4">🗺️ Estado de mesas</h3>
            {mesas.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {mesas.map(mesa => {
                  const config = MESA_ESTADOS[mesa.estado]
                  return (
                    <div
                      key={mesa.id}
                      className={`border-2 rounded-xl p-3 text-center transition cursor-default ${config.bg}`}
                    >
                      <p className="text-white font-bold text-lg">#{mesa.numero}</p>
                      <p className="text-gray-400 text-xs mb-1">{mesa.capacidad} 👤</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${config.badge}`}>
                        {config.icon} {config.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No hay mesas registradas</p>
            )}
          </div>

          {/* Reservas del día */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">📅 Reservas</h3>
            <input
              type="date" value={fechaFiltro}
              onChange={e => setFechaFiltro(e.target.value)}
              className="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 text-sm"
            />
          </div>

          {reservas.length > 0 ? (
            <div className="space-y-3">
              {reservas.map(r => (
                <div key={r.id} className="bg-gray-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {r.cliente_nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{r.cliente_nombre}</p>
                        <p className="text-gray-400 text-sm">📞 {r.cliente_telefono}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${RESERVA_ESTADOS[r.estado]}`}>
                      {r.estado}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                    <div>
                      <span className="text-gray-400">Mesa </span>
                      <span className="text-white font-medium">#{r.mesa_numero}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Personas </span>
                      <span className="text-white font-medium">{r.personas} 👤</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Hora </span>
                      <span className="text-white font-medium">
                        {new Date(r.fecha_hora).toLocaleTimeString('es-AR', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Creada por </span>
                      <span className="text-white font-medium">{r.creada_por_nombre || '—'}</span>
                    </div>
                  </div>

                  {r.notas && (
                    <p className="text-gray-500 text-sm mb-3 italic">📝 {r.notas}</p>
                  )}

                  {/* Acciones según estado */}
                  <div className="flex gap-2 border-t border-gray-700 pt-3">
                    {r.estado === 'pendiente' && (
                      <>
                        <button
                          onClick={() => handleConfirmar(r.id)}
                          className="bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white px-3 py-1.5 rounded-lg text-xs transition"
                        >
                          ✅ Confirmar
                        </button>
                        <button
                          onClick={() => handleCancelar(r.id)}
                          className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1.5 rounded-lg text-xs transition"
                        >
                          ❌ Cancelar
                        </button>
                      </>
                    )}
                    {r.estado === 'confirmada' && (
                      <>
                        <button
                          onClick={() => handleCompletar(r.id)}
                          className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white px-3 py-1.5 rounded-lg text-xs transition"
                        >
                          🍽️ Cliente llegó
                        </button>
                        <button
                          onClick={() => handleCancelar(r.id)}
                          className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1.5 rounded-lg text-xs transition"
                        >
                          ❌ Cancelar
                        </button>
                      </>
                    )}
                    {(r.estado === 'cancelada' || r.estado === 'completada') && (
                      <span className="text-gray-600 text-xs py-1.5">
                        Sin acciones disponibles
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-2xl p-12 text-center text-gray-400">
              No hay reservas para esta fecha
            </div>
          )}
        </>
      )}

      {/* Modal nueva reserva */}
      {modalReserva && (
        <ModalReserva
          mesas={mesas}
          onGuardar={() => { setModalReserva(false); fetchData(true) }}
          onCerrar={() => setModalReserva(false)}
        />
      )}
    </Layout>
  )
}