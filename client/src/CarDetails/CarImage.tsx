import { Car } from "@/CarDetails/CarInterfaces";

interface CarImageProps {
  car: Car;
}

const CarImage: React.FC<CarImageProps> = ({ car }) => {
  const backendImageUrl = import.meta.env.VITE_PUBLIC_BASE_URL ?? "http://localhost:3001";

  // Normalize brand and model for the URL
  const normalizedBrand = car.Brand.replace(/\s+/g, "");
  const normalizedModel = car.Model.toLowerCase().replace(/\./g, "-").replace(/\s+/g, "-");

  // Build final URL path
  const carImagePath = `${backendImageUrl}/images/cars/${normalizedBrand}/${normalizedModel}.jpg`;

  return (
    <div className="carImageContainer">
      <img src={carImagePath} alt={`${car.Brand} ${car.Model}`} className="carImage" />
    </div>
  );
};

export default CarImage;
