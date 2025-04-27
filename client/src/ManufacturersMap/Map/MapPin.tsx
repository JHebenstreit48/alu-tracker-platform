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
  const { lat, lng } = manufacturer.location;

  if (
    typeof lat !== "number" || typeof lng !== "number" ||
    lat < -90 || lat > 90 || lng < -180 || lng > 180
  ) {
    console.warn("Invalid coordinates for:", manufacturer);
    return null;
  }

  return (
    <Marker longitude={lng} latitude={lat} anchor="bottom">
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
