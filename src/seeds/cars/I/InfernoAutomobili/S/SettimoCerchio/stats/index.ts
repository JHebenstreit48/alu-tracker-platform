import stock from '@/seeds/cars/I/InfernoAutomobili/S/SettimoCerchio/stats/stock.json';
import stages from '@/seeds/cars/I/InfernoAutomobili/S/SettimoCerchio/stats/stages';
import maxStar from '@/seeds/cars/I/InfernoAutomobili/S/SettimoCerchio/stats/maxStar.json';
import gold from '@/seeds/cars/I/InfernoAutomobili/S/SettimoCerchio/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };
