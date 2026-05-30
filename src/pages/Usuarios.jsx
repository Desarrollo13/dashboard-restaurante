// src/pages/Usuarios.jsx
import { useEffect, useState } from 'react'
import api from '../api/axios'
import Layout from '../components/Layout'

const ROLES = [
  { value: 'administrador', label: 'Administrador', color: 'bg-red-500/20 text-red-400 border border-red-500' },
  { value: 'gerente',       label: 'Gerente',       color: 'bg-purple-500/20 text-purple-400 border border-purple-500' },
  { value: 'mozo',          label: 'Mozo',          color: 'bg-blue-500/20 text-blue-400 border border-blue-500' },
  { value: 'cocinero',      label: 'Cocinero',      color: 'bg-orange-500/20 text-orange-400 border border-orange-500' },
  { value: 'cajero',        label: 'Cajero',        color: 'bg-green-500/20 text-green-400 border border-green-500' },
]

const getRolColor = rol => ROLES.find(r => r.value === rol)?.color || 'bg-gray-500/20 text-gray-400'
const getRolLabel = rol => ROLES.find(r => r.value === rol)?.label || rol

// ── Modal crear/editar usuario ────────────────────────────────────────────────
function ModalUsuario({ usuario, onGuardar, onCerrar }) {
  const [form, setForm] = useState({
    username:   usuario?.username   || '',
    first_name: usuario?.first_name || '',
    last_name:  usuario?.last_name  || '',
    email:      usuario?.email      || '',
    rol:        usuario?.rol        || 'mozo',
    telefono:   usuario?.telefono   || '',
    password:   '',
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
      const payload = { ...form }
      // Si es edición y no escribió password, no lo enviamos
      if (usuario && !payload.password) delete payload.password

      if (usuario) {
        await api.patch(`/usuarios/${usuario.id}/`, payload)
      } else {
        await api.post('/usuarios/', payload)
      }
      onGuardar()
    } catch (err) {
      const data = err.response?.data
      if (data) {
        const msg = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ')
        setError(msg)
      } else {
        setError('Error al guardar el usuario.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-screen overflow-y-auto">
        <h3 className="text-white text-xl font-bold mb-5">
          {usuario ? '✏️ Editar usuario' : '➕ Nuevo usuario'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Nombre</label>
              <input
                name="first_name" value={form.first_name} onChange={handleChange}
                placeholder="Juan"
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Apellido</label>
              <input
                name="last_name" value={form.last_name} onChange={handleChange}
                placeholder="Pérez"
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Usuario</label>
            <input
              name="username" value={form.username} onChange={handleChange}
              required placeholder="juanperez"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Email</label>
            <input
              name="email" value={form.email} onChange={handleChange}
              type="email" placeholder="juan@restaurante.com"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Rol</label>
              <select
                name="rol" value={form.rol} onChange={handleChange}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Teléfono</label>
              <input
                name="telefono" value={form.telefono} onChange={handleChange}
                placeholder="1123456789"
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">
              {usuario ? 'Nueva contraseña (dejá vacío para no cambiar)' : 'Contraseña'}
            </label>
            <input
              name="password" value={form.password} onChange={handleChange}
              type="password"
              required={!usuario}
              placeholder={usuario ? '••••••••' : 'Mínimo 8 caracteres'}
              minLength={form.password ? 8 : undefined}
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
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────────────
export default function Usuarios() {
  const [usuarios,      setUsuarios]      = useState([])
  const [busqueda,      setBusqueda]      = useState('')
  const [rolFiltro,     setRolFiltro]     = useState('')
  const [loading,       setLoading]       = useState(true)
  const [modalUsuario,  setModalUsuario]  = useState(false)
  const [usuarioEditar, setUsuarioEditar] = useState(null)
  const [confirmEliminar, setConfirmEliminar] = useState(null)

  const fetchUsuarios = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/usuarios/')
      setUsuarios(data.results || data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsuarios() }, [])

  const handleEliminar = async id => {
    try {
      await api.delete(`/usuarios/${id}/`)
      setConfirmEliminar(null)
      fetchUsuarios()
    } catch {
      alert('No se puede eliminar este usuario.')
    }
  }

  const usuariosFiltrados = usuarios.filter(u => {
    const coincideRol = rolFiltro ? u.rol === rolFiltro : true
    const coincideBusqueda = (
      u.username.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.first_name.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.last_name.toLowerCase().includes(busqueda.toLowerCase())
    )
    return coincideRol && coincideBusqueda
  })

  // Contadores por rol
  const contadores = ROLES.reduce((acc, r) => {
    acc[r.value] = usuarios.filter(u => u.rol === r.value).length
    return acc
  }, {})

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-2xl font-bold">👤 Gestión de Usuarios</h2>
        <button
          onClick={() => { setUsuarioEditar(null); setModalUsuario(true) }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          + Nuevo usuario
        </button>
      </div>

      {/* Stats por rol */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {ROLES.map(r => (
          <div key={r.value} className="bg-gray-800 rounded-xl p-3 text-center">
            <p className="text-gray-400 text-xs">{r.label}</p>
            <p className="text-white text-xl font-bold">{contadores[r.value] || 0}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="🔍 Buscar usuario..."
          className="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={rolFiltro}
          onChange={e => setRolFiltro(e.target.value)}
          className="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 text-sm"
        >
          <option value="">Todos los roles</option>
          {ROLES.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Lista de usuarios */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"/>
        </div>
      ) : usuariosFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {usuariosFiltrados.map(u => (
            <div key={u.id} className="bg-gray-800 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {(u.first_name || u.username).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold truncate">
                    {u.first_name && u.last_name
                      ? `${u.first_name} ${u.last_name}`
                      : u.username
                    }
                  </p>
                  <p className="text-gray-400 text-sm">@{u.username}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Rol</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getRolColor(u.rol)}`}>
                    {getRolLabel(u.rol)}
                  </span>
                </div>
                {u.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Email</span>
                    <span className="text-gray-300 text-sm truncate ml-2">{u.email}</span>
                  </div>
                )}
                {u.telefono && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Teléfono</span>
                    <span className="text-gray-300 text-sm">{u.telefono}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 border-t border-gray-700 pt-4">
                <button
                  onClick={() => { setUsuarioEditar(u); setModalUsuario(true) }}
                  className="flex-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white py-1.5 rounded-lg text-xs transition"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => setConfirmEliminar(u)}
                  className="flex-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white py-1.5 rounded-lg text-xs transition"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-2xl p-12 text-center text-gray-400">
          No hay usuarios que coincidan con la búsqueda
        </div>
      )}

      {/* Modal usuario */}
      {modalUsuario && (
        <ModalUsuario
          usuario={usuarioEditar}
          onGuardar={() => { setModalUsuario(false); fetchUsuarios() }}
          onCerrar={() => setModalUsuario(false)}
        />
      )}

      {/* Confirm eliminar */}
      {confirmEliminar && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm text-center">
            <p className="text-4xl mb-4">⚠️</p>
            <h3 className="text-white font-bold text-lg mb-2">¿Eliminar usuario?</h3>
            <p className="text-gray-400 text-sm mb-6">
              "@{confirmEliminar.username}" será eliminado permanentemente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmEliminar(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEliminar(confirmEliminar.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}