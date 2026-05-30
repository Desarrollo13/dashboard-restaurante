// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// src/components/Sidebar.jsx — actualizá el array links
// src/components/Sidebar.jsx
const links = [
  { to: '/',          icon: '📊', label: 'Resumen'   },
  { to: '/ordenes',   icon: '📋', label: 'Órdenes'   },
  { to: '/menu',      icon: '🍽️', label: 'Menú'      },
  { to: '/usuarios',  icon: '👤', label: 'Usuarios'  }, // ← nuevo
  { to: '/productos', icon: '📈', label: 'Productos' },
  { to: '/mozos',     icon: '👥', label: 'Mozos'     },
]
export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="w-64 bg-gray-900 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-white text-xl font-bold">🍽️ Restaurante</h1>
        <p className="text-gray-400 text-sm mt-1">{user?.nombre || user?.rol}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-medium
              ${isActive
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="w-full text-left px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition text-sm"
        >
          🚪 Cerrar sesión
        </button>
      </div>
    </aside>
  )
}