import '../CSS/ManufacturersInfo.css';

export function BrandDescription({ brandsKey, logo, info, }: { brandsKey: string, logo?: string, info: string, }) {
    return (

        <section key={brandsKey}>
            <div>

                <h3 className='manufacturerName'> {logo !== undefined && <img id={brandsKey} src={logo} alt={brandsKey} />}  {brandsKey} </h3>

            </div>
            <p className='manufacturerInfo'>{info}</p>
        </section>
    )
}
