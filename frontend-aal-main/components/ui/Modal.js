// components/ui/Modal.js
export default function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
        <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-lg relative">
          <div className="overflow-y-auto max-h-[80vh]">
            {children}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }
  