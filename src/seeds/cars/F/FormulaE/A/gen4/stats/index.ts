import stock from '@/seeds/cars/F/FormulaE/A/gen4/stats/stock.json';
import stages from '@/seeds/cars/F/FormulaE/A/gen4/stats/stages';
import maxStar from '@/seeds/cars/F/FormulaE/A/gen4/stats/maxStar.json';
import gold from '@/seeds/cars/F/FormulaE/A/gen4/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };
