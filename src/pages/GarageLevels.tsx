import '../CSS/Page.css'
import '../CSS/Header.css'
import Header from "../components/Header";
import PageTab from '../components/PageTab';
import GarageLevelsJumpList from '../GarageLevels/GarageLevelJumpList';

export default function GarageLevels() {

    return (

        <>

            <div>
                
                <PageTab title="Garage Levels">
                    <Header text="Garage Levels" />
                    <GarageLevelsJumpList />
                </PageTab>

            </div>

        </>

    )
}
