import { useEffect, useState } from "react";
import Header from "@/components/Shared/Header";
import PageTab from "@/components/Shared/PageTab";
import BrandQuickList from "@/components/Brands/BrandInfo/BrandQuickList";
import "@/SCSS/Brands/BrandMap.scss"; // ✅ Still reuse SCSS

interface Manufacturer {
  _id: string;
  brand: string;
  slug: string;
  logo: string;
  country: string[];
}

export default function Brands() {
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
    <div className="brands">
      <PageTab title="Brands">
        <Header text="Brands" />
        
        {/* ✅ Show the Jump List (grouped properly) */}
        <BrandQuickList manufacturers={manufacturers} />
        
        {/* ❌ Commented out for now (no map) */}
        {/* <MapDisplay manufacturers={manufacturers} /> */}
      </PageTab>
    </div>
  );
}
