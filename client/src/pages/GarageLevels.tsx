import Header from "../components/Header.tsx";
import PageTab from '../components/PageTab.tsx';
import GarageLevelsDropDown from "../GarageLevels/GarageLevelsDropDown.tsx";

export default function GarageLevels() {

    return (

        <>

            <div>

                <PageTab title="Garage Levels">
                    <Header text="Garage Levels" />
                    <GarageLevelsDropDown />
                </PageTab>

            </div>

        </>

    )
}
