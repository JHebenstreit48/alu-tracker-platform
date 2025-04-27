import { useEffect, useState } from "react";
import Header from "@/components/Header";
import PageTab from "@/components/PageTab";
import MapDisplay from "@/ManufacturersMap/Map/MapDisplay";
import BrandQuickList from "@/ManufacturersMap/BrandInfo/BrandQuickList";
import "@/SCSS/Brands/BrandMap.scss"; // ✅ Import SCSS

interface Manufacturer {
  _id: string;
  brand: string;
  slug: string;
  logo: string;
  location: {
    lat: number;
    lng: number;
  };
}

export default function ManufacturersMap() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [error, setError] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

  useEffect(() => {
    fetch(`${API_BASE_URL}/manufacturers`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setManufacturers(data))
      .catch(() => setError(true));
  }, [API_BASE_URL]);

  if (error) return <div className="error-message">Failed to load manufacturers.</div>;

  return (
    <div className="manufacturers-map-page">
      <PageTab title="Manufacturers Map">
        <Header text="Manufacturers Map" />
        <MapDisplay manufacturers={manufacturers} />
        <BrandQuickList manufacturers={manufacturers} />
      </PageTab>
    </div>
  );
}
