import '../CSS/ManufacturersName.css'
import acuraLogo from "../assets/car-logos/acura-logo.png";


const manufacturers = [
    {
        src: acuraLogo,
        id: "acura",
        alt: "Acura logo",
        name: "Acura"
    },
    {
        src: "../assets/images/car-logos/ajlani-logo.png",
        id: "ajlani",
        alt: "Ajlani logo",
        name: "Ajlani"
    },
    {
        src: "../assets/images/car-logos/ajlani-logo.png",
        id: "ajlani",
        alt: "Ajlani logo",
        name: "Ajlani"
    }
];

const ManufacturersName: React.FC = () => {
    return (
        <div>
            {manufacturers.map((manufacturer, index) => (
                <div key={index}>
                    <img src={manufacturer.src} id={manufacturer.id} alt={manufacturer.alt} />
                    <p className="manufacturer-name">{manufacturer.name}</p>
                </div>
            ))}
        </div>
    );
};

export default ManufacturersName;
