import Header from "../components/Header";
import PageTab from "../components/PageTab";
import LegendStoreFilters from "../LegendStore/LegendStoreFiltersAndSearch";
import LegendStoreTables from "../LegendStore/LegendStoreTables";
import { useState } from "react";

export default function LegendStorePrices() {
  const [filters, setFilters] = useState<{
    selectedClass: string;
    selectedCarRarity: string | null; // Match type in LegendStoreFiltersAndSearch
    searchTerm: string;
    selectedCumulativeLevel: number | null;
    selectedIndividualLevel: number | null;
    selectedStarRank: number | null;
  }>({
    selectedClass: "All Levels", // Updated default value to "All Levels"
    selectedCarRarity: null,
    searchTerm: "", // Default to an empty string
    selectedCumulativeLevel: null,
    selectedIndividualLevel: null,
    selectedStarRank: null,
  });

  return (
    <>
      <div>
        <PageTab title="Legend Store Prices">
          <Header text="Legend Store" />
          <LegendStoreFilters onFiltersChange={setFilters} />
          <LegendStoreTables
            selectedClass={filters.selectedClass}
            selectedCarRarity={filters.selectedCarRarity}
            searchTerm={filters.searchTerm}
            selectedCumulativeLevel={filters.selectedCumulativeLevel}
            selectedIndividualLevel={filters.selectedIndividualLevel}
            selectedStarRank={filters.selectedStarRank}
          />
        </PageTab>
      </div>
    </>
  );
}

