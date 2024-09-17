import '../CSS/Page.css'
import '../CSS/Header.css'
import Header from "../components/Header";
import JumpList from "../Manufacturers/AlphabetJumpList";

export default function Manufacturers() {

    return (

        <>

            <div>
                <Header text="Manufacturers" />
                <JumpList />
            </div>
        </>

    )
}
