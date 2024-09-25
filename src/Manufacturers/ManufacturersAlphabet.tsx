
import '../CSS/ManufacturersAlphabet.css'

const manufacturerAbc = [
    { className: "alphabetList", content: "A" },
    { className: "alphabetList", content: "B" },
    { className: "alphabetList", content: "C" },
    { className: "alphabetList", content: "D" },
    { className: "alphabetList", content: "E" },
    { className: "alphabetList", content: "F" },
    { className: "alphabetList", content: "G" },
    { className: "alphabetList", content: "H" },
    { className: "alphabetList", content: "I" },
    { className: "alphabetList", content: "J" },
    { className: "alphabetList", content: "K" },
    { className: "alphabetList", content: "L" },
    { className: "alphabetList", content: "M" },
    { className: "alphabetList", content: "N" },
    { className: "alphabetList", content: "P" },
    { className: "alphabetList", content: "R" },
    { className: "alphabetList", content: "S" },
    { className: "alphabetList", content: "T" },
    { className: "alphabetList", content: "U" },
    { className: "alphabetList", content: "V" },
    { className: "alphabetList", content: "W" },
    { className: "alphabetList", content: "Z" },
    // Add more letters as needed
];

export default function ManufacturersAlphabet() {
    return (
        <div>
            {manufacturerAbc.map((item, index) => (
                <h2 key={index} className={item.className} id={item.content.toLowerCase()}>
                    {item.content}
                </h2>
            ))}
        </div>
    );
}
