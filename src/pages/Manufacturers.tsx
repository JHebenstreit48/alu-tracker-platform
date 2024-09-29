import '../CSS/Page.css'
import '../CSS/Header.css'
import Header from "../components/Header";
import JumpList from "../Manufacturers/AlphabetJumpList";
import PageTab from '../components/PageTab';

export default function Manufacturers() {

    return (

        <>

            <div>

                <PageTab title="Manufacturers">
                    <Header text="Manufacturers" />
                    <JumpList />
                </PageTab>


            </div>
        </>

    )
}
