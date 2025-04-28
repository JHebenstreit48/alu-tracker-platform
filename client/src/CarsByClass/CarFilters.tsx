import { useState } from "react";
import "@/SCSS/Cars/CarFilters.scss"

interface CarFiltersProps {
    onSearch: (term: string) => void;
    onFilter: (stars: number | null) => void;
}

export default function CarFilters({ onSearch, onFilter }: CarFiltersProps) {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedStars, setSelectedStars] = useState<number | null>(null);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        onSearch(term);
    };

    const handleStarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const stars = value === "All" ? null : parseInt(value);
        setSelectedStars(stars);
        onFilter(stars);
    };

    return (

        <>

            <div className="carFilters">

                <select
                    className="starRanks"
                    value={selectedStars ?? "All"}
                    onChange={handleStarChange}
                >
                    <option value="All">All Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                    <option value="6">6 Stars</option>
                </select>


                <input
                    type="text"
                    className="carSearch"
                    placeholder="Search by Brand or Model"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />

            </div>

        </>
    );
}
