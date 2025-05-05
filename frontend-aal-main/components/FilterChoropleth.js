// components/FilterChoropleth.js
import Select from './ui/Select';

const periodMap = {
  gempa: ['500', '250', '100'],
  banjir: ['100', '50', '25'],
  longsor: ['5', '2'],
  gunungberapi: ['250', '100', '50']
};

const hazardLabels = {
  gempa: 'Gempa Bumi',
  banjir: 'Banjir',
  longsor: 'Longsor',
  gunungberapi: 'Gunung Berapi'
};

const modelLabels = {
  bmn: 'Bangunan Milik Negara',
  fs: 'Fasilitas Kesehatan',
  fd: 'Fasilitas Pendidikan',
  total: 'Total'
};

export default function FilterChoropleth({
  hazard, setHazard,
  period, setPeriod,
  model, setModel
}) {
  // when hazard changes, reset period & model
  const onHazardChange = (h) => {
    setHazard(h);
    setPeriod('');
    setModel('');
  };

  return (
    <div className="bg-white/80 border border-gray-200 rounded-lg px-2 py-1 mb-2">
      <div className="flex flex-col md:flex-row gap-2 items-center">
        <Select
          id="hazardSelect"
          value={hazard}
          onChange={onHazardChange}
          options={Object.keys(periodMap).map(key => ({
            value: key,
            label: hazardLabels[key]
          }))}
          className="w-full md:w-40"
        />
        <Select
          id="periodSelect"
          value={period}
          onChange={setPeriod}
          options={hazard ? periodMap[hazard].map(p => ({
            value: p,
            label: `${p} tahun`
          })) : []}
          disabled={!hazard}
          className="w-full md:w-40"
        />
        <Select
          id="modelSelect"
          value={model}
          onChange={setModel}
          options={['bmn', 'fs', 'fd', 'total'].map(m => ({
            value: m,
            label: modelLabels[m]
          }))}
          disabled={!period}
          className="w-full md:w-40"
        />
      </div>
    </div>
  );
}
