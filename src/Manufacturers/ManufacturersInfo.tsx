import '../CSS/ManufacturersInfo.css';

interface ManufacturerInfoProps {
    info: string
}

const ManufacturersInfo: React.FC<ManufacturerInfoProps> = (props) => {
    return (
        <div>
            <p className="manufacturer-info">
                {props.info}
            </p>
        </div>
    )
}
export default ManufacturersInfo;
