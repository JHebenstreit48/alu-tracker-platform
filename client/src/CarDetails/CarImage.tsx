import { Images } from "@/assets/images/images";
import { DynamicImageKeys } from "@/assets/images/DynamicImageKeys";
import { Car } from "@/CarDetails/CarInterfaces";

interface CarImageProps {
  car: Car;
}

const CarImage: React.FC<CarImageProps> = ({ car }) => {
  const carImagePath = (() => {
    const normalizedModel = car.Model.toLowerCase().replace(/\./g, "-").replace(/\s+/g, "-");
    const dynamicKey = `${car.Brand.toLowerCase().replace(/\s+/g, "-")}-${normalizedModel}`;
    return DynamicImageKeys[dynamicKey] && Images[DynamicImageKeys[dynamicKey]]
      ? Images[DynamicImageKeys[dynamicKey]]
      : Images["placeholder"];
  })();

  return (
    <div className="carImageContainer">
      <img src={carImagePath} alt={`${car.Brand} ${car.Model}`} className="carImage" />
    </div>
  );
};

export default CarImage;
