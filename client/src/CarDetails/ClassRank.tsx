import { Car } from "@/CarDetails/CarInterfaces";
import StarIcon from "@/assets/star-icon/star-icon.png";

interface ClassRankProps {
  car: Car;
}

const ClassRank: React.FC<ClassRankProps> = ({ car }) => {
  return (
    <div className="carDetailTables">
      <table className="carInfoTable">
        <thead>
          <tr>
            <th className="tableHeader2" colSpan={2}>
              Class {car.Class}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                {Array.from({ length: car.Stars }, (_, i) => (
                  <img key={i} src={StarIcon} alt="star" className="starIcon" />
                ))}
              </div>
            </td>
          </tr>
          <tr>
            <td className="maxRank">Max Rank: {car.Max_Rank}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ClassRank;
