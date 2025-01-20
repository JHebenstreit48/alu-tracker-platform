import BackToTop from '@/components/BackToTopButton';
import '@/CSS/Manufacturer.css';

export function BrandDescription({
    brandsKey,
    logo,
    info,
    resources,
}: {
    brandsKey: string,
    logo?: string,
    info: string,
    resources?: {
        text: string,
        url: string,
    }[],
}) {

    return (
        <section key={brandsKey}>
            <div>
                <h3 className="manufacturerName">
                    {logo !== undefined && (
                        <img
                            id={brandsKey.replace(/\s/g, '')}
                            src={logo}
                            alt={brandsKey}
                        />
                    )}
                    {brandsKey}
                </h3>
            </div>

            <div className="manufacturerInfo">
                <p>{info}</p>

                {/* Render Resources if Provided */}
                {resources && resources.length > 0 && (
                    <div className="resourcesContainer">
                        <h4 className="resourcesHeader">Resources</h4>
                        <ul className="resourcesList">
                            {resources.map((resource, index) => (
                                <li key={index}>
                                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                        {resource.text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <BackToTop />

        </section>
    );
}
