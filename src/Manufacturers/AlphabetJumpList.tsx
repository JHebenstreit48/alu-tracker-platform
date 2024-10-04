import '../CSS/Manufacturer.css';
import { abc } from './Brands';
import  { BrandDescription } from './ManufacturersInfo';

export default function abcList() {
    return (
      <div>
        {/* X axis with all letters */}
        <div className='jumpList'>
          {abc.map((letter) => (
            <a className='brandAlphabetical' href={`#${letter.letterKey}`}>
              {letter.letterKey}
            </a>
          ))}
        </div>
  
        {/* Y axis or vertical axis with all brands and descriptions */}
        <div>
          {abc.map((abc) => (
            <div key={abc.letterKey} id={abc.letterKey}>
              
              <h2 className='alphabetList'>
                {abc.letterKey}
              </h2>

              {/* ABC BRANDS */}
              {abc.brands.map((brand) => (
                <BrandDescription key={brand.brandsKey} {...brand} />
              ))}

            </div>
          ))}
        </div>
      </div>
    );
  }

