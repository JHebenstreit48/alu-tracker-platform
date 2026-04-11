import stock from '@/seeds/cars/R/Renault/C/rs01/stats/stock.json';
import stages from '@/seeds/cars/R/Renault/C/rs01/stats/stages';
import maxStar from '@/seeds/cars/R/Renault/C/rs01/stats/maxStar.json';
import gold from '@/seeds/cars/R/Renault/C/rs01/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };
