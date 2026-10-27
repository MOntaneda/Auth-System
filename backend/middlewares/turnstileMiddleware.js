export const verifyTurnstile = async (req, res, next) => {
  const { turnstileToken } = req.body;

  if (!turnstileToken) {
    return res.status(400).json({ message: 'Token de seguridad requerido (Captcha)' });
  }

  try {
    // Validamos el token directamente con la API de Cloudflare
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      return res.status(400).json({ message: 'Validación de Captcha fallida. Inténtalo de nuevo.' });
    }

    // Si es exitoso, pasamos al controlador
    next();
  } catch (error) {
    console.error('Error verificando Turnstile:', error);
    return res.status(500).json({ message: 'Error interno verificando el Captcha' });
  }
};