// components/ui/Select.js cukiii
export default function Select({
  id,
  value,
  onChange,
  options,
  disabled = false,
  placeholder = '— Pilih —',
  className = ''
}) {
  return (
    <select
      id={id}
      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
        disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
      } ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      <option key="default" value="">{placeholder}</option>
      {options.map((opt, index) => {
        // Handle both string and object options
        const value = typeof opt === 'object' ? opt.value : opt;
        const label = typeof opt === 'object' ? opt.label : opt;
        return (
          <option key={`${id}-${index}-${value}`} value={value}>
            {label}
          </option>
        );
      })}
    </select>
  );
}