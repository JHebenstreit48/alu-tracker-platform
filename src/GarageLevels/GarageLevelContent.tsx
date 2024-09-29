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

            <h3 className='xpTitle'>XP Required {xp}</h3>

            </div>

        <div>

        <img src={img} />
        <p>{ name }</p>
        <img src={img2} />
        <p> { name2 }</p>
        <img src={img3} />
        <p> { name3 }</p>
        <img src={img4}/>
        <p> { name4 }</p>

        </div>
                
            <p className='manufacturerInfo'>{}</p>

       </section>
    )
}
