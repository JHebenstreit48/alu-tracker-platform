// src/CarDetails/CarDetailsSetup.tsx
import { Car } from "./CarInterfaces";
import starIcon from "../assets/images/icons8-star-48.png";
import { Images } from "../assets/images/images";
import { DynamicImageKeys } from "../assets/images/DynamicImageKeys";

interface CarDetailsSetupProps {
  car: Car;
  handleGoBack: () => void;
}

const CarDetailsSetup: React.FC<CarDetailsSetupProps> = ({ car, handleGoBack }) => {
  const carImagePath = (() => {
    const normalizedModel = car.Model.toLowerCase().replace(/\./g, "-").replace(/\s+/g, "-");
    const dynamicKey = `${car.Brand.toLowerCase().replace(/\s+/g, "-")}-${normalizedModel}`;
    return DynamicImageKeys[dynamicKey] && Images[DynamicImageKeys[dynamicKey]]
      ? Images[DynamicImageKeys[dynamicKey]]
      : Images["placeholder"];
  })();

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
      <div>
        <div className="carImageContainer">
          <img src={carImagePath} alt={`${car.Brand} ${car.Model}`} className="carImage" />
        </div>
      </div>
      <div className="carDetailTables">
        <table className="carInfoTable">
          <tbody>
            <tr>
              <th className="tableHeader2" colSpan={2}>Class {car.Class}</th>
            </tr>
            <tr>
              <td>
                <span>
                  {Array.from({ length: car.Stars }, (_, i) => (
                    <img key={i} src={starIcon} alt="star" style={{ width: "27px", height: "27px", marginRight: "4px" }} />
                  ))}
                </span>
              </td>
            </tr>
            <tr>
              <td className="maxRank">Max Rank: {car.Max_Rank}</td>
            </tr>
          </tbody>
        </table>
        <table className="carInfoTable">
          <tbody>
            <th className="tableHeader2" colSpan={2}>Gold Max Stats</th>
            <tr>
              <td>Top Speed</td>
              <td>{car.Top_Speed} km/h</td>
            </tr>
            <tr>
              <td>Acceleration</td>
              <td>{car.Acceleration} m/s²</td>
            </tr>
            <tr>
              <td>Handling</td>
              <td>{car.Handling} m/s²</td>
            </tr>
            <tr>
              <td>Nitro</td>
              <td>{car.Nitro} m/s²</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CarDetailsSetup;
