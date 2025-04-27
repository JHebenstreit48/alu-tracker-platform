import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "@/SCSS/Brands/BrandInfo.scss";

interface Manufacturer {
  _id: string;
  brand: string;
  slug: string;
  description: string;
  logo: string;
  country: string[];
  established: number;
  headquarters?: string;
  primaryMarket?: string;
  location: { lat: number; lng: number };
  resources?: { text: string; url: string }[];
}

export default function BrandInfo() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [manufacturer, setManufacturer] = useState<Manufacturer | null>(null);
  const [error, setError] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

  useEffect(() => {
    fetch(`${API_BASE_URL}/manufacturers`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: Manufacturer[]) => {
        const found = data.find((item) => item.slug === slug);
        if (found) {
          setManufacturer(found);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
  }, [slug, API_BASE_URL]);

  const handleGoBack = () => navigate(-1);

  if (error) {
    return <div className="error-message">Brand not found or failed to load.</div>;
  }

  if (!manufacturer) {
    return <div className="loading-message">Loading brand details...</div>;
  }

  // ✅ Corrected logo URL construction
  const logoUrl = manufacturer.logo.startsWith("http")
  ? manufacturer.logo
  : import.meta.env.DEV
    ? `http://localhost:3001${manufacturer.logo}`
    : `${manufacturer.logo}`;

console.log("✅ Logo URL being used:", logoUrl);

  return (
    <div className="brand-info-page">
      <button className="backBtn" onClick={handleGoBack}>
        Back
      </button>

      <h1 className="brand-name">{manufacturer.brand}</h1>

      {manufacturer.logo && (
        <img
          src={logoUrl}
          alt={`${manufacturer.brand} logo`}
          className="brand-logo"
          loading="lazy"
        />
      )}

      <p className="brand-description">{manufacturer.description}</p>

      <ul className="brand-details">
        <li><strong>Country:</strong> {manufacturer.country.join(", ")}</li>
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
            {manufacturer.resources.map((res, idx) => (
              <li key={idx}>
                <a href={res.url} target="_blank" rel="noopener noreferrer">
                  {res.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
