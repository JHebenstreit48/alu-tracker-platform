import { garageLevelList } from './GarageLevelCars.ts';
import { GLContent } from './GarageLevelContent.tsx';
import '../CSS/GarageLevels.css'


export default function GarageLevelsJumpList() {
    return (
      <div>
        {/* X axis with all letters */}
        <div className='GlJumpList'>
          {garageLevelList.map((garageLevelNumber) => (
            <a className='brandAlphabetical' href={`#${garageLevelNumber.GarageLevelKey}`}>
              {garageLevelNumber.GarageLevelKey}
            </a>
          ))}
        </div>
  
        {/* Y axis or vertical axis with all brands and descriptions */}
        <div>
          {garageLevelList.map((gLs) => (
            <div key={gLs.GarageLevelKey} id={gLs.GarageLevelKey.toString()}>

              {/* ABC BRANDS */}
              {gLs.garageLevel.map((garageLevelNumber) => (
                <GLContent key={garageLevelNumber.number} {...garageLevelNumber} />
              ))}

            </div>
          ))}
        </div>
      </div>
    );
  }
