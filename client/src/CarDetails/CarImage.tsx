import { Car } from "@/CarDetails/CarInterfaces";

// Define backend URL for image fetching (same as in ImageCarousel.tsx)
const backendImageUrl = import.meta.env.VITE_PUBLIC_BASE_URL ?? "http://localhost:3001";

interface CarImageProps {
  car: Car;
}

const CarImage: React.FC<CarImageProps> = ({ car }) => {
  // Dynamically construct the image URL from the backend
  const carImagePath = car.Image
    ? `${backendImageUrl}${car.Image}` // Ensure we concatenate the image path properly
    : "path_to_placeholder_image.jpg"; // Placeholder image when no car image exists

  return (
    <div className="carImageContainer">
      <img src={carImagePath} alt={`${car.Brand} ${car.Model}`} className="carImage" />
    </div>
  );
};

export default CarImage;
