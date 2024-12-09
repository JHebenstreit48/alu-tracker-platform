import Header from "../components/Header";
import JumpList from "../Manufacturers/AlphabetJumpList";
import PageTab from '../components/PageTab';

export default function Manufacturers() {

    return (

        <>

            <div>

                <PageTab title="Brands">
                    <Header text="Brands" />
                    <JumpList />
                </PageTab>

            </div>
            
        </>

    )
}
