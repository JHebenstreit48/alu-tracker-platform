import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../CSS/CarDetail.css";

interface Car {
  Id: number; // Matches the database field
  Brand: string;
  Model: string;
  Class: string;
  Stars: number;
  MaxRank: number;
}

const CarDetail = () => {
  const { id } = useParams(); // Extracting id from the URL
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`/api/cars/detail/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch car details.");
        }
        const data: Car = await response.json();
        setCar(data);
      } catch (err) {
        console.error("Error fetching car details:", err);
        setError(true);
      }
    };

    fetchCarDetails();
  }, [id]);

  if (error) {
    return <div className="error-message">Error loading car details. Please try again later.</div>;
  }

  if (!car) {
    return <div className="loading-message">Loading car details...</div>;
  }

  return (
    <div className="carDetailContainer">
      <button onClick={() => navigate(-1)}>Back</button>
      <div className="carInfo">
        <p>Class: {car.Class}</p>
        <p>Stars: {car.Stars}</p>
        <p>Max Rank: {car.MaxRank}</p>
      </div>
    </div>
  );
};

export default CarDetail;
