import { useState, useEffect } from "react";
import { cars } from "./BlueprintPriceData.ts";
import "../CSS/LegendStore.css";

const LegendStore: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState(() => {
    return localStorage.getItem("selectedClass") || "D"; // Default to "D"
  });

  const [selectedCarRarity, setSelectedCarRarity] = useState<string | null>(() => {
    const value = localStorage.getItem("selectedCarRarity");
    return value !== null ? value : null;
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

  const [selectedStarRank, setSelectedStarRank] = useState<number | null>(() => {
    const value = localStorage.getItem("selectedStarRank");
    return value !== null ? Number(value) : null;
  });



  // Save selected filters to localStorage
  useEffect(() => {
    localStorage.setItem("selectedClass", selectedClass);
  }, [selectedClass]);

  useEffect(() => {
    if (selectedCarRarity !== null) {
      localStorage.setItem("selectedCarRarity", selectedCarRarity);
    } else {
      localStorage.removeItem("selectedCarRarity");
    }
  }, [selectedCarRarity]);

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

  useEffect(() => {
    if (selectedStarRank !== null) {
      localStorage.setItem("selectedStarRank", String(selectedStarRank));
    } else {
      localStorage.removeItem("selectedStarRank");
    }
  }, [selectedStarRank]);

  // Filter cars based on selected class
  let filteredCars = selectedClass === "All Levels"
    ? cars // Show all cars if "All Levels" is selected
    : cars.filter((car) => car.class === selectedClass);

  if (selectedCarRarity !== null) {
    filteredCars = filteredCars.filter(
      (car) => car.carRarity !== undefined && car.carRarity === selectedCarRarity
    );
  }

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

  if (selectedStarRank !== null) {
    filteredCars = filteredCars.filter(
      (car) => car.starRank !== undefined && car.starRank === selectedStarRank
    );
  }

  return (
    <div>

      {/* Controls */}
      <div className="controls">
        <h2 className="filterHeading">Car Search Filters</h2>
        <label className="DropdownLabel">
          Cumulative Garage Level:
          <select
            className="dropdownSelector"
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
            className="dropdownSelector"
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

        <label className="DropdownLabel">
          Star Rank:
          <select
            className="dropdownSelector"
            value={selectedStarRank !== null ? selectedStarRank : ""}
            onChange={(e) =>
              setSelectedStarRank(
                e.target.value ? parseInt(e.target.value, 10) : null
              )
            }
          >
            <option value="">All Ranks</option>
            {Array.from({ length: 6 }, (_, i) => i + 1).map((rank) => (
              <option key={rank} value={rank}>
                Rank {rank}
              </option>
            ))}
          </select>
        </label>

        <label className="DropdownLabel">
          Rarity:
          <select
            className="dropdownSelector"
            value={selectedCarRarity !== null ? selectedCarRarity : ""}
            onChange={(e) =>
              setSelectedCarRarity(e.target.value || null)
            }
          >
            <option value="">All Rarities</option>
            {["Rare", "Epic", "Legendary"].map((rarity) => (
              <option key={rarity} value={rarity}>
                {rarity}
              </option>
            ))}
          </select>
        </label>

        <label className="DropdownLabel" id="classSelector">
          Class:
          <select
            className="dropdownSelector"
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
            id="searchInput"
            type="text"
            placeholder="Search by brand or model"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>

          <button
            className="resetButton"
            onClick={() => {
              // Clear localStorage for each filter
              localStorage.removeItem("selectedClass");
              localStorage.removeItem("selectedCarRarity");
              localStorage.removeItem("searchTerm");
              localStorage.removeItem("selectedCumulativeLevel");
              localStorage.removeItem("selectedIndividualLevel");
              localStorage.removeItem("selectedStarRank");

              // Reset state for each filter
              setSelectedClass("D"); // Reset to default class
              setSelectedCarRarity(null); // Reset rarity
              setSearchTerm(""); // Reset search term
              setSelectedCumulativeLevel(null); // Reset cumulative level
              setSelectedIndividualLevel(null); // Reset individual level
              setSelectedStarRank(null); // Reset star rank
            }}
          >
            Reset Filters
          </button>

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
