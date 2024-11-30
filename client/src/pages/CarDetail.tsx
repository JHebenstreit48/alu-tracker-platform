import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../CSS/CarDetail.css";

interface Car {
  Id: number; // Matches the database field
  Brand: string;
  Model: string;
  Class: string;
  Stars: number;
  Max_Rank: number;
  Top_Speed: number;
  Acceleration: number;
}

const CarDetail = () => {
  const { id } = useParams(); // Extracting id from the URL
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [error, setError] = useState(false);

  const fetchCarDetails = (id: string) => {
    console.log("Car ID from URL:", id); // Debugging log to verify the ID
    fetch(`http://localhost:3001/api/cars/detail/${id}`)
      .then((response) => {
        console.log("Fetch response:", response); // Debug log
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched car data:", data); // Debug log
        setCar(data); // Update the car state
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setError(true); // Update the error state
      });
  };

  useEffect(() => {
    if (id) {
      fetchCarDetails(id); // Pass the ID directly as a string
    }
  }, [id]);

  if (error) {
    return (
      <div className="error-message">
        Failed to load car details.
      </div>
    );
  }

  if (!car) {
    return (
      <div>
        <div className="loading-message">Loading car details...</div>
      </div>
    );
  }

  return (
    <div className="car-detail">
      
      <div>

      <button onClick={() => navigate("/")}>Go Back</button>

      </div>
     
      <h1>
        {car.Brand} {car.Model}
      </h1>
      <p>Class: {car.Class}</p>
      <p>Top Speed: {car.Top_Speed} km/h</p>
      <p>Acceleration: {car.Acceleration} m/s²</p>
      <p>Stars: {car.Stars}</p>
    </div>
  );
};

export default CarDetail;
