import { Link } from "react-router-dom";
import StarRating from "@/components/StarRank"; // Adjust path as needed

interface Car {
  _id: string;
  Brand: string;
  Model: string;
  Stars: number;
}

interface ClassTablesProps {
  cars: Car[];
  selectedClass: string;
}

export default function carClassTables({ cars, selectedClass }: ClassTablesProps) {
  const headerText =
    selectedClass === "All Classes" ? "All Classes" : selectedClass;

  return (
    <div>
      <table>
        <tbody>
          <tr>
            <th className="table-header" colSpan={2}>
              {headerText}
            </th>
          </tr>
          <tr className="table-data">
            <td>Manufacturer & Model</td>
            <td>Star Rank</td>
          </tr>
          {cars.map((car) => (
            <tr className="table-data" key={car._id}>
              <td className="car-name">
                <Link to={`/cars/${car._id}`}>
                  {car.Brand} {car.Model}
                </Link>
              </td>
              <td>
                <StarRating count={car.Stars} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
