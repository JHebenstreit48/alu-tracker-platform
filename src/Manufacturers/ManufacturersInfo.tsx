import '../CSS/ManufacturersInfo.css';

interface ManufacturerInfoProps {
    children: React.ReactNode;
}

const ManufacturersInfo: React.FC<ManufacturerInfoProps> = ({children}) => {

    return (

        <div>

        <p className="manufacturer-info">
            {children}
        </p>

        </div>

    )
}
export default ManufacturersInfo;
