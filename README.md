# 📊 Dashboard Restaurante

![Deploy](https://img.shields.io/badge/Deploy-Vercel-black)
![React](https://img.shields.io/badge/React-18-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8)
![Vite](https://img.shields.io/badge/Vite-5-646cff)

Panel de gestión y reportes para administradores y gerentes de restaurante. Consume la [API REST de Restaurante](https://github.com/Desarrollo13/Api_Rest_Resto).

---

## 🌐 Demo en vivo

**Dashboard:** https://dashboard-restaurante-theta.vercel.app

| Usuario demo | Contraseña | Rol |
|---|---|---|
| root | (contactar) | Administrador |

---

## ✨ Funcionalidades

### 📊 Resumen del día
- Total vendido, órdenes cerradas, en cocina y listas para cobrar
- Desglose por método de pago (efectivo, tarjeta, transferencia)
- Gráfico de ventas de los últimos 6 meses
- Exportar reporte a **PDF** y **Excel**
- Refresh automático cada 60 segundos

### 📋 Órdenes
- Lista de órdenes del día con estado en tiempo real
- Filtros por estado (abierta, en cocina, lista, cerrada, cancelada)
- Contadores por estado
- Filtro por fecha
- Refresh automático cada 30 segundos

### 🪑 Mesas y Reservas
- Mapa visual del estado de cada mesa (disponible, ocupada, reservada)
- Crear y gestionar reservas con validación de horarios
- Confirmar, cancelar y completar reservas
- Estado de mesa se actualiza automáticamente con las reservas
- Refresh automático cada 30 segundos

### 🍽️ Gestión de Menú
- CRUD completo de categorías y productos
- Toggle de disponibilidad por producto
- Búsqueda y filtro por categoría
- Stats de productos totales, disponibles y categorías

### 👤 Gestión de Usuarios
- CRUD completo de usuarios con 5 roles
- Filtro por rol y búsqueda por nombre
- Cambio de contraseña desde el dashboard
- Stats de usuarios por rol

### 📈 Productos más vendidos
- Ranking con gráfico de barras horizontal
- Filtro por período (7, 30 o 90 días)
- Tabla con cantidad vendida y total generado
- Exportar a **PDF** y **Excel**

### 👥 Rendimiento por mozo
- Órdenes y total vendido por cada mozo
- Filtro por fecha
- Exportar a **PDF** y **Excel**

---

## 🛠️ Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18 | Framework frontend |
| Vite | 5 | Bundler y dev server |
| Tailwind CSS | 4 | Estilos |
| Recharts | — | Gráficos de ventas |
| Axios | — | HTTP client con interceptores JWT |
| React Router | 6 | Navegación |
| React Hot Toast | — | Notificaciones |
| jsPDF + autoTable | — | Exportación a PDF |
| SheetJS (xlsx) | — | Exportación a Excel |

---

## 🔐 Acceso

Solo pueden acceder usuarios con rol **administrador** o **gerente**. Los demás roles (mozo, cocinero, cajero) usan la [App Mozo](https://github.com/Desarrollo13/app-mozo).

```
Login → valida rol → redirige al dashboard
Si el rol no es admin/gerente → error de acceso
```

---

## 🚀 Instalación local

### Requisitos
- Node.js 18+
- La API REST corriendo (local o producción)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Desarrollo13/dashboard-restaurante.git
cd dashboard-restaurante

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del backend
```

### Variables de entorno

```bash
# .env
VITE_API_URL=http://localhost:8000/api   # desarrollo local
# VITE_API_URL=https://restaurante-api-e5mv.onrender.com/api  # producción
```

```bash
# 4. Correr en desarrollo
npm run dev

# 5. Build para producción
npm run build
```

---

## 📁 Estructura del proyecto

```
dashboard-restaurante/
├── src/
│   ├── api/
│   │   └── axios.js          ← cliente HTTP con interceptores JWT
│   ├── components/
│   │   ├── Layout.jsx        ← layout con sidebar
│   │   ├── Sidebar.jsx       ← navegación lateral
│   │   ├── PrivateRoute.jsx  ← protección de rutas
│   │   └── BotonesExport.jsx ← botones PDF/Excel reutilizables
│   ├── context/
│   │   └── AuthContext.jsx   ← estado global de autenticación
│   ├── hooks/
│   │   ├── useAutoRefresh.js ← refresh automático configurable
│   │   └── useExport.js      ← exportación a PDF y Excel
│   ├── pages/
│   │   ├── Login.jsx         ← autenticación con validación de rol
│   │   ├── Dashboard.jsx     ← resumen del día + gráfico mensual
│   │   ├── Ordenes.jsx       ← órdenes con filtros en tiempo real
│   │   ├── Mesas.jsx         ← mesas y reservas
│   │   ├── Menu.jsx          ← CRUD de menú
│   │   ├── Usuarios.jsx      ← CRUD de usuarios
│   │   ├── Productos.jsx     ← ranking de productos
│   │   └── Mozos.jsx         ← rendimiento por mozo
│   └── App.jsx               ← rutas de la aplicación
├── .env.example
├── vite.config.js
└── package.json
```

---

## 🔄 Flujo de autenticación

```
1. Usuario ingresa credenciales
2. POST /api/auth/token/ → recibe access + refresh token + rol
3. Si rol es admin o gerente → accede al dashboard
4. Token se guarda en localStorage
5. Axios interceptor agrega el token en cada request
6. Si el token expira → interceptor hace refresh automático
7. Logout → invalida el refresh token en el backend
```

---

## 📡 Conexión con el backend

Todos los endpoints se consumen a través del cliente Axios configurado en `src/api/axios.js`:

```javascript
// Ejemplo de uso en una página
import api from '../api/axios'

// GET con query params
const { data } = await api.get('/reportes/resumen/')

// POST con body
await api.post('/mesas/', { numero: 5, capacidad: 4 })

// PATCH parcial
await api.patch(`/reservas/${id}/confirmar/`)

// DELETE
await api.delete(`/menu/${id}/`)
```

---

## 🔗 Proyectos relacionados

| Proyecto | Descripción | Link |
|---|---|---|
| **API REST** | Backend Django + PostgreSQL | [Ver repo](https://github.com/Desarrollo13/Api_Rest_Resto) |
| **App Mozo** | App móvil para el personal | [Ver repo](https://github.com/Desarrollo13/app-mozo) |

---

## 👨‍💻 Autor

**Cristian** — [@Desarrollo13](https://github.com/Desarrollo13)