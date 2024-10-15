import { garageLevelList } from './GarageLevelCars.ts';
import { GLContent } from './GarageLevelContent.tsx';
import '../CSS/GarageLevels.css'
import { useState } from 'react';

export default function GarageLevelsJumpList() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Function to handle level jump
  function jumpToGarageLevel(levelKey: number) {
    // const selectedLevel = event.target.value;
    const element = document.getElementById(`garage-level ${levelKey}`);
    if (element) {
      element.scrollIntoView({ behavior: 'instant' });
    }
    setIsDropdownOpen(false); // Close the dropdown after selecting a level
  }

  // Toggle dropdown visibility
  function toggleDropdown() {
    setIsDropdownOpen(!isDropdownOpen);
  }

  return (
    <div className='dropDownContainer'>
      {/* Button to open dropdown */}
      <button className="GLDropdownButton" onClick={toggleDropdown}>
        Select Garage Level
      </button>

      {/* Dropdown with 4 columns, hidden until clicked */}
      <div className={`GLDropDown ${isDropdownOpen ? 'show' : ''}`}>
        <div className="GLDropDownList">
          {garageLevelList.map((garageLevelNumber) => (
            <a
              className='glAlphabetical'
              key={garageLevelNumber.GarageLevelKey}
              onClick={() => jumpToGarageLevel(garageLevelNumber.GarageLevelKey)}
            >
              {garageLevelNumber.GarageLevelKey}
            </a>
          ))}
        </div>
      </div>

      {/* Render garage levels */}
      <div>
        {garageLevelList.map((garageLevelNumber) => (
          <div
            key={garageLevelNumber.GarageLevelKey}
            id={`garage-level ${garageLevelNumber.GarageLevelKey}`}
          >
            <GLContent {...garageLevelNumber} />
          </div>
        ))}
      </div>
    </div>
  );
}
