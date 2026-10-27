# 🏗️ Contexto del Proyecto: Auth System (Nivel Producción)

## 📌 Visión General
Sistema full-stack de autenticación (Login y Registro) escalable, seguro y modular. Implementa las mejores prácticas de la industria: Refresh Tokens automáticos, Rate Limiting (protección contra fuerza bruta), notificaciones Toast y persistencia de sesión.

## 🛠️ Stack Tecnológico
*   **Frontend:** React 18 (con Vite), Tailwind CSS v4 (configurado vía plugin Vite), React Router DOM v6, Axios, React Hot Toast.
*   **Backend:** Node.js (ES Modules), Express, MySQL (mysql2/promise), JWT, Bcryptjs, Express Rate Limit.
*   **Base de Datos:** MySQL.
*   **Entorno:** Windows (PowerShell), VS Code.

## 📂 Estructura de Directorios
```text
auth-system/
├── back/                  # Backend (Node.js/Express)
│   ├── config/            # Conexión a BD (db.js)
│   ├── controllers/       # Lógica de negocio (authController.js)
│   ├── middlewares/       # Protección de rutas (authMiddleware.js)
│   ├── routes/            # Endpoints con Rate Limiting (authRoutes.js)
│   ├── utils/             # Funciones de validación (validators.js)
│   ├── .env               # Variables de entorno (NO se sube a Git)
│   └── server.js          # Punto de entrada (incluye app.set('trust proxy', 1))
│
├── front/                 # Frontend (React/Vite)
│   ├── src/
│   │   ├── api/           # Axios con Interceptores (axios.js)
│   │   ├── components/    # Componentes UI
│   │   │   ├── common/    # Input (con ojito), Button, Alert
│   │   │   └── ProtectedRoute.jsx # Guardia de rutas con Loader
│   │   ├── context/       # Estado global (AuthContext.jsx)
│   │   ├── pages/         # Vistas (Login, Register, Dashboard)
│   │   ├── App.jsx        # Enrutamiento y Toaster Global
│   │   └── index.css      # Configuración de Tailwind v4 (@theme)
│   ├── vite.config.js     # Configuración de Vite + Tailwind v4
│   └── package.json
│
└── database/              
    └── schema.sql         # Creación de la BD y tabla users