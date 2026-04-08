import stock from '@/seeds/cars/F/Ford/B/GT/stats/stock.json';
import stages from '@/seeds/cars/F/Ford/B/GT/stats/stages';
import maxStar from '@/seeds/cars/F/Ford/B/GT/stats/maxStar.json';
import gold from '@/seeds/cars/F/Ford/B/GT/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };
