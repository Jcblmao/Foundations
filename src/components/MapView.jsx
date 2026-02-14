import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix Leaflet default marker icons for bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

export default function MapView({ properties, mapCenter, onViewDetails }) {
  const geocodedProperties = properties.filter(p => p.latitude && p.longitude);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
      {geocodedProperties.length === 0 ? (
        <div className="p-12 text-center">
          <MapPin className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">No properties on map</h3>
          <p className="text-slate-400 dark:text-slate-500">Use the "Locate" button next to the postcode field when editing a property to add it to the map.</p>
        </div>
      ) : (
        <MapContainer center={mapCenter} zoom={11} style={{ height: '70vh', width: '100%' }} className="z-0">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {geocodedProperties.map(property => (
            <Marker key={property.id} position={[parseFloat(property.latitude), parseFloat(property.longitude)]}>
              <Popup>
                <div className="text-sm min-w-[180px]">
                  <p className="font-semibold text-slate-800">{property.address}</p>
                  {property.postcode && <p className="text-slate-500 text-xs">{property.postcode}</p>}
                  {property.price && <p className="text-emerald-600 font-bold mt-1">£{parseInt(property.price).toLocaleString()}</p>}
                  <p className="text-slate-600 text-xs mt-1">{property.bedrooms} bed, {property.bathrooms} bath</p>
                  <button onClick={() => onViewDetails(property.id)} className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium">View Details →</button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}
