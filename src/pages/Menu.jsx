// src/pages/Menu.jsx
import { useEffect, useState } from 'react'
import api from '../api/axios'
import Layout from '../components/Layout'

// ── Modal para crear/editar producto ──────────────────────────────────────────
function ModalProducto({ producto, categorias, onGuardar, onCerrar }) {
  const [form, setForm] = useState({
    nombre:      producto?.nombre      || '',
    descripcion: producto?.descripcion || '',
    precio:      producto?.precio      || '',
    categoria:   producto?.categoria   || '',
    disponible:  producto?.disponible  ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (producto) {
        await api.put(`/menu/${producto.id}/`, form)
      } else {
        await api.post('/menu/', form)
      }
      onGuardar()
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar el producto.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-white text-xl font-bold mb-5">
          {producto ? '✏️ Editar producto' : '➕ Nuevo producto'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Nombre</label>
            <input
              name="nombre" value={form.nombre} onChange={handleChange}
              required
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Descripción</label>
            <textarea
              name="descripcion" value={form.descripcion} onChange={handleChange}
              rows={2}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Precio</label>
              <input
                name="precio" value={form.precio} onChange={handleChange}
                type="number" step="0.01" min="0" required
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Categoría</label>
              <select
                name="categoria" value={form.categoria} onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seleccioná</option>
                {categorias.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox" name="disponible"
              checked={form.disponible} onChange={handleChange}
              id="disponible"
              className="w-4 h-4 accent-indigo-500"
            />
            <label htmlFor="disponible" className="text-gray-300 text-sm">
              Disponible en el menú
            </label>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onCerrar}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Modal para crear categoría ─────────────────────────────────────────────────
function ModalCategoria({ onGuardar, onCerrar }) {
  const [nombre,  setNombre]  = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/categorias/', { nombre })
      onGuardar()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-white text-xl font-bold mb-5">➕ Nueva categoría</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={nombre} onChange={e => setNombre(e.target.value)}
            placeholder="Nombre de la categoría"
            required
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-3">
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
export default function Menu() {
  const [productos,         setProductos]         = useState([])
  const [categorias,        setCategorias]        = useState([])
  const [categoriaFiltro,   setCategoriaFiltro]   = useState('')
  const [busqueda,          setBusqueda]          = useState('')
  const [loading,           setLoading]           = useState(true)
  const [modalProducto,     setModalProducto]     = useState(false)
  const [modalCategoria,    setModalCategoria]    = useState(false)
  const [productoEditar,    setProductoEditar]    = useState(null)
  const [confirmEliminar,   setConfirmEliminar]   = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/menu/?page_size=100'),
        api.get('/categorias/'),
      ])
      setProductos(prodRes.data.results || prodRes.data)
      setCategorias(catRes.data.results || catRes.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleEliminar = async id => {
    try {
      await api.delete(`/menu/${id}/`)
      setConfirmEliminar(null)
      fetchData()
    } catch {
      alert('Error al eliminar el producto.')
    }
  }

  const handleToggleDisponible = async producto => {
    await api.patch(`/menu/${producto.id}/`, {
      disponible: !producto.disponible
    })
    fetchData()
  }

  // Filtros locales
  const productosFiltrados = productos.filter(p => {
    const coincideCategoria = categoriaFiltro ? p.categoria === parseInt(categoriaFiltro) : true
    const coincideBusqueda  = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    return coincideCategoria && coincideBusqueda
  })

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-2xl font-bold">🍽️ Gestión de Menú</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setModalCategoria(true)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            + Categoría
          </button>
          <button
            onClick={() => { setProductoEditar(null); setModalProducto(true) }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            + Producto
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="🔍 Buscar producto..."
          className="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={categoriaFiltro}
          onChange={e => setCategoriaFiltro(e.target.value)}
          className="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 text-sm"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-sm">Total productos</p>
          <p className="text-white text-2xl font-bold">{productos.length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-sm">Disponibles</p>
          <p className="text-green-400 text-2xl font-bold">
            {productos.filter(p => p.disponible).length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-sm">Categorías</p>
          <p className="text-indigo-400 text-2xl font-bold">{categorias.length}</p>
        </div>
      </div>

      {/* Tabla de productos */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"/>
        </div>
      ) : productosFiltrados.length > 0 ? (
        <div className="bg-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-gray-300">Producto</th>
                <th className="px-6 py-3 text-left text-gray-300">Categoría</th>
                <th className="px-6 py-3 text-right text-gray-300">Precio</th>
                <th className="px-6 py-3 text-center text-gray-300">Disponible</th>
                <th className="px-6 py-3 text-center text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map(p => (
                <tr key={p.id} className="border-t border-gray-700 hover:bg-gray-750">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{p.nombre}</p>
                    {p.descripcion && (
                      <p className="text-gray-500 text-xs mt-0.5">{p.descripcion}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-full text-xs">
                      {p.categoria_nombre}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-green-400 font-bold">
                    ${parseFloat(p.precio).toLocaleString('es-AR')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleDisponible(p)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        p.disponible ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${
                        p.disponible ? 'translate-x-6' : 'translate-x-0'
                      }`}/>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => { setProductoEditar(p); setModalProducto(true) }}
                        className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white px-3 py-1 rounded-lg text-xs transition"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => setConfirmEliminar(p)}
                        className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1 rounded-lg text-xs transition"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-2xl p-12 text-center text-gray-400">
          {busqueda ? `No hay productos que coincidan con "${busqueda}"` : 'No hay productos en el menú'}
        </div>
      )}

      {/* Modal producto */}
      {modalProducto && (
        <ModalProducto
          producto={productoEditar}
          categorias={categorias}
          onGuardar={() => { setModalProducto(false); fetchData() }}
          onCerrar={() => setModalProducto(false)}
        />
      )}

      {/* Modal categoría */}
      {modalCategoria && (
        <ModalCategoria
          onGuardar={() => { setModalCategoria(false); fetchData() }}
          onCerrar={() => setModalCategoria(false)}
        />
      )}

      {/* Confirm eliminar */}
      {confirmEliminar && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm text-center">
            <p className="text-4xl mb-4">⚠️</p>
            <h3 className="text-white font-bold text-lg mb-2">¿Eliminar producto?</h3>
            <p className="text-gray-400 text-sm mb-6">
              "{confirmEliminar.nombre}" será eliminado permanentemente.
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