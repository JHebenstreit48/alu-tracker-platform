import { useState, useEffect } from "react";
import Header from "@/components/Header";
import PageTab from "@/components/PageTab";
import GarageLevelsDropDown from "@/GarageLevels/GarageLevelsDropDown";
import GLTrackerToggle from "@/GarageLevels/GLTrackerToggle";
import GarageLevelTracker from "@/GarageLevels/GarageLevelTracker";
import { GarageLevelsInterface } from "@/GarageLevels/interface";
import "@/SCSS/GarageLevels/GarageLevelTracker.scss";
import "@/SCSS/GarageLevels/GarageLevels.scss";

export default function GarageLevelsPage() {
  const [garageLevels, setGarageLevels] = useState<GarageLevelsInterface[]>([]);
  const [isTrackerMode, setIsTrackerMode] = useState(() => {
    return localStorage.getItem("garageLevelTrackerMode") === "true";
  });

  useEffect(() => {
    const fetchGarageLevels = async () => {
      try {
        const res = await fetch("/api/garage-levels");
        const data: GarageLevelsInterface[] = await res.json();
        setGarageLevels(data);
      } catch (err) {
        console.error("❌ Failed to fetch garage level data:", err);
      }
    };

    fetchGarageLevels();
  }, []);

  return (
    <div>
      <PageTab title="Garage Levels">
        <Header text="Garage Levels" />
        <GLTrackerToggle onToggle={setIsTrackerMode} />
        {isTrackerMode && <GarageLevelTracker levels={garageLevels} />}
        <GarageLevelsDropDown levels={garageLevels} />
      </PageTab>
    </div>
  );
}
