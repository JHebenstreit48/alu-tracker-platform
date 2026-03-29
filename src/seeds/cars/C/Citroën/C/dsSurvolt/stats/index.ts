import stock from '@/seeds/cars/C/Citroën/C/DSSurvolt/stats/stock.json';
import stages from '@/seeds/cars/C/Citroën/C/DSSurvolt/stats/stages';
import maxStar from '@/seeds/cars/C/Citroën/C/DSSurvolt/stats/maxStar.json';
import gold from '@/seeds/cars/C/Citroën/C/DSSurvolt/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };
