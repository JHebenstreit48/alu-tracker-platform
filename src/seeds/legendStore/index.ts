import allBlueprints from '@/seeds/LegendStore/Blueprints/CreditsCost/';
import allTradeCoins from '@/seeds/LegendStore/Blueprints/TradeCoinsCost';
import allImports from '@/seeds/LegendStore/Imports'

export const legendStoreData = {
  blueprints: allBlueprints,
  tokens: allTradeCoins,
  imports: allImports
};

export default legendStoreData;