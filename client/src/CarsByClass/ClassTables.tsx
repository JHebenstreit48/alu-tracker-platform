import { Link } from "react-router-dom";
import starIcon from "@/assets/star-icon/star-icon.png";

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
    // Function to render star icons
    const renderStars = (count: number) => {
        return (
            <span>
                {Array.from({ length: count }, (_, i) => (
                    <img
                        key={i}
                        src={starIcon}
                        alt="star"
                        style={{ width: "16px", height: "16px", marginRight: "4px" }}
                    />
                ))}
            </span>
        );
    };

    const headerText =
        selectedClass === "All Classes" ? "All Classes" : selectedClass;

    return (
        <>
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
                                <td>{renderStars(car.Stars)}</td> {/* Render star icons here */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
