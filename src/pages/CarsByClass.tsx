import Header from "../components/Header";
import PageTab from "../components/PageTab";
import '../CSS/Header.css';
import '../CSS/Page.css';
import ClassTables from "../CarsByClass/classTables";
import '../CSS/CarsByClassTables.css';

export default function CarsByClass() {

    return (

        <>

            <div>
                
                <PageTab title="Cars by Class">
                    <Header text="Cars by Class" />
                    <ClassTables/>
                </PageTab>

            </div>

        </>

    )
}
