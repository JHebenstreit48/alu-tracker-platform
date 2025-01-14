import { useState, useEffect } from "react";
import Header from "../components/Header";
import PageTab from "../components/PageTab";
import ClassTables from "../CarsByClass/ClassTables";
import CarFilters from "../CarsByClass/CarFilters";
import "../CSS/CarsByClass.css";
import { useLocation } from "react-router-dom";

interface Car {
    _id: string;
    Brand: string;
    Model: string;
    Stars: number;
}

export default function CarsByClass() {
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

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

    useEffect(() => {
        setError(null);

        const endpoint =
            selectedClass === "All Classes"
                ? `${API_BASE_URL}/cars`
                : `${API_BASE_URL}/cars/${selectedClass}`;

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
        const normalizedTerm = term.toLowerCase();
        setSearchTerm(normalizedTerm);
        localStorage.setItem("searchTerm", normalizedTerm);
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
        localStorage.setItem("preferredUnit", newUnit); // Save to localStorage
    };

    const filteredCars = cars
        .filter((car) => {
            const matchesSearch =
                car.Brand.toLowerCase().includes(searchTerm) ||
                car.Model.toLowerCase().includes(searchTerm) ||
                (car.Brand.toLowerCase() + " " + car.Model.toLowerCase()).includes(
                    searchTerm
                );

            const matchesStars = selectedStars ? car.Stars === selectedStars : true;

            return matchesSearch && matchesStars;
        })
        .sort((a: Car, b: Car) => {
            if (selectedClass === "All Classes") {
                return a.Stars - b.Stars;
            }
            return 0;
        });

    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <PageTab title="Cars">
                <Header text="Cars" />
                <div>
                    <CarFilters
                        onSearch={handleSearch}
                        onFilter={handleStarFilter}
                    />
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
