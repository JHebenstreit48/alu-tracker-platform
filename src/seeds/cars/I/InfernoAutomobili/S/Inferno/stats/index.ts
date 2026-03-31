import stock from '@/seeds/cars/I/InfernoAutomobili/S/Inferno/stats/stock.json';
import stages from '@/seeds/cars/I/InfernoAutomobili/S/Inferno/stats/stages';
import maxStar from '@/seeds/cars/I/InfernoAutomobili/S/Inferno/stats/maxStar.json';
import gold from '@/seeds/cars/I/InfernoAutomobili/S/Inferno/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };
