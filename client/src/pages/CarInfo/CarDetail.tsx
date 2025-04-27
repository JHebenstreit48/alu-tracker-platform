import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Car } from "@/CarDetails/CarInterfaces";
import CarDetailsSetup from "@/CarDetails/CarDetailsSetup";
import BlueprintsTable from "@/CarDetails/BlueprintsTable";
import "@/CSS/CarDetail.css";

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [car, setCar] = useState<Car | null>(null);
  const [error, setError] = useState(false);

  const unitPreference =
    localStorage.getItem("preferredUnit") === "imperial" ? "imperial" : "metric";

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

  useEffect(() => {
    function fetchCarDetails(carId: string) {
      fetch(`${API_BASE_URL}/cars/detail/${carId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => setCar(data))
        .catch(() => setError(true));
    }

    if (id) {
      fetchCarDetails(id);
    }
  }, [id, API_BASE_URL]); // ✅ Correct dependency array now

  const handleGoBack = () => {
    const lastSelectedClass = location.state?.selectedClass;
    navigate(lastSelectedClass ? `/carsbyclass?class=${lastSelectedClass}` : "/carsbyclass");
  };

  if (error) return <div className="error-message">Failed to load car details.</div>;
  if (!car) return <div className="loading-message">Loading car details...</div>;

  return (
    <div>
      <CarDetailsSetup
        car={car}
        unitPreference={unitPreference}
        handleGoBack={handleGoBack}
      />
      <BlueprintsTable car={car} />
    </div>
  );
};

export default CarDetail;