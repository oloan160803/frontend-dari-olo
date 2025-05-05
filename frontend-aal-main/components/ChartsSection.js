// components/ChartsSection.js
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'

// Register scales & elements
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const hazards = [
  {
    key: 'gempa',
    label: 'Gempa Bumi',
    periods: ['500', '250', '100'],
    colors: ['#2563eb', '#60a5fa', '#a5b4fc']
  },
  {
    key: 'banjir',
    label: 'Banjir',
    periods: ['100', '50', '25'],
    colors: ['#22c55e', '#86efac', '#bbf7d0']
  },
  {
    key: 'longsor',
    label: 'Longsor',
    periods: ['5', '2'],
    colors: ['#f59e42', '#fde68a']
  },
  {
    key: 'gunungberapi',
    label: 'Gunung Berapi',
    periods: ['250', '100', '50'],
    colors: ['#e11d48', '#f472b6', '#fbcfe8']
  }
];

function buildGroupedDatasets(data, tipe) {
  // tipe: 'total', 'bmn', 'fs', 'fd'
  const datasets = [];
  hazards.forEach((hazard, hIdx) => {
    hazard.periods.forEach((period, pIdx) => {
      datasets.push({
        label: `${hazard.label} ${period}`,
        backgroundColor: hazard.colors[pIdx],
        data: hazards.map((hz, idx) => {
          if (hz.key !== hazard.key) return 0;
          return data?.[`aal_${hz.key}_${period}_${tipe}`] ?? 0;
        })
      });
    });
  });
  return datasets;
}

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: value => 'Rp ' + value.toLocaleString('id-ID', { minimumFractionDigits: 0 })
      }
    },
    x: {
      stacked: false,
      ticks: {
        font: { size: 14 }
      },
      grid: { display: false }
    }
  },
  elements: {
    bar: {
      borderRadius: 8,
      borderSkipped: false,
      barPercentage: 1,
      categoryPercentage: 1
    }
  }
};

export default function ChartsSection({ provs, data, load }) {
  return (
    <section className="p-6">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <select
            className="flex-1 rounded-lg border-gray-300 p-2"
            onChange={e => load(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>Pilih Provinsi</option>
            {provs.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Semua Bangunan */}
          <div className="bg-gray-100 p-4 rounded-xl shadow">
            <h3 className="text-sm font-bold text-gray-700 mb-2">Semua Bangunan</h3>
            <Bar
              data={{
                labels: hazards.map(h => h.label),
                datasets: buildGroupedDatasets(data, 'total')
              }}
              options={chartOptions}
            />
          </div>
          {/* BMN */}
          <div className="bg-gray-100 p-4 rounded-xl shadow">
            <h3 className="text-sm font-bold text-gray-700 mb-2">Bangunan Milik Negara</h3>
            <Bar
              data={{
                labels: hazards.map(h => h.label),
                datasets: buildGroupedDatasets(data, 'bmn')
              }}
              options={chartOptions}
            />
          </div>
          {/* FS */}
          <div className="bg-gray-100 p-4 rounded-xl shadow">
            <h3 className="text-sm font-bold text-gray-700 mb-2">Fasilitas Kesehatan</h3>
            <Bar
              data={{
                labels: hazards.map(h => h.label),
                datasets: buildGroupedDatasets(data, 'fs')
              }}
              options={chartOptions}
            />
          </div>
          {/* FD */}
          <div className="bg-gray-100 p-4 rounded-xl shadow">
            <h3 className="text-sm font-bold text-gray-700 mb-2">Fasilitas Pendidikan</h3>
            <Bar
              data={{
                labels: hazards.map(h => h.label),
                datasets: buildGroupedDatasets(data, 'fd')
              }}
              options={chartOptions}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
