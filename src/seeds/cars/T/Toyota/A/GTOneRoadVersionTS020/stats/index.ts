import stock from '@/seeds/cars/T/Toyota/A/GTOneRoadVersionTS020/stats/stock.json';
import stages from '@/seeds/cars/T/Toyota/A/GTOneRoadVersionTS020/stats/stages';
import maxStar from '@/seeds/cars/T/Toyota/A/GTOneRoadVersionTS020/stats/maxStar.json';
import gold from '@/seeds/cars/T/Toyota/A/GTOneRoadVersionTS020/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };
