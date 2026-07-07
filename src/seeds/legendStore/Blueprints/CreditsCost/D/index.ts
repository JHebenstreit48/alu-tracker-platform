import uncommon from '@/seeds/LegendStore/Blueprints/CreditsCost/D/Uncommon.json';
import rare from '@/seeds/LegendStore/Blueprints/CreditsCost/D/Rare.json';

// Only import Epic if/when Class D gets Epic cars
// import epic from './Epic.json';

const classD = [
  ...uncommon,
  ...rare,
  // ...epic,
];

export default classD;