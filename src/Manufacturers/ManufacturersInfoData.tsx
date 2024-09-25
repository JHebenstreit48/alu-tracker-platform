import ManufacturerInfo from './ManufacturersInfo';


const infoData = [
    {
        name: "Ajlani Motors",
        info: "Ajlani Motors is a UAE based company founded by Bashar Ajlani a car designer and art director. His first car the Ajlani Drakuma concept was unveiled at the Dubai International Motor Show in November of 2019. Bashar Ajlani has also won multiple 1st place awards for various works. This includes a Platinum position with A' Design Award and Competition. He even won a 1st place Masters Scholarship by Pininfarina in automotive design."
    },
    {
        name: "Alfa Romeo",
        info: "Alfa Romeo's origins date back to June 24th of 1910. It was the result of a take over of the Italian automobile manufacturer Darracq automobile company. The Alfa portion of the name is an acronym for Anonima Lombarda Fabbrica Automobili (A.L.F.A)."
    },
    {

    },
    {

    },
    {

    },
    {

    },
    {

    },
    {
        name: "Aston Martin",
        info: "Aston Martin Lagonda Global Holdings plc is a British independent manufacturer of luxury sports cars and grand tourers. Its predecessor was founded in 1913 by Lionel Martin and Robert Bamford. Steered from 1947 by David Brown, it became associated with expensive grand touring cars in the 1950s and 1960s, and with the fictional character James Bond following his use of a DB5 model in the 1964 film Goldfinger."
    },
    {
        name: "Audi",
        info: "Audi AG is a German automobile manufacturer that designs, engineers, produces, markets and distributes luxury vehicles. Audi is a wholly owned subsidiary of the Volkswagen Group and has its roots at Ingolstadt, Bavaria, Germany. Audi-branded vehicles are produced in nine production facilities worldwide."
    },
    {
        name: "BMW",
        info: "Bayerische Motoren Werke AG, commonly referred to as BMW, is a German multinational corporation which produces luxury vehicles and motorcycles. The company was founded in 1916 as a manufacturer of aircraft engines, which it produced from 1917 until 1918 and again from 1933 to 1945."
    },
    {
        name: "Bugatti",
        info: "Automobiles Ettore Bugatti was a French car manufacturer of high-performance automobiles, founded in 1909 in the then-German city of Molsheim, Alsace by the Italian-born industrial designer Ettore Bugatti. The cars were known for their design beauty and for their."
    },
]

const ManufacturersInfoData: React.FC = () => {
    return (
        <div>

        {
            infoData.map((data, index) => {
                return (
                    <ManufacturerInfo key={index}>
                        {data.info}
                    </ManufacturerInfo>
                )
            })
        }
            {/* <ManufacturerInfo>
                Ajlani Motors is a UAE based company founded by Bashar Ajlani a car
                designer and art director. His first car the Ajlani Drakuma concept was unveiled at the
                Dubai International Motor Show in November of 2019. Bashar Ajlani has also won multiple 1st
                place awards for various works. This includes a Platinum position with A' Design Award and
                Competition. He even won a 1st place Masters Scholarship by Pininfarina in automotive
                design.
            </ManufacturerInfo> */}
            {/* Add more ManufacturerInfo components here for other manufacturers */}
        </div>
    );
};

export default ManufacturersInfoData;
