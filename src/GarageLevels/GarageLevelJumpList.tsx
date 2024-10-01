import { garageLevelList } from './GarageLevelCars.ts';
import { GLContent } from './GarageLevelContent.tsx';
import '../CSS/GarageLevels.css'


export default function GarageLevelsJumpList() {
    return (
      <div>
        {/* X axis with all letters */}
        <div className='GlJumpList'>
          {garageLevelList.map((garageLevelNumber) => (
            <a className='brandAlphabetical' key={garageLevelNumber.GarageLevelKey} href={`#${garageLevelNumber.GarageLevelKey}`}>
              {garageLevelNumber.GarageLevelKey}
            </a>
          ))}
        </div>
  
        {/* Y axis or vertical axis with all brands and descriptions */}
        <div>

              {/* ABC BRANDS */}
              {garageLevelList.map((garageLevelNumber) => (
                <GLContent key={garageLevelNumber.GarageLevelKey} {...garageLevelNumber} />
              ))}

        </div>
      </div>
    );
  }
