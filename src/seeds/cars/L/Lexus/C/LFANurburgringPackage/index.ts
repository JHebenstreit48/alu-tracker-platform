import car from '@/seeds/cars/L/Lexus/C/LFANurburgringPackage/car.json';
import stats from '@/seeds/cars/L/Lexus/C/LFANurburgringPackage/stats';
import upgrades from '@/seeds/cars/L/Lexus/C/LFANurburgringPackage/upgrades';
import deltas from '@/seeds/cars/L/Lexus/C/LFANurburgringPackage/deltas';

export default { ...car, ...stats, ...upgrades, ...deltas };