import '../CSS/GarageLevels.css'

export function GLContent({ number, xp, img, img2, img3, img4, name, name2, name3, name4, }: { number: number, xp: string, img: string, img2?: string, img3?: string, img4?: string, name: string, name2?: string, name3?: string, name4?: string, }) {
    return (

        <section>
            <div>

                <h2 className='mainHeading'>
                    {`Garage Level ${number}`}
                </h2>

                <h3 className='subHeading'>Cars Available</h3>

            </div>

            <div className="xp">

                <h3 className='xpTitle'>XP Required <span className='xpRequirement'>{xp}</span></h3>

            </div>

            <div className='CarImagesContainer'>

                <div>
                    <img className='CarImages' src={img} />
                    <p className='CarImagesCaption'>{name}</p>
                </div>

                <div>
                    <img className='CarImages' src={img2} />
                    <p className='CarImagesCaption'> {name2}</p>
                </div>

                <div>
                    <img className='CarImages' src={img3} />
                    <p className='CarImagesCaption'> {name3}</p>
                </div>

                    <div>
                        <img className='CarImages' src={img4} />
                        <p className='CarImagesCaption'> {name4}</p>
                    </div>
            </div>

        </section>
    )
}
