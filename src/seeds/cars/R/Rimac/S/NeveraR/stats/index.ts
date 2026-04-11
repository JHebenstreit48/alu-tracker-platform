import stock from '@/seeds/cars/R/Rimac/S/neveraR/stats/stock.json';
import stages from '@/seeds/cars/R/Rimac/S/neveraR/stats/stages';
import maxStar from '@/seeds/cars/R/Rimac/S/neveraR/stats/maxStar.json';
import gold from '@/seeds/cars/R/Rimac/S/neveraR/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };
