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
    const location = useLocation(); // Use location for managing state
    const [cars, setCars] = useState<Car[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>(""); // Search term
    const [selectedStars, setSelectedStars] = useState<number | null>(null);
    const [selectedClass, setSelectedClass] = useState<string>(
        sessionStorage.getItem("selectedClass") || "All Classes"
    );
    const [error, setError] = useState<string | null>(null);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001/api";

    useEffect(() => {
        setError(null);

        const endpoint =
            selectedClass === "All Classes"
                ? `${API_BASE_URL}/cars` // Fetch all cars
                : `${API_BASE_URL}/cars/${selectedClass}`; // Fetch specific class

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
    }, [selectedClass, location.state]); // Dependency includes location.state

    const handleSearch = (term: string) => {
        setSearchTerm(term.toLowerCase());
    };

    const handleStarFilter = (stars: number | null) => {
        setSelectedStars(stars);
    };

    const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newClass = e.target.value;
        setSelectedClass(newClass);
        sessionStorage.setItem("selectedClass", newClass);
    };

    const filteredCars = cars
        .filter((car) => {
            const matchesSearch =
                car.Brand.toLowerCase().includes(searchTerm) ||
                car.Model.toLowerCase().includes(searchTerm);
            const matchesStars = selectedStars ? car.Stars === selectedStars : true;

            return matchesSearch && matchesStars;
        })
        .sort((a: Car, b: Car) => {
            // Sort by star rank only when "All Classes" is selected
            if (selectedClass === "All Classes") {
                return a.Stars - b.Stars;
            }
            return 0; // No sorting for specific classes
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
                </div>
                <ClassTables cars={filteredCars} selectedClass={selectedClass} />
            </PageTab>
        </div>
    );
}
