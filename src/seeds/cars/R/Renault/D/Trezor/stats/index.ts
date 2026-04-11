import stock from '@/seeds/cars/R/Renault/D/trezor/stats/stock.json';
import stages from '@/seeds/cars/R/Renault/D/trezor/stats/stages';
import maxStar from '@/seeds/cars/R/Renault/D/trezor/stats/maxStar.json';
import gold from '@/seeds/cars/R/Renault/D/trezor/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };
