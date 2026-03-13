import uncommon from '@/seeds/LegendStore/BlueprintData/D/Uncommon.json';
import rare from '@/seeds/LegendStore/BlueprintData/D/Rare.json';

// Only import Epic if/when Class D gets Epic cars
// import epic from './Epic.json';

const classD = [
  ...uncommon,
  ...rare,
  // ...epic,
];

export default classD;