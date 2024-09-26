import '../CSS/ManufacturersAlphabet.css'
import ManufacturersInfoData from './DataLayout'
import { ManufacturerInfoType } from './DataLayout'
import { infoData } from './Data'
  
  type AlphabeticObjectType = {
    letter: string
    infoData: ManufacturerInfoType[]
  }

const manufacturerAbc: AlphabeticObjectType[] = [
    {  letter: "A", infoData: [] },
    {  letter: "B", infoData: [] },
    {  letter: "C", infoData: [] },
    {  letter: "D", infoData: [] },
    {  letter: "E", infoData: [] },
    {  letter: "F", infoData: [] },
    {  letter: "G", infoData: [] },
    {  letter: "H", infoData: [] },
    {  letter: "I", infoData: [] },
    {  letter: "J", infoData: [] },
    {  letter: "K", infoData: [] },
    {  letter: "L", infoData: [] },
    {  letter: "M", infoData: [] },
    {  letter: "N", infoData: [] },
    {  letter: "P", infoData: [] },
    {  letter: "R", infoData: [] },
    {  letter: "S", infoData: [] },
    {  letter: "T", infoData: [] },
    {  letter: "U", infoData: [] },
    {  letter: "V", infoData: [] },
    {  letter: "W", infoData: [] },
    {  letter: "Z", infoData: [] },
];

// for ()

export default function ManufacturersAlphabet() {
    return (
        <div>
            {manufacturerAbc.map((item: AlphabeticObjectType, index) => <>
                <h2 key={index} className="alphabetList" id={item.letter.toLowerCase()}>
                    {item.letter}
                </h2>
                <ManufacturersInfoData infoData={item.infoData} />
            </>
            )}
        </div>
    );
}
