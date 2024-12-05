import { useState, useEffect } from "react";
import Header from "../components/Header";
import PageTab from "../components/PageTab";
import ClassTables from "../CarsByClass/classTables";
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
    const [selectedClass, setSelectedClass] = useState<string>(
        sessionStorage.getItem("selectedClass") || "D"
    );

    useEffect(() => {
        // Check if coming back from CarDetail.tsx
        const fromCarDetail = location.state?.fromCarDetail || false;

        if (!fromCarDetail && !sessionStorage.getItem("manualSelection")) {
            // Reset to default class "D" if not coming from CarDetail
            setSelectedClass("D");
            sessionStorage.setItem("selectedClass", "D");
        }

        // Fetch cars based on selected class
        fetch(`http://localhost:3001/api/cars/${selectedClass}`)
            .then((response) => {
                if (!response.ok) {
                    console.error(`HTTP error! status: ${response.status}`); // Log detailed error
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log("Fetched cars:", data); // Debug log
                setCars(data);
            })
            .catch((error) => {
                console.error("Error fetching cars:", error); // Handle fetch errors
            });
    }, [selectedClass, location.state]);

    const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newClass = e.target.value;
        setSelectedClass(newClass);
        sessionStorage.setItem("selectedClass", newClass);
        sessionStorage.setItem("manualSelection", "true"); // Mark that user manually changed the class
    };

    return (
        <div>
            <PageTab title="Cars by Class">
                <Header text="Cars by Class" />
                <div>
                    <select
                        onChange={handleClassChange}
                        value={selectedClass}
                        className="class-select"
                    >
                        <option value="D">D Class</option>
                        <option value="C">C Class</option>
                        <option value="B">B Class</option>
                        <option value="A">A Class</option>
                        <option value="S">S Class</option>
                    </select>
                </div>
                {/* Pass sorted cars and selected class to ClassTables */}
                <ClassTables cars={cars.sort((a, b) => a.Stars - b.Stars)} selectedClass={selectedClass} />
            </PageTab>
        </div>
    );
}
