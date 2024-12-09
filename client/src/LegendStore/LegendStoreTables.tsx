import { cars } from "./BlueprintPriceData.ts"; // Import the cars data here
import "../CSS/LegendStore.css";

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
  // Filter cars based on selected class
  let filteredCars = selectedClass === "All Levels"
    ? cars // Show all cars if "All Levels" is selected
    : cars.filter((car) => car.class === selectedClass);

  if (selectedCarRarity !== null) {
    filteredCars = filteredCars.filter(
      (car) => car.carRarity !== undefined && car.carRarity === selectedCarRarity
    );
  }

  if (searchTerm.trim() !== "") {
    filteredCars = filteredCars.filter((car) =>
      `${car.brand} ${car.model}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (selectedCumulativeLevel !== null) {
    filteredCars = filteredCars.filter(
      (car) => car.garageLevel !== undefined && car.garageLevel <= selectedCumulativeLevel
    );
  }

  if (selectedIndividualLevel !== null) {
    filteredCars = filteredCars.filter(
      (car) => car.garageLevel !== undefined && car.garageLevel === selectedIndividualLevel
    );
  }

  if (selectedStarRank !== null) {
    filteredCars = filteredCars.filter(
      (car) => car.starRank !== undefined && car.starRank === selectedStarRank
    );
  }

  return (
    <div>
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
              <tr key={`${car.brand}-${car.model}`}>
                <td>{`${car.brand} ${car.model}`}</td>
                {car.blueprintPrices.map((price, index) => (
                  <td key={index}>{price.toLocaleString()}</td>
                ))}
                <td>
                  {car.blueprintPrices
                    .reduce((total, price) => total + price, 0)
                    .toLocaleString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="no-results">
                No results found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LegendStoreTables;
