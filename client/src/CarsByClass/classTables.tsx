import { Link } from "react-router-dom";

interface Car {
    Id: number;
    Brand: string;
    Model: string;
    Stars: number;
}

interface ClassTablesProps {
    cars: Car[];
    selectedClass: string;
}

export default function carClassTables({ cars, selectedClass }: ClassTablesProps) {
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
                            <tr className="table-data" key={car.Id}>
                                <td className="car-name">
                                    {/* Link to Car Details */}
                                    <Link to={`/cars/${car.Id}`}>
                                        {car.Brand} {car.Model}
                                    </Link>
                                </td>
                                <td>{car.Stars}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
