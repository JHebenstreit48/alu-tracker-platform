import stock from '@/seeds/cars/N/Nissan/D/LeafNismoRC/stats/stock.json';
import stages from '@/seeds/cars/N/Nissan/D/LeafNismoRC/stats/stages';
import maxStar from '@/seeds/cars/N/Nissan/D/LeafNismoRC/stats/maxStar.json';
import gold from '@/seeds/cars/N/Nissan/D/LeafNismoRC/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };
