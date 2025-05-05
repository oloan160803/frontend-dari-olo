// components/Header.js
export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center gap-4">
        <div className="bg-white rounded-full p-2 shadow flex items-center justify-center w-12 h-12">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="18" fill="#2563eb"/>
            <path d="M12 26V10H17C21 10 24 13 24 17C24 21 21 24 17 24H15V26H12ZM15 22H17C19.7614 22 22 19.7614 22 17C22 14.2386 19.7614 12 17 12H15V22Z" fill="white"/>
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">CARDINAL</h1>
          <p className="text-sm text-blue-100">
            Calculation for Direct and Average Annual Loss
          </p>
        </div>
      </div>
    </header>
  );
}
