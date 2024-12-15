import { Car } from "./CarInterfaces";
import starIcon from "../assets/images/icons8-star-48.png";
import { Images } from "../assets/images/images";
import { DynamicImageKeys } from "../assets/images/DynamicImageKeys";

interface CarDetailsSetupProps {
  car: Car;
  unitPreference: "metric" | "imperial"; // Added prop for unit preference
  handleGoBack: () => void;
}

const CarDetailsSetup: React.FC<CarDetailsSetupProps> = ({ car, unitPreference, handleGoBack }) => {
  // Helper to parse both strings and numbers into valid numbers
  const parseMetricValue = (value: string | number | undefined): number => {
    if (value === undefined || value === null) {
      console.error("Value is undefined or null", value);
      return 0; // Return the number as-is if it's already a valid number
    }
    if (typeof value === "number") {
      return value;
    }
    return parseFloat(value.replace(",", ".")); // Handle string with commas
  };

  // Custom conversion function for Top Speed
  const convertTopSpeed = (speed: string | number | undefined): string => {
    if (speed === undefined || speed === null) {
      console.error("Top Speed value is undefined or null", speed);
      return unitPreference === "imperial" ? "0 mph" : "0 km/h"; // Return the number as-is if it's already a valid number
    }
    const parsedSpeed = parseMetricValue(speed);

    // Custom conversion factor to match in-game value
    const conversionFactor = 0.6214;

    return unitPreference === "imperial"
      ? `${(parsedSpeed * conversionFactor).toFixed(1)} mph` // Match game's rounding
      : `${parsedSpeed.toFixed(1)} km/h`;
  };

  // Display stats as-is for Acceleration, Handling, and Nitro
  const displayStatAsIs = (value: string | number): string => {
    const parsedValue = parseMetricValue(value);
    return `${parsedValue.toFixed(2)}`; // Keep the precision for other stats
  };

  // Dynamic image path resolution
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
                    <img key={i} src={starIcon} alt="star" style={{ width: "30px", height: "30px", marginRight: "4px" }} />
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
              <td>{convertTopSpeed(car.Top_Speed)}</td>
            </tr>
            <tr>
              <td>Acceleration</td>
              <td>{displayStatAsIs(car.Acceleration)}</td>
            </tr>
            <tr>
              <td>Handling</td>
              <td>{displayStatAsIs(car.Handling)}</td>
            </tr>
            <tr>
              <td>Nitro</td>
              <td>{displayStatAsIs(car.Nitro)}</td>
            </tr>
          </tbody>
        </table>

        {/* <table className="stage1Stats">
          <tbody>
            <th className="tableHeader2" colSpan={2}>Stage 1 Stats</th>
            <tr>
              <td>Top Speed</td>
              <td>{convertTopSpeed(car.Stage_1_Top_Speed)}</td>
            </tr>
            <tr>
              <td>Acceleration</td>
              <td>{displayStatAsIs(car.Stage_1_Acceleration)}</td>
            </tr>
            <tr>
              <td>Handling</td>
              <td>{displayStatAsIs(car.Stage_1_Handling)}</td>
            </tr>
            <tr>
              <td>Nitro</td>
              <td>{displayStatAsIs(car.Stage_1_Nitro)}</td>
            </tr>
          </tbody>
        </table> */}

        <table className="blueprintsRequired">
          <thead>
            <tr>
              <th className="tableHeader2" colSpan={2}>Blueprints</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(car)
              .filter(
                ([key, value]) =>
                  key.startsWith("BPs_") && value !== undefined && value !== null
              ) // Ensure fields exist and are not null or undefined
              .map(([key, value]) => {
                // Extract the star level dynamically from the key, e.g., "BPs_3_Star" -> "3"
                const starCount = parseInt(key.match(/\d+/)?.[0] || "0", 10);

                return (
                  <tr key={key}>
                    <td style={{ textAlign: "center" }}>
                      <span style={{ marginRight: "8px" }}>Blueprints: </span>
                      {Array.from({ length: starCount }, (_, i) => (
                        <img
                          key={i}
                          src={starIcon}
                          alt="star"
                          style={{ width: "30px", height: "30px", marginLeft: "2px" }}
                        />
                      ))}
                    </td>
                    <td>{value}</td>
                  </tr>
                );
              })}
            {car.Total_BPs !== undefined && (
              <tr>
                <td>Total Blueprints</td>
                <td>{car.Total_BPs}</td>
              </tr>
            )}
          </tbody>
        </table>

      </div>
    </div>
  );
};

export default CarDetailsSetup;
