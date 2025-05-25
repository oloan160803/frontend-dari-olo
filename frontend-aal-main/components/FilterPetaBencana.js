import Select from './ui/Select'

const layerGroups = [
  {
    label: 'Gempa Bumi',
    options: [
      { value: 'hazard_gempa_mmi_100', label: 'Gempa Bumi MMI 100' },
      { value: 'hazard_gempa_mmi_250', label: 'Gempa Bumi MMI 250' },
      { value: 'hazard_gempa_mmi_500', label: 'Gempa Bumi MMI 500' }
    ]
  },
  {
    label: 'Banjir',
    options: [
      { value: 'hazard_banjir_depth_25', label: 'Banjir Depth 25' },
      { value: 'hazard_banjir_depth_50', label: 'Banjir Depth 50' },
      { value: 'hazard_banjir_depth_100', label: 'Banjir Depth 100' }
    ]
  },
  {
    label: 'Longsor',
    options: [
      { value: 'hazard_longsor_mflux_2', label: 'Longsor MFlux 2' },
      { value: 'hazard_longsor_mflux_5', label: 'Longsor MFlux 5' }
    ]
  },
  {
    label: 'Gunung Berapi',
    options: [
      { value: 'hazard_gunungberapi_kpa_50', label: 'Gunung Berapi KPA 50' },
      { value: 'hazard_gunungberapi_kpa_100', label: 'Gunung Berapi KPA 100' },
      { value: 'hazard_gunungberapi_kpa_250', label: 'Gunung Berapi KPA 250' }
    ]
  }
]

export default function FilterPetaBencana({ layer, setLayer }) {
  return (
    <div className="rounded-lg p-2 shadow flex flex-col md:flex-row gap-2 items-center w-fit">
      <Select
        id="layerSelect"
        value={layer}
        onChange={setLayer}
        options={layerGroups.flatMap(group =>
          group.options.map(opt => ({
            ...opt,
            group: group.label
          }))
        )}
        groupBy="group"
        placeholder="Pilih Bencana"
        className="w-64"
      />
    </div>
  )
}