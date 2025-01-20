import React, { useState, useEffect } from 'react';
import { GarageLevels } from '@/GarageLevels/interface';
import '@/CSS/GarageLevelTracker.css';

interface GarageLevelTrackerProps {
  levels: GarageLevels[]; // Accept levels as a prop
}

const GarageLevelTracker: React.FC<GarageLevelTrackerProps> = ({ levels }) => {
  const [currentLevel, setCurrentLevel] = useState(() => {
    return Number(localStorage.getItem('currentGarageLevel')) || 1; // Load level from localStorage
  });
  const [currentXp, setCurrentXp] = useState(() => {
    return localStorage.getItem('currentXp') || ''; // Load XP from localStorage as a string
  });

  useEffect(() => {
    localStorage.setItem('currentGarageLevel', currentLevel.toString()); // Save level to localStorage
  }, [currentLevel]);

  useEffect(() => {
    localStorage.setItem('currentXp', currentXp); // Save XP to localStorage
  }, [currentXp]);

  const nextLevelData = levels.find((level) => level.GarageLevelKey === currentLevel + 1);
  const nextXpRequired = nextLevelData?.xp || 0; // XP required for the next level
  const xpRemaining = nextXpRequired > 0
    ? Math.max(nextXpRequired - Number(currentXp.replace(/,/g, '')), 0)
    : 0;
  
  


  const handleXpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, ''); // Remove commas for calculation
    if (/^\d*$/.test(value)) {
      const formattedValue = Number(value).toLocaleString('en-US'); // Add commas to input
      setCurrentXp(formattedValue);
    }
  };

  return (
    <div className="garageLevelTracker">
      <div className="levelSelector">
        <label>
          Select Current Garage Level:
          <select
            value={currentLevel}
            onChange={(e) => setCurrentLevel(Number(e.target.value))}
          >
            {levels.map((level) => (
              <option key={level.GarageLevelKey} value={level.GarageLevelKey}>
                Garage Level {level.GarageLevelKey}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="xpInputSection">
        <label>
          Enter Current XP:
          <input
            type="text"
            value={currentXp}
            onChange={handleXpChange}
            placeholder="0"
          />
        </label>
      </div>

      <div className="xpRemaining">
        <p>
          XP Remaining to Next Level:{' '}
          <strong>{xpRemaining > 0 ? xpRemaining.toLocaleString('en-US') : '0'}</strong>
        </p>
      </div>
    </div>
  );
};

export default GarageLevelTracker;
