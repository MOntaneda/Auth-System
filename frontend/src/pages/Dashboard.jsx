import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-8 space-y-4">
        <h1 className="text-2xl font-bold">¡Bienvenido, {user.username}! 👋</h1>
        <p className="text-slate-600">Sesión activa con <b>{user.email}</b></p>
        <p className="text-xs text-slate-400">Rol: {user.role}</p>
        <button
          onClick={logout}
          className="mt-4 rounded-lg bg-slate-800 text-white px-4 py-2 text-sm hover:bg-slate-900"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Dashboard;