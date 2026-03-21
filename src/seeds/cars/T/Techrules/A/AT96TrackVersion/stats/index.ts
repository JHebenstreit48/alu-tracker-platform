import stock from '@/seeds/cars/T/Techrules/A/AT96TrackVersion/stats/stock.json';
import stages from '@/seeds/cars/T/Techrules/A/AT96TrackVersion/stats/stages';
import maxStar from '@/seeds/cars/T/Techrules/A/AT96TrackVersion/stats/maxStar.json';
import gold from '@/seeds/cars/T/Techrules/A/AT96TrackVersion/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };