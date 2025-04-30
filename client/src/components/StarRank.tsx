import "@/SCSS/MiscellaneousStyle/StarRank.scss";

interface StarRatingProps {
  count: number; // Number of stars (3–6 typically)
}

const backendBaseUrl = import.meta.env.VITE_PUBLIC_BASE_URL;

const StarRank: React.FC<StarRatingProps> = ({ count }) => {
  // Prevent runtime crashes if count is undefined or invalid
  const safeCount = Number.isInteger(count) && count > 0 ? count : 0;

  return (
    <div className="StarRating">
      {Array.from({ length: safeCount }).map((_, i) => (
        <img
          key={i}
          src={`${backendBaseUrl}/images/icons/star.png`}
          alt="Star"
          className="starIcon"
        />
      ))}
    </div>
  );
};

export default StarRank;
