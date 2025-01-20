import { useState } from 'react';
import Header from '@/components/Header';
import PageTab from '@/components/PageTab';
import GarageLevelsDropDown from '@/GarageLevels/GarageLevelsDropDown';
import GLTrackerToggle from '@/GarageLevels/GLTrackerToggle';
import GarageLevelTracker from '@/GarageLevels/GarageLevelTracker';
import { garageLevelList } from '@/GarageLevels/GarageLevelCars'; // Import levels dynamically

export default function GarageLevels() {
  const [isTrackerMode, setIsTrackerMode] = useState(() => {
    return localStorage.getItem('garageLevelTrackerMode') === 'true'; // Load mode state from localStorage
  });

  return (
    <div>
      <PageTab title="Garage Levels">
        <Header text="Garage Levels" />
        <GLTrackerToggle onToggle={setIsTrackerMode} />
        {isTrackerMode && <GarageLevelTracker levels={garageLevelList} />}
        <GarageLevelsDropDown />
      </PageTab>
    </div>
  );
}
