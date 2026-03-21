import stock from '@/seeds/cars/M/MercedesBenz/B/SLRMcLaren/stats/stock.json';
import stages from '@/seeds/cars/M/MercedesBenz/B/SLRMcLaren/stats/stages';
import maxStar from '@/seeds/cars/M/MercedesBenz/B/SLRMcLaren/stats/maxStar.json';
import gold from '@/seeds/cars/M/MercedesBenz/B/SLRMcLaren/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };