import Map, { NavigationControl } from "react-map-gl";
import type { Map as MapboxMap } from "mapbox-gl";
import mapboxgl from "mapbox-gl";
import { useRef, useEffect, useState } from "react";
import MapPin from "@/ManufacturersMap/Map/MapPin";
import "@/SCSS/Brands/BrandMap.scss";

interface Manufacturer {
  _id: string;
  brand: string;
  slug: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface MapDisplayProps {
  manufacturers: Manufacturer[];
}

export default function MapDisplay({ manufacturers }: MapDisplayProps) {
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
  const MAPBOX_STYLE_URL = import.meta.env.VITE_MAPBOX_STYLE_URL;

  const mapRef = useRef<MapboxMap | null>(null);

  const [viewState, setViewState] = useState({
    latitude: 20,
    longitude: 0,
    zoom: 2,
  });

  useEffect(() => {
    if (manufacturers.length > 0 && mapRef.current) {
      const map = mapRef.current;
      
      if (manufacturers.length === 1) {
        const { location } = manufacturers[0];
        map.flyTo({
          center: [location.lng, location.lat],
          zoom: 5,
          duration: 1000,
        });
      } else {
        const bounds = new mapboxgl.LngLatBounds();

        manufacturers.forEach(({ location }) => {
          bounds.extend([location.lng, location.lat]);
        });

        map.fitBounds(bounds, {
          padding: 80,
          duration: 1000,
        });
      }
    }
  }, [manufacturers]);

  if (!MAPBOX_TOKEN || !MAPBOX_STYLE_URL) {
    console.error("Missing Mapbox Token or Style URL in environment variables.");
    return <div className="error-message">Map configuration missing.</div>;
  }

  return (
    <div className="map-wrapper">
      <div className="map-container">
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle={MAPBOX_STYLE_URL}
          viewState={viewState}
          onMoveEnd={(evt: { viewState: typeof viewState }) => setViewState(evt.viewState)}
          style={{ width: "100%", height: "100%" }}
          maxBounds={[-180, -85, 180, 85]}
          attributionControl={true}
          ref={mapRef}
        >
          <NavigationControl position="top-left" />
          {manufacturers.map((manufacturer) => (
            <MapPin key={manufacturer._id.toString()} manufacturer={manufacturer} />
          ))}
        </Map>
      </div>
    </div>
  );
}
