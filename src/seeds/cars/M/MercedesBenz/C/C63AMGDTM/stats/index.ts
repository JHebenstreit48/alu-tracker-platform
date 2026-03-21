import stock from '@/seeds/cars/M/MercedesBenz/C/C63AMGDTM/stats/stock.json';
import stages from '@/seeds/cars/M/MercedesBenz/C/C63AMGDTM/stats/stages';
import maxStar from '@/seeds/cars/M/MercedesBenz/C/C63AMGDTM/stats/maxStar.json';
import gold from '@/seeds/cars/M/MercedesBenz/C/C63AMGDTM/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };