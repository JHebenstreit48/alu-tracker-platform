import stock from '@/seeds/cars/M/McLaren/C/GT/stats/stock.json';
import stages from '@/seeds/cars/M/McLaren/C/GT/stats/stages';
import maxStar from '@/seeds/cars/M/McLaren/C/GT/stats/maxStar.json';
import gold from '@/seeds/cars/M/McLaren/C/GT/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };
