import ManufacturerInfo from './ManufacturersInfo';

export type ManufacturerInfoType = {
    name: string
    info: string
}

type ManufacturersInfoDataPropsType = {
    infoData: ManufacturerInfoType[]
}

const ManufacturersInfoData: React.FC<ManufacturersInfoDataPropsType> = (props) => {
    return (
        <div>
            {props.infoData.map((data, index) => {
                return (<ManufacturerInfo key={index} info={data.info} />)
            })}
        </div>
    );
};

export default ManufacturersInfoData;
