// pages/about.js
import Header from '../components/Header'

const leadership = [
  {
    name: 'Oloan Yesmando Nainggolan',
    role: '15121020',
    imageUrl: '/oloan.jpg',
  },
  {
    name: 'Celine Deandra Romandiza',
    role: '15121032',
    imageUrl: '/celine.jpg',
  },
  {
    name: 'Bintang Maulana Magribi',
    role: '15121039',
    imageUrl: '/bintang.jpg',
  },
  {
    name: 'Fortuna Mahardikasuci',
    role: '15121055',
    imageUrl: '/fortuna.jpg',
  },
]

export default function About() {
  return (
    <div className="min-h-screen bg-[#0D0F12] text-gray-200">
      <Header />

      <main className="max-w-screen mx-auto py-10 px-6 space-y-6 mt-18">
        <div className="mx-auto max-w-7xl">
          {/* Intro */}
          <div className="max-w-2xl mb-12">
            <h1 className="text-4xl font-semibold text-[#ff6a00]">
              Capstone AAL
            </h1>
            <p className="mt-4 text-lg text-[#22D3EE] text-justify">
              CardinAAL dikembangkan oleh tim yang terdiri dari mahasiswa Program Studi Teknik
              Geodesi dan Geomatika 2021 untuk memenuhi SKS mata kuliah GD4201 Capstone Project.
              Kami berkomitmen untuk membangun platform yang berguna dan mudah digunakan untuk
              menghitung kerugian tahunan rata-rata (AAL) dan kerugian langsung (Direct Loss)
              akibat bencana alam di Indonesia.
            </p>
          </div>

          {/* Kelompok */}
          <div className="">
            <h2 className="text-3xl font-semibold text-[#ff6a00] mb-6">
              Meet our Team
            </h2>
            <ul role="list" className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
              {leadership.map((person) => (
                <li key={person.name} className="flex items-center gap-x-6">
                  <img
                    src={person.imageUrl}
                    alt={person.name}
                    className="h-70 w-70 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-[#22D3EE]">
                      {person.name}
                    </h3>
                    <p className="text-lg text-[#ff6a00]">{person.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
