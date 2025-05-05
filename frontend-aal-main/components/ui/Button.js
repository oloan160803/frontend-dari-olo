// components/ui/Button.js
export default function Button({
    children,
    onClick,
    className = '',
    ...props
  }) {
    return (
      <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg shadow ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
  