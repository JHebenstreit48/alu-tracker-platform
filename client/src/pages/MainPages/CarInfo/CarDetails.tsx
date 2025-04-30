import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Car } from "@/components/CarInformation/CarDetails/CarInterfaces";
import CarImage from "@/components/CarInformation/CarDetails/CarImage";
import ClassRank from "@/components/CarInformation/CarDetails/ClassRank";
import MaxStats from "@/components/CarInformation/CarDetails/MaxStats";
import BlueprintsTable from "@/components/CarInformation/CarDetails/BlueprintsTable";
import "@/SCSS/Cars/CarDetail.scss";

const CarDetails = () => {
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
  }, [id, API_BASE_URL]);

  const handleGoBack = () => {
    const lastSelectedClass = location.state?.selectedClass;
    navigate(lastSelectedClass ? `/cars?class=${lastSelectedClass}` : "/cars");
  };

  if (error) return <div className="error-message">Failed to load car details.</div>;
  if (!car) return <div className="loading-message">Loading car details...</div>;

  return (
    <div className="car-detail">
      <div>
        <button className="backBtn" onClick={handleGoBack}>
          Back
        </button>
      </div>

      <div>
        <h1 className="carName">{car.Brand} {car.Model}</h1>
      </div>

      <CarImage car={car} />

      {/* NEW Grid Wrapper for ClassRank + MaxStats */}
      <div className="carDetailTables">
        <ClassRank car={car} />
        <MaxStats car={car} unitPreference={unitPreference} />
      </div>

      {/* Blueprint Table stays full width below */}
      <BlueprintsTable car={car} />
    </div>
  );
};

export default CarDetails;
