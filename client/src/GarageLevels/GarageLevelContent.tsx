import BackToTop from '@/components/BackToTopButton'
import '@/CSS/GarageLevels.css'
import { GarageLevels } from '@/GarageLevels/interface'

export function GLContent({ GarageLevelKey, xp, garageLevel }: GarageLevels) {
    return (

        <section id={GarageLevelKey.toString()}>
            <div>

                <h2 className='mainHeading'>
                    {`Garage Level ${GarageLevelKey}`}
                </h2>

                <h3 className='subHeading'>Cars Available</h3>

            </div>

            <div className="xp">

                <h3 className='xpTitle'>XP Required <span className='xpRequirement'>{xp.toLocaleString('en-US')}</span>  
                </h3>

            </div>


            <div className='CarImagesContainer'>

                {
                    (garageLevel.length > 0) && garageLevel.map((gls, index) => (
                        <div key={gls.name + index}>
                            <img className='CarImages' src={gls.img} />
                            <p className='CarImagesCaption'>{gls.name}</p>
                        </div>
                    ))
                }

            </div>

            <BackToTop />

        </section>
    )
}
