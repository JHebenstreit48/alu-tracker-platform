import { Link } from "react-router-dom";
import "@/SCSS/Brands/BrandQuickList.scss";

interface BrandQuickListProps {
  manufacturers: {
    _id: string;
    brand: string;
    slug: string;
  }[];
}

export default function BrandQuickList({ manufacturers }: BrandQuickListProps) {
  // Group manufacturers alphabetically
  const groupedManufacturers = manufacturers.reduce((acc: Record<string, { _id: string; brand: string; slug: string; }[]>, manufacturer) => {
    const firstLetter = manufacturer.brand.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(manufacturer);
    return acc;
  }, {});

  const sortedLetters = Object.keys(groupedManufacturers).sort();

  return (
    <div className="brand-quick-list">
      {sortedLetters.map((letter) => (
        <div key={letter} className="brand-letter-section">
          <h3>{letter}</h3>
          <ul>
            {groupedManufacturers[letter].map((manufacturer) => (
              <li key={manufacturer._id}>
                <Link to={`/manufacturers/${manufacturer.slug}`}>
                  {manufacturer.brand}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
