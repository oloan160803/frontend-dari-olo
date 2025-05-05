// components/ChoroplethMap.js
import { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const colors = ['#d73027', '#fc8d59', '#fee08b', '#d9ef8b', '#1a9850'];

export default function ChoroplethMap({ geojson, hazard, period, model }) {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const legendRef = useRef(null);

  useEffect(() => {
    mapRef.current = L.map(mapEl.current, { zoomControl: false }).setView([-2.5, 118], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OSM'
    }).addTo(mapRef.current);
    L.control.zoom({ position: 'topright' }).addTo(mapRef.current);
    return () => mapRef.current.remove();
  }, []);

  useEffect(() => {
    if (!geojson || !hazard || !period || !model) return;

    // clear old
    if (layerRef.current) {
      mapRef.current.removeLayer(layerRef.current);
      mapRef.current.removeControl(legendRef.current);
    }

    // build breaks
    const metric = `aal_${hazard}_${period}_${model === 'total' ? 'total' : model}`;
    const vals = geojson.features.map(f => f.properties[metric] || 0);
    const min = Math.min(...vals), max = Math.max(...vals);
    const breaks = [
      min + (max - min) * 0.2,
      min + (max - min) * 0.4,
      min + (max - min) * 0.6,
      min + (max - min) * 0.8
    ];

    layerRef.current = L.geoJSON(geojson, {
      style: feature => {
        const v = feature.properties[metric] || 0;
        let c = colors[0];
        for (let i = breaks.length - 1; i >= 0; i--) {
          if (v >= breaks[i]) {
            c = colors[i + 1];
            break;
          }
        }
        return { fillColor: c, weight: 1, color: '#fff', fillOpacity: 0.7 };
      }
    }).addTo(mapRef.current);

    // legend
    legendRef.current = L.control({ position: 'bottomright' });
    legendRef.current.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');
      const grades = [min, ...breaks, max];
      let html = '';
      for (let i = 0; i < grades.length - 1; i++) {
        html +=
          `<i style="background:${colors[i]}"></i> ` +
          `${Math.round(grades[i]).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits:0 })}` +
          ' – ' +
          `${Math.round(grades[i + 1]).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits:0 })}` +
          '<br>';
      }
      div.innerHTML = html;
      return div;
    };
    legendRef.current.addTo(mapRef.current);
  }, [geojson, hazard, period, model]);

  return <div id="map" ref={mapEl} className="h-[90vh] w-full" />;
}
