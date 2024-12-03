import { Link } from "react-router-dom";
import starIcon from "../assets/images/icons8-star-48.png";
import "../CSS/CarsByClass.css";

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

    return (
        <>
            <div>
                <table>
                    <tbody>
                        {/* Class Header */}
                        <tr>
                            <th className="table-header" colSpan={2}>
                                {selectedClass} Class
                            </th>
                        </tr>

                        {/* Column Headers */}
                        <tr className="table-data">
                            <td>Manufacturer & Model</td>
                            <td>Star Rank</td>
                        </tr>

                        {/* Dynamic Car Rows */}
                        {cars.map((car) => (
                            <tr className="table-data" key={car._id}>
                                <td className="car-name">
                                    {/* Link to Car Details */}
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
