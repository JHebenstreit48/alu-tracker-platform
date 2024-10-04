import '../CSS/Manufacturer.css';

export function BrandDescription({ brandsKey, logo, info, }: { brandsKey: string, logo?: string, info: string, }) {
    return (

        <section key={brandsKey}>
            <div>

                <h3 className='manufacturerName'> {logo !== undefined && <img id={brandsKey.replace(/\s/g, '')} src={logo} alt={brandsKey} />}  {brandsKey} </h3>

            </div>

            <div className='Information'>
                <p className='manufacturerInfo'>{info}</p>
            </div>

        </section>
    )
}
