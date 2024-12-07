import React, { useState } from "react";
import { cars } from "./BlueprintPriceData.ts";
import "../CSS/LegendStore.css";

const LegendStoreTables: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState("D");
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

  // Filter cars based on the selected class and search term
  const filteredCars = cars
    .filter((car) => car.class === selectedClass)
    .filter((car) =>
      `${car.brand} ${car.model}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

  return (

    <>

      {/* Search bar */}
      <div className="search-bar">
        <label className="searchLabel" htmlFor="searchInput">Brand or Model:</label>
        <input
          id="searchInput"
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="cars-container">
        {/* Dropdown to filter cars */}
        <div className="controls">
          <label className="classDropdownLabel" htmlFor="classDropdown">Filter by Class:</label>
          <select
            id="classDropdown"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="D">D</option>
            <option value="C">C</option>
            <option value="B">B</option>
            <option value="A">A</option>
            <option value="S">S</option>
          </select>
        </div>

        {/* Responsive table */}
        <div className="table-container">
          <table className="responsive-table">

            <thead>
              {/* Class Header */}
              <tr>
                <th colSpan={7} className="classSelectionHeader">Class {selectedClass}</th>
              </tr>

            </thead>

            <tbody>

                <tr className="tableHeaderRow">
                  <th className="rowLabel">Car</th>
                  <th>Blueprint 1</th>
                  <th>Blueprint 2</th>
                  <th>Blueprint 3</th>
                  <th>Blueprint 4</th>
                  <th>Blueprint 5</th>
                  <th>Total</th>
                </tr>

              {/* Table Headers */}
                {filteredCars.map((car, index) => {
                  const total = car.blueprintPrices.reduce((acc, price) => acc + price, 0);
                  return (
                    <tr
                      key={index}>
                      <td
                        className="pricesCell"
                      >
                        {car.brand} {car.model}

                      </td>
                      {car.blueprintPrices.map((price, i) => (

                        <td
                          key={i}
                          className={`dataCell blueprint-${i + 1}`}
                        >
                          {price.toLocaleString()}</td>
                      ))}

                      <td
                        className="totalCell">{total.toLocaleString()}

                      </td>

                    </tr>

                  );
                })}
      
            </tbody>

          </table>

          </div>
          {filteredCars.length === 0 && (
            <p className="no-results">No cars found for the current search term.</p>
          )}
        </div>

    </>
  );
};

export default LegendStoreTables;
