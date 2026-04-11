import car from '@/seeds/cars/R/Renault/D/trezor/car.json';
import stats from '@/seeds/cars/R/Renault/D/trezor/stats';
import upgrades from '@/seeds/cars/R/Renault/D/trezor/upgrades';
import deltas from '@/seeds/cars/R/Renault/D/trezor/deltas';

export default {...car, ...stats, ...upgrades, ...deltas};
