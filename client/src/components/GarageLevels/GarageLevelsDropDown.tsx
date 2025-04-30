import { useState } from "react";
import { GLContent } from "@/components/GarageLevels/GarageLevelContent";
import { GarageLevelsInterface } from "@/components/GarageLevels/interface";
import "@/SCSS/GarageLevels/GarageLevels.scss";

interface GarageLevelsDropDownProps {
  levels: GarageLevelsInterface[];
}

export default function GarageLevelsDropDown({ levels }: GarageLevelsDropDownProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  function jumpToGarageLevel(levelKey: number) {
    const element = document.getElementById(`garage-level-${levelKey}`);
    if (element) {
      element.scrollIntoView({ behavior: "instant" });
    }
    setIsDropdownOpen(false);
  }

  return (
    <div className="dropDownContainer">
      <button className="GLDropdownButton" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
        Select Garage Level
      </button>

      <div className={`GLDropDown ${isDropdownOpen ? "show" : ""}`}>
        <div className="GLDropDownList">
          {levels.map((level) =>
            level.GarageLevelKey !== undefined ? (
              <a
                key={`jump-${level.GarageLevelKey}`}
                className="glAlphabetical"
                onClick={() => jumpToGarageLevel(level.GarageLevelKey)}
              >
                {level.GarageLevelKey}
              </a>
            ) : (
              <div key={`jump-missing`} className="glAlphabetical warning">
                ⚠️ Missing Garage Level Key.
              </div>
            )
          )}
        </div>
      </div>

      <div>
        {levels.map((level) =>
          level.GarageLevelKey !== undefined ? (
            <div key={`level-${level.GarageLevelKey}`} id={`garage-level-${level.GarageLevelKey}`}>
              <GLContent
                GarageLevelKey={level.GarageLevelKey}
                xp={level.xp}
                cars={level.cars}
              />
            </div>
          ) : (
            <div key={`level-missing`} className="warning">
              ⚠️ Missing Garage Level Key.
            </div>
          )
        )}
      </div>
    </div>
  );
}
