import '../CSS/Page.css'
import '../CSS/Header.css'
import Header from "../components/Header";
import JumpList from "../Manufacturers/AlphabetJumpList";
import PageTab from '../components/PageTab';
import ManufacturersInfoData from '../Manufacturers/ManufacturersInfoData';
import ManufacturersAlphabet from '../Manufacturers/ManufacturersAlphabet';
import ManufacturersName from '../Manufacturers/ManufacturerName';

export default function Manufacturers() {

    return (

        <>

            <div>
                
                <PageTab title="Manufacturers">
                    <Header text="Manufacturers" />
                    <JumpList />
                    <ManufacturersAlphabet />
                    <ManufacturersName />
                    <ManufacturersInfoData />
                </PageTab>


            </div>
        </>

    )
}
