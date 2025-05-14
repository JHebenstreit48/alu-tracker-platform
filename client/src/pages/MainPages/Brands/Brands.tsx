import { useEffect, useState } from 'react';
import Header from '@/components/Shared/Header';
import PageTab from '@/components/Shared/PageTab';
import BrandQuickList from '@/components/Brands/BrandInfo/BrandQuickList';
import '@/SCSS/Brands/BrandMap.scss';

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

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

  useEffect(() => {
    console.log("🚀 Fetching from:", `${API_BASE_URL}/manufacturers`);
    fetch(`${API_BASE_URL}/api/manufacturers`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("✅ Manufacturers loaded in Brands.tsx:", data);
        setManufacturers(data);
      })
      .catch((err) => {
        console.error('❌ Error loading manufacturers:', err);
        setError(true);
      });
  }, [API_BASE_URL]);

  if (error) {
    return (
      <div className="brands">
        <PageTab title="Brands">
          <Header text="Brands" />
          <div className="error-message">Failed to load manufacturers.</div>
        </PageTab>
      </div>
    );
  }

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
