import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import starIcon from "../assets/images/icons8-star-48.png";
import "../CSS/CarDetail.css";
import { Images } from "../assets/images/images";
import { DynamicImageKeys } from "../assets/images/DynamicImageKeys";

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
    console.log(error);

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

  const carImagePath = (() => {
    const normalizedModel = car.Model.toLowerCase()
      .replace(/\./g, "-") // Replace dots with hyphens
      .replace(/\s+/g, "-"); // Replace spaces with hyphens
  
    const dynamicKey = `${car.Brand.toLowerCase().replace(/\s+/g, "-")}-${normalizedModel}`;
    // console.log("Car Model:", car.Model);
    // console.log("Normalized Model:", normalizedModel);
    // console.log("Dynamic Key:", dynamicKey);
  
    const pascalCaseKey = DynamicImageKeys[dynamicKey];
    console.log("PascalCase Key:", pascalCaseKey);
  
    return pascalCaseKey && Images[pascalCaseKey]
      ? Images[pascalCaseKey]
      : Images["placeholder"];
  })();

  return (
    <div className="car-detail">

      <div>

        <button className="backBtn" onClick={() => navigate("/carsbyclass")}>Go Back</button>

      </div>

      <div>

        <h1 className="carName">

          {car.Brand} {car.Model}

        </h1>

      </div>

      <div>

        <div>

        <img
        src={carImagePath}
        alt={`${car.Brand} ${car.Model}`}
        className="carImage"
      />

        </div>

      </div>

      <table>

        <tbody>

          <tr>

            <th className="table-header" colSpan={2}>
              Class {car.Class}
            </th>

          </tr>

          <tr>

            <td>

              <span>
                {Array.from({ length: car.Stars }, (_, i) => (
                  <img
                    key={i}
                    src={starIcon}
                    alt="star"
                    style={{ width: "27px", height: "27px", marginRight: "4px" }}
                  />
                ))}
              </span>

            </td>

          </tr>

          <tr>

            <td className="maxRank">Max Rank: {car.Max_Rank}</td>

          </tr>

        </tbody>

      </table>

      <div className="carInfo">

        <p>Top Speed: {car.Top_Speed} km/h</p>
        <p>Acceleration: {car.Acceleration} m/s²</p>

        <p>Top Speed: {car.Top_Speed}</p>
        <p>Acceleration: {car.Acceleration}</p>

      </div>

    </div>
  );
};

export default CarDetail;
