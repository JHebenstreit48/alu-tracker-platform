import Map, { NavigationControl } from "react-map-gl";
import MapPin from "@/ManufacturersMap/Map/MapPin";
import "@/SCSS/Brands/BrandMap.scss"; // ✅ Import SCSS

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
          initialViewState={{
            latitude: 20,
            longitude: 0,
            zoom: 2,
          }}
          style={{ width: "100%", height: "600px" }}
          maxBounds={[-180, -85, 180, 85]} // ✅ Prevent infinite scrolling around globe
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
