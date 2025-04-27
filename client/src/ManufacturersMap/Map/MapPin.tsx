import { useNavigate } from "react-router-dom";
import { Marker } from "react-map-gl";

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
      latitude={manufacturer.location.lat}
      longitude={manufacturer.location.lng}
      anchor="bottom"
    >
      <button
        className="map-pin"
        onClick={() => navigate(`/manufacturers/${manufacturer.slug}`)}
      >
        📍
      </button>
    </Marker>
  );
}
