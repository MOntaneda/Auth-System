const Button = ({ children, loading, ...props }) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white
      hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed
      transition-colors"
  >
    {loading ? 'Procesando…' : children}
  </button>
);

export default Button;