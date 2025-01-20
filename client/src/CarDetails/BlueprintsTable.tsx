import Blueprints from "@/CarDetails/CarInterfaces";
import starIcon from "@/assets/star-icon/star-icon.png";

interface Props {
  blueprints?: Blueprints; // Made optional to handle undefined cases
  carName?: string; // Optional car name to handle special cases
}

const BlueprintsTable: React.FC<Props> = ({ blueprints, carName = "" }) => {
  // Handle cases where the car's name contains "Security"
  if (carName.includes("Security")) {
    return <div>No blueprint data available for security cars.</div>;
  }

  // Handle cases where blueprints is undefined or null
  if (!blueprints) {
    console.log("Blueprints object is undefined or null.");
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
        {Object.entries(blueprints)
          .filter(
            ([key, value]) =>
              key.startsWith("BPs_") &&
              !key.includes("*") &&
              value !== null &&
              typeof value === "number"
          )
          .map(([key, value]) => {
            const starCount = parseInt(key.match(/\d+/)?.[0] || "0", 10);

            return (
              <tr key={key}>
                <td style={{ textAlign: "center", display: "flex" }}>
                  <div style={{ width: "50%" }}>
                    <span style={{ marginRight: "8px" }}>Blueprints: </span>
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
        {/* Handle Total_BPs */}
        {blueprints.Total_BPs !== null && blueprints.Total_BPs !== undefined ? (
          <tr>
            <td style={{ textAlign: "center" }}>Total Blueprints</td>
            <td>{blueprints.Total_BPs}</td>
          </tr>
        ) : (
          <tr>
            <td style={{ textAlign: "center" }}>Total Blueprints</td>
            <td>0</td> {/* Default value if Total_BPs is missing */}
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default BlueprintsTable;
