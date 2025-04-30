import { useEffect, useState } from "react";

interface BlueprintCar {
  Class: string;
  Brand: string;
  Model: string;
  GarageLevel?: number;
  StarRank: number;
  CarRarity: string;
  BlueprintPrices: number[];
}

const LegendStoreTables: React.FC<{
  selectedClass: string;
  selectedCarRarity: string | null;
  searchTerm: string;
  selectedCumulativeLevel: number | null;
  selectedIndividualLevel: number | null;
  selectedStarRank: number | null;
}> = ({
  selectedClass,
  selectedCarRarity,
  searchTerm,
  selectedCumulativeLevel,
  selectedIndividualLevel,
  selectedStarRank,
}) => {
  const [cars, setCars] = useState<BlueprintCar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/blueprints");
        const data = await response.json();
        setCars(data);
      } catch (err) {
        console.error("Error fetching blueprint data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  let filteredCars = selectedClass === "All Levels"
    ? cars
    : cars.filter((car) => car.Class === selectedClass);

  if (selectedCarRarity !== null) {
    filteredCars = filteredCars.filter(
      (car) => car.CarRarity === selectedCarRarity
    );
  }

  if (searchTerm.trim() !== "") {
    filteredCars = filteredCars.filter((car) =>
      `${car.Brand} ${car.Model}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (selectedCumulativeLevel !== null) {
    filteredCars = filteredCars.filter(
      (car) => car.GarageLevel !== undefined && car.GarageLevel <= selectedCumulativeLevel
    );
  }

  if (selectedIndividualLevel !== null) {
    filteredCars = filteredCars.filter(
      (car) => car.GarageLevel !== undefined && car.GarageLevel === selectedIndividualLevel
    );
  }

  if (selectedStarRank !== null) {
    filteredCars = filteredCars.filter(
      (car) => car.StarRank === selectedStarRank
    );
  }

  return (
    <div>
      {loading ? (
        <p>Loading blueprints...</p>
      ) : (
        <table className="responsiveTable">
          <thead>
            <tr className="classSelectionHeader">
              <th colSpan={7}>
                {selectedClass === "All Levels" ? "All Classes" : `Class ${selectedClass}`}
              </th>
            </tr>
            <tr className="tableHeaderRow">
              <th>Car</th>
              <th>Blueprint 1</th>
              <th>Blueprint 2</th>
              <th>Blueprint 3</th>
              <th>Blueprint 4</th>
              <th>Blueprint 5</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredCars.length > 0 ? (
              filteredCars.map((car) => (
                <tr key={`${car.Brand}-${car.Model}`}>
                  <td>{`${car.Brand} ${car.Model}`}</td>
                  {car.BlueprintPrices.map((price, i) => (
                    <td key={i}>{price.toLocaleString()}</td>
                  ))}
                  <td>
                    {car.BlueprintPrices.reduce((total, price) => total + price, 0).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="no-results">No results found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LegendStoreTables;
