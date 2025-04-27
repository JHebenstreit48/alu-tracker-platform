import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
// import "@/SCSS/ManufacturersMap/BrandInfo.scss"; // Assuming we'll style this separately later

interface Manufacturer {
  _id: string;
  brand: string;
  slug: string;
  description: string;
  logo: string;
  country: string;
  established: number;
  headquarters?: string;
  primaryMarket?: string;
  location: {
    lat: number;
    lng: number;
  };
  resources?: {
    text: string;
    url: string;
  }[];
}

export default function BrandInfo() {
  const { slug } = useParams<{ slug: string }>();
  const [manufacturer, setManufacturer] = useState<Manufacturer | null>(null);
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
      .then((data: Manufacturer[]) => {
        const matchedBrand = data.find((item) => item.slug === slug);
        if (matchedBrand) {
          setManufacturer(matchedBrand);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
  }, [slug, API_BASE_URL]);

  if (error) {
    return <div className="error-message">Brand not found or failed to load.</div>;
  }

  if (!manufacturer) {
    return <div className="loading-message">Loading brand details...</div>;
  }

  return (
    <div className="brand-info-page">
      <h1 className="brand-name">{manufacturer.brand}</h1>

      {manufacturer.logo && (
        <img
          src={manufacturer.logo}
          alt={`${manufacturer.brand} logo`}
          className="brand-logo"
        />
      )}

      <p className="brand-description">{manufacturer.description}</p>

      <ul className="brand-details">
        <li><strong>Country:</strong> {manufacturer.country}</li>
        <li><strong>Established:</strong> {manufacturer.established}</li>
        {manufacturer.headquarters && (
          <li><strong>Headquarters:</strong> {manufacturer.headquarters}</li>
        )}
        {manufacturer.primaryMarket && (
          <li><strong>Primary Market:</strong> {manufacturer.primaryMarket}</li>
        )}
      </ul>

      {manufacturer.resources && manufacturer.resources.length > 0 && (
        <div className="brand-resources">
          <h3>Resources</h3>
          <ul>
            {manufacturer.resources.map((resource, index) => (
              <li key={index}>
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  {resource.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
