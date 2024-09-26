import '../CSS/Page.css'
import '../CSS/Header.css'
import Header from "../components/Header";
import JumpList from "../Manufacturers/AlphabetJumpList";
import PageTab from '../components/PageTab';
import ManufacturersAlphabet from '../Manufacturers/ManufacturersAlphabet';
import ManufacturersName from '../Manufacturers/ManufacturerName';
import ManufacturersInfoData from '../Manufacturers/DataLayout';
import { infoData } from '../Manufacturers/Data';

export default function Manufacturers() {

    return (

        <>

            <div>

                <PageTab title="Manufacturers">
                    <Header text="Manufacturers" />
                    <JumpList />
                    <ManufacturersAlphabet />
                    <ManufacturersName />
                    <ManufacturersInfoData infoData={infoData} />
                </PageTab>


            </div>
        </>

    )
}
