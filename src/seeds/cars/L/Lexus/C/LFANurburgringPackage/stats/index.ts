import stock from '@/seeds/cars/L/Lexus/C/LFANurburgringPackage/stats/stock.json';
import stages from '@/seeds/cars/L/Lexus/C/LFANurburgringPackage/stats/stages';
import maxStar from '@/seeds/cars/L/Lexus/C/LFANurburgringPackage/stats/maxStar.json';
import gold from '@/seeds/cars/L/Lexus/C/LFANurburgringPackage/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };