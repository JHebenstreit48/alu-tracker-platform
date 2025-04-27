import { useParams, useNavigate } from "react-router-dom"; // Added useNavigate for navigation
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
  const navigate = useNavigate(); // Hook for navigation

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
      .catch(() => {
        setError(true);
      });
  }, [slug, API_BASE_URL]);

  // Back button handler
  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  if (error) {
    return <div className="error-message">Brand not found or failed to load.</div>;
  }

  if (!manufacturer) {
    return <div className="loading-message">Loading brand details...</div>;
  }

  // Force absolute logo URL directly in the render logic
  const logoUrl = `http://localhost:3001${manufacturer.logo}`;

  return (
    <div className="brand-info-page">
      {/* Back Button */}
      <div>
        <button className="backBtn" onClick={handleGoBack}>
          Back
        </button>
      </div>

      <h1 className="brand-name">{manufacturer.brand}</h1>

      {manufacturer.logo && (
        <img
          src={logoUrl}
          alt={`${manufacturer.brand} logo`}
          className="brand-logo"
          loading="lazy" // Improvement: lazy loading for images
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
