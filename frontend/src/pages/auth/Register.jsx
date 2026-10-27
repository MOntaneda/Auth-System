import { useState } from 'react';
import toast from 'react-hot-toast';
//import { Turnstile } from '@marsidev/react-turnstile';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Estados del formulario
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // 🌟 ESTADO FALTANTE: El token del Captcha
  const [turnstileToken, setTurnstileToken] = useState(null);

  const validate = () => {
    const e = {};
    
    if (!/^[a-zA-Z0-9_]{3,50}$/.test(form.username))
      e.username = '3-50 caracteres (letras, números, _)';
      
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) 
      e.email = 'Email inválido';
      
    if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/\d/.test(form.password))
      e.password = '8+ caracteres, 1 mayúscula y 1 número';
      
    if (form.password !== form.confirmPassword) 
      e.confirmPassword = 'Las contraseñas no coinciden';

    // Validación del Captcha
    /* if (!turnstileToken)
      e.captcha = 'Debes completar la verificación de seguridad.'; */

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      // Pasamos el token al backend (que debe estar configurado para recibirlo)
      await register(form.username, form.email, form.password);
      toast.success('Cuenta creada exitosamente');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.errors ? data.errors[0] : (data?.message || 'Error al registrarse');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">Crear cuenta</h1>
          <p className="text-sm text-slate-500 mt-1">Es rápido y seguro</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input
            label="Usuario"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            error={errors.username}
            placeholder="mi_usuario"
            autoComplete="username"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            placeholder="tu@email.com"
            autoComplete="email"
          />
          <Input
            label="Contraseña"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <Input
            label="Confirmar Contraseña"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          
          {/* Widget de Cloudflare Turnstile */}
         {/*  <div className="flex flex-col items-center py-2">
            <Turnstile
              siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
              onSuccess={(token) => setTurnstileToken(token)}
              onError={() => toast.error('Error al cargar el Captcha')}
              onExpire={() => setTurnstileToken(null)}
            />
            {errors.captcha && <p className="text-xs text-red-600 mt-1">{errors.captcha}</p>}
          </div> */}

          <Button type="submit" loading={loading}>Registrarme</Button>
        </form>

        <p className="text-center text-sm text-slate-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;