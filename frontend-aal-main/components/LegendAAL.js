// components/LegendAAL.js
const colors = ['#1a9850', '#d9ef8b', '#fee08b', '#fc8d59', '#d73027', '#7f0000'];

// Fungsi Jenks Natural Breaks (5 atau 6 kelas)
function jenks(data, n_classes) {
  if (!Array.isArray(data) || data.length === 0) return [];
  data = data.slice().sort((a, b) => a - b);
  const matrices = Array(data.length + 1).fill(0).map(() => Array(n_classes + 1).fill(0));
  const variances = Array(data.length + 1).fill(0).map(() => Array(n_classes + 1).fill(0));
  for (let i = 1; i <= n_classes; i++) {
    matrices[0][i] = 1;
    variances[0][i] = 0;
    for (let j = 1; j <= data.length; j++) {
      variances[j][i] = Infinity;
    }
  }
  for (let l = 1; l <= data.length; l++) {
    let sum = 0, sumSquares = 0, w = 0;
    for (let m = 1; m <= l; m++) {
      const i3 = l - m + 1;
      const val = data[i3 - 1];
      w++;
      sum += val;
      sumSquares += val * val;
      const variance = sumSquares - (sum * sum) / w;
      if (i3 !== 1) {
        for (let j = 2; j <= n_classes; j++) {
          if (variances[l][j] >= (variance + variances[i3 - 1][j - 1])) {
            matrices[l][j] = i3;
            variances[l][j] = variance + variances[i3 - 1][j - 1];
          }
        }
      }
    }
    matrices[l][1] = 1;
    variances[l][1] = sumSquares - (sum * sum) / w;
  }
  const k = data.length;
  const kclass = Array(n_classes + 1).fill(0);
  kclass[n_classes] = data[data.length - 1];
  kclass[0] = data[0];
  let countNum = n_classes;
  let kTmp = k;
  while (countNum > 1) {
    kclass[countNum - 1] = data[matrices[kTmp][countNum] - 2];
    kTmp = matrices[kTmp][countNum] - 1;
    countNum--;
  }
  return kclass;
}

export default function LegendAAL({ geojson, hazard, period, model }) {
  if (!hazard || !period || !model) return null;
  if (!geojson || !geojson.features || geojson.features.length === 0) {
    return (
      <div className="absolute top-2 left-2 z-50 opacity-75 pointer-events-none">
        <div className="bg-white border border-gray-200 rounded-lg shadow px-4 py-3">
          <div className="font-semibold text-gray-700 mb-2">Legenda Nilai Kerugian (Rupiah)</div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="inline-block w-6 h-4 rounded" style={{ background: colors[0], border: '1px solid #ccc' }} />
              <span className="text-sm text-gray-700">Rp 0 – Rp 0</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const metric = `aal_${hazard}_${period}_${model === 'total' ? 'total' : model}`;
  const vals = geojson.features.map(f => f.properties[metric] || 0).filter(v => typeof v === 'number' && !isNaN(v));
  const min = Math.min(...vals), max = Math.max(...vals);

  // Pilih jumlah kelas (5 atau 6)
  const nClass = vals.length > 30 ? 6 : 5;
  let grades = jenks(vals, nClass);
  // Pastikan grades urut naik
  grades = grades.sort((a, b) => a - b);

  return (
    <div className="flex flex-col items-start mt-4">
      <div className="bg-white/90 border border-gray-200 rounded-lg shadow px-4 py-3">
        <div className="font-semibold text-gray-700 mb-2">Average Annual Loss (Rupiah)</div>
        <div className="flex flex-col gap-1">
          {Array.from({ length: nClass }).map((_, i) => {
            const low  = Math.ceil(grades[i]   / 1e6);
            const high = Math.ceil(grades[i+1] / 1e6);
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="inline-block w-6 h-4 rounded" style={{ background: colors[i], border: '1px solid #ccc' }} />
                <span className="text-sm text-gray-700">
                  {`Rp ${low}M`} – {`Rp ${high}M`}
                </span>
              </div>
          )})}
        </div>
      </div>
    </div>
  );
}