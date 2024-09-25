import '../CSS/JumpList.css';

const abc = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'U', 'V', 'W', 'Z'];

export default function JumpList() {

    return (

        <>

            <section>

                <div className="brand-alphabetical">

                    <nav id="brand-alphabetical">
                        {
                            abc.map((letter) => (
                                <a key={letter} href={`#${letter.toLowerCase()}`}>{letter}</a>
                            ))
                        }


                    </nav>

                </div>

            </section>

        </>

    )
    
};
