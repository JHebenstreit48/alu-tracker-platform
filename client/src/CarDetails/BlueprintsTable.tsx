import { Car } from "@/CarDetails/CarInterfaces";
import starIcon from "@/assets/star-icon/star-icon.png";

interface Props {
  car: Car;
}

const BlueprintsTable: React.FC<Props> = ({ car }) => {
  if (car.Model.includes("Security")) {
    return <div>No blueprint data available for security cars.</div>;
  }

  // Extract and filter blueprint entries from the car object
  const blueprintEntries = Object.entries(car)
    .filter(
      ([key, value]) =>
        key.startsWith("BPs_") &&
        typeof value === "number" &&
        value !== null
    );

  if (blueprintEntries.length === 0) {
    return <div>No blueprint data available.</div>;
  }

  return (
    <table className="blueprintsRequired">
      <thead>
        <tr>
          <th className="tableHeader2" colSpan={2}>Blueprints</th>
        </tr>
      </thead>
      <tbody>
        {blueprintEntries.map(([key, value]) => {
          const starCount = parseInt(key.match(/\d+/)?.[0] || "0", 10);

          return (
            <tr key={key}>
              <td style={{ textAlign: "center", display: "flex" }}>
                <div style={{ width: "50%" }}>
                  <span style={{ marginRight: "8px" }}>Blueprints:</span>
                </div>
                <div style={{ width: "50%" }}>
                  {Array.from({ length: starCount }, (_, i) => (
                    <img
                      key={i}
                      src={starIcon}
                      alt="star"
                      style={{ width: "30px", height: "30px", marginLeft: "2px" }}
                    />
                  ))}
                </div>
              </td>
              <td>{value}</td>
            </tr>
          );
        })}

        <tr>
          <td style={{ textAlign: "center" }}>Total Blueprints</td>
          <td>{car.Total_BPs ?? 0}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default BlueprintsTable;
