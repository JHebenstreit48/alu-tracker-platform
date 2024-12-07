import { useState, useEffect } from "react";
import { cars } from "./BlueprintPriceData.ts";
import "../CSS/LegendStore.css";

const LegendStore: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState(() => {
    return localStorage.getItem("selectedClass") || "D"; // Default to "D"
  });
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem("searchTerm") || ""; // Default to empty search
  });
  const [selectedCumulativeLevel, setSelectedCumulativeLevel] = useState<number | null>(() => {
    const value = localStorage.getItem("selectedCumulativeLevel");
    return value !== null ? Number(value) : null;
  });
  const [selectedIndividualLevel, setSelectedIndividualLevel] = useState<number | null>(() => {
    const value = localStorage.getItem("selectedIndividualLevel");
    return value !== null ? Number(value) : null;
  });

  // Save selected filters to localStorage
  useEffect(() => {
    localStorage.setItem("selectedClass", selectedClass);
  }, [selectedClass]);

  useEffect(() => {
    localStorage.setItem("searchTerm", searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (selectedCumulativeLevel !== null) {
      localStorage.setItem("selectedCumulativeLevel", String(selectedCumulativeLevel));
    } else {
      localStorage.removeItem("selectedCumulativeLevel");
    }
  }, [selectedCumulativeLevel]);

  useEffect(() => {
    if (selectedIndividualLevel !== null) {
      localStorage.setItem("selectedIndividualLevel", String(selectedIndividualLevel));
    } else {
      localStorage.removeItem("selectedIndividualLevel");
    }
  }, [selectedIndividualLevel]);

  // Filter cars based on selected class
  let filteredCars = selectedClass === "All Levels"
    ? cars // Show all cars if "All Levels" is selected
    : cars.filter((car) => car.class === selectedClass);

  // Apply search term filter
  if (searchTerm.trim() !== "") {
    filteredCars = filteredCars.filter((car) =>
      `${car.brand} ${car.model}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Apply cumulative level filter if set
  if (selectedCumulativeLevel !== null) {
    filteredCars = filteredCars.filter(
      (car) => car.garageLevel !== undefined && car.garageLevel <= selectedCumulativeLevel
    );
  }

  // Apply individual level filter if set (overrides cumulative level)
  if (selectedIndividualLevel !== null) {
    filteredCars = filteredCars.filter(
      (car) => car.garageLevel !== undefined && car.garageLevel === selectedIndividualLevel
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="controls">
        <label className="DropdownLabel">
          Cumulative Garage Level:
          <select
            value={selectedCumulativeLevel !== null ? selectedCumulativeLevel : ""}
            onChange={(e) =>
              setSelectedCumulativeLevel(
                e.target.value ? parseInt(e.target.value, 10) : null
              )
            }
          >
            <option value="">All Levels</option>
            {Array.from({ length: 60 }, (_, i) => i + 1).map((level) => (
              <option key={level} value={level}>
                Level {level}
              </option>
            ))}
          </select>
        </label>

        <label className="DropdownLabel">
          Individual Garage Level:
          <select
            value={selectedIndividualLevel !== null ? selectedIndividualLevel : ""}
            onChange={(e) =>
              setSelectedIndividualLevel(
                e.target.value ? parseInt(e.target.value, 10) : null
              )
            }
          >
            <option value="">All Levels</option>
            {Array.from({ length: 60 }, (_, i) => i + 1).map((level) => (
              <option key={level} value={level}>
                Level {level}
              </option>
            ))}
          </select>
        </label>

        <label className="DropdownLabel" id="classSelector">
          Class:
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="All Levels">All Levels</option>
            <option value="D">Class D</option>
            <option value="C">Class C</option>
            <option value="B">Class B</option>
            <option value="A">Class A</option>
            <option value="S">Class S</option>
          </select>
        </label>

        <label className="DropdownLabel">
          Search:
          <input
            type="text"
            placeholder="Search by brand or model"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>
      </div>

      {/* Table (unchanged layout) */}
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
    </div>
  );
};

export default LegendStore;
