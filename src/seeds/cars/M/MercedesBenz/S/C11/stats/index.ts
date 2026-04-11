import stock from '@/seeds/cars/M/MercedesBenz/S/C11/stats/stock.json';
import stages from '@/seeds/cars/M/MercedesBenz/S/C11/stats/stages';
import maxStar from '@/seeds/cars/M/MercedesBenz/S/C11/stats/maxStar.json';
import gold from '@/seeds/cars/M/MercedesBenz/S/C11/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };
