// components/ChartsSection.js
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'

const hazards = [
  { key: 'gempa',        label: 'Gempa Bumi',    periods: ['500','250','100'], colors: ['#2563eb','#60a5fa','#a5b4fc'] },
  { key: 'banjir',       label: 'Banjir',         periods: ['100','50','25'],   colors: ['#22c55e','#86efac','#bbf7d0'] },
  { key: 'longsor',      label: 'Longsor',        periods: ['5','2'],           colors: ['#f59e42','#fde68a'] },
  { key: 'gunungberapi', label: 'Gunung Berapi', periods: ['250','100','50'], colors: ['#e11d48','#f472b6','#fbcfe8'] },
]

const allPeriods = Array.from(
  new Set(hazards.flatMap(h => h.periods))
).sort((a, b) => +b - +a)

const charts = [
  { title: 'Semua Bangunan', tipe: 'total' },
  { title: 'Bangunan Milik Negara', tipe: 'bmn' },
  { title: 'Fasilitas Kesehatan', tipe: 'fs' },
  { title: 'Fasilitas Pendidikan', tipe: 'fd' },
]

export default function ChartsSection({ provs, data, load }) {
  const buildData = (tipe) =>
    hazards.map((hz) => {
      const obj = { bencana: hz.label }
      allPeriods.forEach((p) => {
        obj[p] = hz.periods.includes(p)
          ? data?.[`aal_${hz.key}_${p}_${tipe}`] ?? 0
          : null
      })
      return obj
    })

  return (
    <section className="p-6">
      <div className="mb-4">
        <select
          className="w-72 rounded-4xl bg-[#C6FF00] px-4 py-2 text-black appearance-none"
          defaultValue=""
          onChange={(e) => load(e.target.value)}
        >
          <option value="" disabled>Pilih Provinsi</option>
          {provs.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {charts.map(({ title, tipe }) => {
          const chartData = buildData(tipe)
          return (
            <div key={tipe} className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white text-center mb-2">{title}</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, bottom: 40, left: -20 }}
                  barCategoryGap="90%"
                  barGap={50}
                >
                  <CartesianGrid stroke="#444" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="bencana"
                    tick={{ fill: '#ddd', fontSize: 14 }}
                    angle={0}
                    textAnchor="middle"
                    interval={0}
                    height={10}
                  />
                  <YAxis
                    tickFormatter={(v) => {
                      const len = Math.round(v).toString().length
                      if (len > 12) return Math.round(v/1e12) + 'T'
                      if (len > 9 ) return Math.round(v/1e9)  + 'M'
                      if (len > 6 ) return Math.round(v/1e6)  + 'JT'
                      return v.toLocaleString('id-ID')
                    }}
                    tick={{ fill: '#ddd', fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <div className="bg-gray-800 text-white p-2 rounded">
                          <strong>{`Bencana: ${label}`}</strong>
                          {payload
                            .filter((pl) => pl.value != null)
                            .map((pl) => (
                              <div key={pl.name} style={{ color: pl.fill, marginTop: 4 }}>
                                Return period {pl.name} tahun:{' '}
                                {pl.value.toLocaleString('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR',
                                  minimumFractionDigits: 0,
                                })}
                              </div>
                            ))}
                        </div>
                      ) : null
                    }
                  />
                  <Legend
                    wrapperStyle={{ bottom: 10, left: '50%', transform: 'translateX(-50%)' }}
                    iconSize={10}
                    formatter={(v) => `${v} th`}
                  />

                  {allPeriods.map((period) => {
                    const hz = hazards.find((h) => h.periods.includes(period))
                    const color = hz ? hz.colors[hz.periods.indexOf(period)] : '#888'
                    return (
                      <Bar
                        key={period}
                        dataKey={period}
                        fill={color}
                        barSize={20}
                        radius={[4,4,0,0]}
                      />
                    )
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )
        })}
      </div>
    </section>
  )
}
