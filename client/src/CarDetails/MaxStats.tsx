import { Car } from "@/CarDetails/CarInterfaces";

interface MaxStatsProps {
  car: Car;
  unitPreference: "metric" | "imperial";
}

const MaxStats: React.FC<MaxStatsProps> = ({ car, unitPreference }) => {
  const parseMetricValue = (value: string | number | undefined): number => {
    if (value === undefined || value === null) return 0;
    if (typeof value === "number") return value;
    return parseFloat(value.replace(",", "."));
  };

  const convertTopSpeed = (speed: string | number | undefined): string => {
    const parsedSpeed = parseMetricValue(speed);
    const conversionFactor = 0.6214;
    return unitPreference === "imperial"
      ? `${(parsedSpeed * conversionFactor).toFixed(1)} mph`
      : `${parsedSpeed.toFixed(1)} km/h`;
  };

  const displayStatAsIs = (value: string | number): string => {
    const parsedValue = parseMetricValue(value);
    return `${parsedValue.toFixed(2)}`;
  };

  return (
    <div className="carDetailTables">
      <table className="carInfoTable">
        <thead>
          <tr>
            <th className="tableHeader2" colSpan={2}>
              Gold Max Stats
            </th>
          </tr>
        </thead>
        <tbody>
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
    </div>
  );
};

export default MaxStats;
