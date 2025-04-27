import { Marker } from "react-map-gl";
import { useNavigate } from "react-router-dom";

interface Manufacturer {
  _id: string;
  brand: string;
  slug: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface MapPinProps {
  manufacturer: Manufacturer;
}

export default function MapPin({ manufacturer }: MapPinProps) {
  const navigate = useNavigate();

  return (
    <Marker
      longitude={manufacturer.location.lng}
      latitude={manufacturer.location.lat}
      anchor="bottom"
    >
      <button
        className="map-pin"
        title={manufacturer.brand}
        onClick={() => navigate(`/manufacturers/${manufacturer.slug}`)}
      >
        📍
      </button>
    </Marker>
  );
}
