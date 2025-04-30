import { Link } from "react-router-dom";
import "@/SCSS/Brands/BrandQuickList.scss";
import BackToTop from "@/components/Shared/BackToTopButton";

interface BrandQuickListProps {
  manufacturers: {
    _id: string;
    brand: string;
    slug: string;
    country: string[]; // ✅ Now an array
  }[];
}

export default function BrandQuickList({ manufacturers }: BrandQuickListProps) {
  // Group manufacturers by Country first
  const groupedByCountry = manufacturers.reduce(
    (acc: Record<string, { _id: string; brand: string; slug: string; }[]>, manufacturer) => {
      const countries = manufacturer.country.length > 0 ? manufacturer.country : ["Unknown"];

      countries.forEach((country) => {
        if (!acc[country]) {
          acc[country] = [];
        }
        acc[country].push(manufacturer);
      });

      return acc;
    },
    {}
  );

  // Sort countries alphabetically
  const sortedCountries = Object.keys(groupedByCountry).sort();

  return (
    <div className="brand-quick-list">
      {sortedCountries.map((country) => {
        const countryManufacturers = groupedByCountry[country];

        // Group manufacturers in each country by first letter
        const groupedByLetter = countryManufacturers.reduce(
          (acc: Record<string, { _id: string; brand: string; slug: string; }[]>, manufacturer) => {
            const firstLetter = manufacturer.brand.charAt(0).toUpperCase();
            if (!acc[firstLetter]) {
              acc[firstLetter] = [];
            }
            acc[firstLetter].push(manufacturer);
            return acc;
          },
          {}
        );

        const sortedLetters = Object.keys(groupedByLetter).sort();

        return (
          <div key={country} className="country-section">
            
            <hr></hr>
            <h2 className="country-header">{country}</h2>
            <hr></hr>

            {sortedLetters.map((letter) => (
              <div key={letter} className="brand-letter-section">
                <h3>{letter}</h3> {/* ✅ First letter header */}
                <ul>
                  {groupedByLetter[letter]
                    .sort((a, b) => a.brand.localeCompare(b.brand))
                    .map((manufacturer) => (
                      <li key={manufacturer._id}>
                        <Link to={`/brands/${manufacturer.slug}`}>
                          {manufacturer.brand}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
            <hr></hr>
            <BackToTop />
          </div>
        );
      })}
    </div>
  );
}
