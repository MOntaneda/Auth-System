export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPassword = (pwd) =>
  typeof pwd === 'string' && pwd.length >= 8 && /[A-Z]/.test(pwd) && /\d/.test(pwd);

export const isValidUsername = (u) =>
  typeof u === 'string' && /^[a-zA-Z0-9_]{3,50}$/.test(u);

export const validateRegister = ({ username, email, password }) => {
  const errors = [];
  if (!isValidUsername(username)) errors.push('Usuario inválido (3-50 chars, alfanumérico/_).');
  if (!isValidEmail(email)) errors.push('Email inválido.');
  if (!isValidPassword(password))
    errors.push('La contraseña debe tener 8+ caracteres, 1 mayúscula y 1 número.');
  return errors;
};