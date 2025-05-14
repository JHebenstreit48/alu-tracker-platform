import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Shared/Header";
import PageTab from "@/components/Shared/PageTab";
import ClassTables from "@/components/CarInformation/CarList/ClassTables";
import CarFilters from "@/components/CarInformation/CarList/CarFilters";
import "@/SCSS/Cars/CarsByClass.scss";

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";


interface Car {
  _id: string;
  Brand: string;
  Model: string;
  Stars: number;
}

export default function Cars() {
  const location = useLocation();
  const [cars, setCars] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(
    localStorage.getItem("searchTerm") || ""
  );
  const [selectedStars, setSelectedStars] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>(
    sessionStorage.getItem("selectedClass") || "All Classes"
  );
  const [unitPreference, setUnitPreference] = useState<"metric" | "imperial">(() => {
    const savedUnit = localStorage.getItem("preferredUnit");
    return savedUnit === "imperial" || savedUnit === "metric" ? savedUnit : "metric";
  });
  const [error, setError] = useState<string | null>(null);

  // Accent-safe normalization
  const normalize = (text: string): string =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  useEffect(() => {
    setError(null);

    const endpoint =
      selectedClass === "All Classes"
        ? `${API_BASE_URL}/api/cars`
        : `${API_BASE_URL}/api/cars/${selectedClass}`;

    fetch(endpoint)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setCars(data);
      })
      .catch((error) => {
        setError("Failed to fetch cars. Please try again later.");
        console.error(error);
      });
  }, [selectedClass, location.state]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    localStorage.setItem("searchTerm", term);
  };

  const handleStarFilter = (stars: number | null) => {
    setSelectedStars(stars);
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newClass = e.target.value;
    setSelectedClass(newClass);
    sessionStorage.setItem("selectedClass", newClass);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedStars(null);
    setSelectedClass("All Classes");
    localStorage.removeItem("searchTerm");
    sessionStorage.removeItem("selectedClass");
  };

  const handleUnitPreferenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value as "metric" | "imperial";
    setUnitPreference(newUnit);
    localStorage.setItem("preferredUnit", newUnit);
  };

  const filteredCars = cars
    .filter((car) => {
      const normalizedSearch = normalize(searchTerm);
      const brand = normalize(car.Brand);
      const model = normalize(car.Model);
      const combined = `${brand} ${model}`;

      const matchesSearch =
        brand.includes(normalizedSearch) ||
        model.includes(normalizedSearch) ||
        combined.includes(normalizedSearch);

      const matchesStars = selectedStars ? car.Stars === selectedStars : true;

      return matchesSearch && matchesStars;
    })
    .filter((car, index, self) =>
      index === self.findIndex(
        (c) =>
          c.Brand === car.Brand &&
          c.Model === car.Model &&
          c.Stars === car.Stars
      )
    )
    .sort((a, b) => {
      if (selectedClass === "All Classes") {
        return a.Stars - b.Stars;
      }
      return 0;
    });

    if (error) {
      return (
        <div className="cars">
          <PageTab title="Cars">
            <Header text="Cars" />
            <div className="error-message">{error}</div>
            <CarFilters onSearch={handleSearch} onFilter={handleStarFilter} />
            <ClassTables cars={[]} selectedClass={selectedClass} />
          </PageTab>
        </div>
      );
    }

    if (!cars.length && !error) {
      return (
        <div className="cars">
          <PageTab title="Cars">
            <Header text="Cars" />
            <div className="loading-message">Loading cars...</div>
            <CarFilters onSearch={handleSearch} onFilter={handleStarFilter} />
          </PageTab>
        </div>
      );
    }

  return (
    <div>
      <PageTab title="Cars">
        <Header text="Cars" />
        <div>
          <CarFilters onSearch={handleSearch} onFilter={handleStarFilter} />
          <div className="settings-row">
            <select
              onChange={handleClassChange}
              value={selectedClass}
              className="classSelect"
            >
              <option value="All Classes">All Classes</option>
              <option value="D">D</option>
              <option value="C">C</option>
              <option value="B">B</option>
              <option value="A">A</option>
              <option value="S">S</option>
            </select>

            <button className="resetFilters" onClick={handleResetFilters}>
              Reset Filters
            </button>

            <div className="unitSelection">
              <select
                onChange={handleUnitPreferenceChange}
                value={unitPreference}
                className="unitSelect"
              >
                <option value="metric">Metric (km/h, m/s²)</option>
                <option value="imperial">Imperial (mph, ft/s²)</option>
              </select>
              <span
                className="infoTooltip"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="This setting applies units of measurement for individual car details pages."
              >
                &#9432;
              </span>
            </div>
          </div>
        </div>
        <ClassTables cars={filteredCars} selectedClass={selectedClass} />
      </PageTab>
    </div>
  );
}
