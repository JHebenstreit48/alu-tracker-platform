import { useState, useEffect } from 'react';
import '@/CSS/TrackerToggle.css'; // Add relevant styling

interface GLTrackerToggleProps {
  onToggle: (isTrackerMode: boolean) => void; // Callback to notify parent of toggle state
}

const GLTrackerToggle: React.FC<GLTrackerToggleProps> = ({ onToggle }) => {
  const [isTrackerMode, setIsTrackerMode] = useState(() => {
    return localStorage.getItem('garageLevelTrackerMode') === 'true'; // Load mode from localStorage
  });

  useEffect(() => {
    localStorage.setItem('garageLevelTrackerMode', isTrackerMode.toString()); // Save mode state
    onToggle(isTrackerMode); // Notify parent
  }, [isTrackerMode, onToggle]);

  return (
    <div className="trackerToggle">
      <button onClick={() => setIsTrackerMode(!isTrackerMode)} className="toggleButton">
        Switch to {isTrackerMode ? 'Information Mode' : 'Tracker Mode'}
      </button>
    </div>
  );
};

export default GLTrackerToggle;
