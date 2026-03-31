import car from '@/seeds/cars/I/InfernoAutomobili/S/Inferno/car.json';
import stats from '@/seeds/cars/I/InfernoAutomobili/S/Inferno/stats';
import upgrades from '@/seeds/cars/I/InfernoAutomobili/S/Inferno/upgrades';
import deltas from '@/seeds/cars/I/InfernoAutomobili/S/Inferno/deltas';

export default {...car, ...stats, ...upgrades, ...deltas};
