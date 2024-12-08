export interface Car {
  class: string; // D, C, B, A, S
  brand: string; // Car brand
  model: string; // Car model
  garageLevel: number; // Garage level required to purchase
  starRank?: number; // Maximum star rank of the car
  carRarity?: string; // rare, epic, legendary with rare being the most common, epic above that, and legendary being the rarest or highest tier
  blueprintPrices: number[]; // Prices for blueprints 1-5
}

export const cars: Car[] = [
  { class: "D", brand: "Mitsubishi", model: "Lancer Evolution", starRank: 3, carRarity: "Rare", garageLevel: 1, blueprintPrices: [10000, 15000, 20000, 25000, 30000] },
  { class: "D", brand: "BMW", model: "Z4 LCI E89", garageLevel: 1, starRank: 3, carRarity: "Rare", blueprintPrices: [10000, 15000, 20000, 25000, 30000] },
  { class: "D", brand: "Chevrolet", model: "Camaro LT", garageLevel: 1, starRank: 3, carRarity: "Rare", blueprintPrices: [10000, 15000, 20000, 25000, 30000] },
  { class: "D", brand: "Lotus", model: "Elise Sprint 220", garageLevel: 5, starRank: 4, blueprintPrices: [33000, 50000, 67000, 84000, 101000] },
  { class: "D", brand: "Nissan", model: "370z Nismo", garageLevel: 2, starRank: 3, carRarity: "Rare", blueprintPrices: [10000, 15000, 20000, 25000, 30000] },
  { class: "D", brand: "DS Automobiles", model: "DS E-Tense", garageLevel: 2, starRank: 3, carRarity: "Rare", blueprintPrices: [10000, 15000, 20000, 25000, 30000] },
  { class: "D", brand: "Volkswagen", model: "XL Sport Concept", garageLevel: 3, starRank: 3, carRarity: "Rare", blueprintPrices: [10000, 15000, 20000, 25000, 30000] },
  { class: "D", brand: "Mazda", model: "Furai", garageLevel: 6, starRank: 4, carRarity: "Epic", blueprintPrices: [33000, 50000, 67000, 84000, 101000] },
  { class: "D", brand: "Porsche", model: "911 Targa 4S", garageLevel: 3, starRank: 4, carRarity: "Epic", blueprintPrices: [33000, 50000, 67000, 84000, 101000] },
  { class: "D", brand: "Dodge", model: "Challenger Hemi Scat Pk.", starRank: 3, garageLevel: 3, carRarity: "Rare", blueprintPrices: [10000, 15000, 20000, 25000, 30000] },
  { class: "D", brand: "Porsche", model: "718 Cayman", garageLevel: 4, starRank: 4, carRarity: "Epic", blueprintPrices: [33000, 50000, 67000, 84000, 101000] },
  { class: "D", brand: "Ginetta", model: "G60", garageLevel: 4, starRank: 4, carRarity: "Epic", blueprintPrices: [33000, 50000, 67000, 84000, 101000] },
  { class: "D", brand: "TVR", model: "Griffith", garageLevel: 5, starRank: 4, blueprintPrices: [33000, 50000, 67000, 84000, 101000] },
  { class: "D", brand: "Ford", model: "Shelby GT350R", garageLevel: 6, starRank: 4, carRarity: "Epic", blueprintPrices: [33000, 50000, 67000, 84000, 101000] },
  { class: "D", brand: "Infiniti", model: "Project Black S", garageLevel: 21, starRank: 4, carRarity: "Epic", blueprintPrices: [33000, 50000, 67000, 84000, 101000] },
  { class: "D", brand: "Lamborghini", model: "Countach 25th Anniversary", garageLevel: 21, starRank: 4, carRarity: "Epic", blueprintPrices: [33000, 50000, 67000, 84000, 101000] },
  { class: "D", brand: "Lotus", model: "Emira", garageLevel: 22, starRank: 4, carRarity: "Epic", blueprintPrices: [33000, 50000, 67000, 84000, 101000] },

  
  { class: "C", brand: "BMW", model: "M4 GTS", garageLevel: 6, blueprintPrices: [13000, 19500, 26000, 32500, 39000] },
  { class: "C", brand: "Mercedes-Benz", model: "AMG GT S", garageLevel: 4, blueprintPrices: [13000, 19500, 26000, 32500, 39000] },
  { class: "C", brand: "Dodge", model: "Challenger SRT8", garageLevel: 1, blueprintPrices: [13000, 19500, 26000, 32500, 39000] },
  { class: "C", brand: "Chevrolet", model: "Camaro ZL1 50th Ed.", garageLevel: 2, blueprintPrices: [13000, 19500, 26000, 32500, 39000] },
  { class: "C", brand: "BMW", model: "3.0 CSL Hommage", garageLevel: 2, blueprintPrices: [13000, 19500, 26000, 32500, 39000] },
  { class: "C", brand: "Lotus", model: "Evora Sport 410", garageLevel: 3, blueprintPrices: [13000, 19500, 26000, 32500, 39000] },
  { class: "C", brand: "Dodge", model: "Viper ACR", garageLevel: 7, blueprintPrices: [54000, 81000, 108000, 135000, 162000] },
  { class: "C", brand: "Maserati", model: "Alfieri", garageLevel: 11, blueprintPrices: [54000, 81000, 108000, 135000, 162000] },
  { class: "C", brand: "Vencer", model: "Sarthe", garageLevel: 11, blueprintPrices: [120000, 180000, 240000, 300000, 360000] },
  { class: "C", brand: "Artega", model: "Scalo Superelletra", garageLevel: 7, blueprintPrices: [54000, 81000, 108000, 135000, 162000] },
  { class: "C", brand: "Pininfarina", model: "H2 Speed", garageLevel: 8, blueprintPrices: [54000, 81000, 108000, 135000, 162000] },
  { class: "C", brand: "Acura", model: "2017 NSX", garageLevel: 10, blueprintPrices: [54000, 81000, 108000, 135000, 162000] },
  { class: "C", brand: "Arrinera", model: "Hussarya 33", garageLevel: 14, blueprintPrices: [120000, 180000, 240000, 300000, 360000] },
  

  { class: "B", brand: "Ferrari", model: "488 GTB", garageLevel: 8, blueprintPrices: [60000, 90000, 120000, 150000, 180000] },
  { class: "B", brand: "Exotic Rides", model: "W70", garageLevel: 6, blueprintPrices: [18000, 27000, 36000, 45000, 54000] },
  { class: "B", brand: "Aston Martin", model: "DB11", garageLevel: 5, blueprintPrices: [18000, 27000, 36000, 45000, 54000] },
  { class: "B", brand: "Jaguar", model: "F-Type SVR", garageLevel: 5, blueprintPrices: [60000, 90000, 120000, 150000, 180000] },
  { class: "B", brand: "Porsche", model: "911 GTS Coupe", garageLevel: 4, blueprintPrices: [18000, 27000, 36000, 45000, 54000] },
  { class: "B", brand: "Ford", model: "GT", garageLevel: 7, blueprintPrices: [60000, 90000, 120000, 150000, 180000] },
  { class: "B", brand: "Italdesign", model: "Zerouno", garageLevel: 8, blueprintPrices: [60000, 90000, 120000, 150000, 180000] },
  { class: "B", brand: "Ferrari", model: "F12tdf", garageLevel: 13, blueprintPrices: [126000, 189000, 252000, 315000, 378000] },
  { class: "B", brand: "Glickenhaus", model: "003S", garageLevel: 10, blueprintPrices: [60000, 90000, 120000, 150000, 180000] },
  { class: "B", brand: "Chevrolet", model: "Corvette Grand Sport", garageLevel: 13, blueprintPrices: [126000, 189000, 252000, 315000, 378000] },
  { class: "B", brand: "Apollo", model: "N", garageLevel: 14, blueprintPrices: [126000, 189000, 252000, 315000, 378000] },
  { class: "B", brand: "Aston Martin", model: "Vantage GT12", garageLevel: 15, blueprintPrices: [126000, 189000, 252000, 315000, 378000] },
  { class: "B", brand: "Aston Martin", model: "DBS Superleggera", garageLevel: 16, blueprintPrices: [126000, 189000, 252000, 315000, 378000] },
  { class: "B", brand: "Lamborghini", model: "Huracan Evo Spyder", garageLevel: 18, blueprintPrices: [126000, 189000, 252000, 315000, 378000] },
  

  { class: "A", brand: "Nissan", model: "GT-R Nismo", garageLevel: 8, blueprintPrices: [57000, 86000, 115000, 144000, 173000] },
  { class: "A", brand: "Ferrari", model: "LaFerrari", garageLevel: 10, blueprintPrices: [144000, 216000, 288000, 360000, 432000] },
  { class: "A", brand: "Aston Martin", model: "Vulcan", garageLevel: 7, blueprintPrices: [57000, 86000, 115000, 144000, 173000] },
  { class: "A", brand: "Pagani", model: "Huayra BC", garageLevel: 19, blueprintPrices: [228000, 338000, 448000, 558000, 668000] },
  { class: "A", brand: "McLaren", model: "P1", garageLevel: 12, blueprintPrices: [144000, 216000, 288000, 360000, 432000] },
  { class: "A", brand: "Lamborghini", model: "Aventador SV Coupe", garageLevel: 12, blueprintPrices: [144000, 216000, 288000, 360000, 432000] },
  { class: "A", brand: "Dodge", model: "Viper GTS", garageLevel: 9, blueprintPrices: [57000, 86000, 115000, 144000, 173000] },
  { class: "A", brand: "Ferrari", model: "J50", garageLevel: 9, blueprintPrices: [57000, 86000, 115000, 144000, 173000] },
  { class: "A", brand: "Lamborghini", model: "Aventador J", garageLevel: 15, blueprintPrices: [144000, 216000, 288000, 360000, 432000] },
  { class: "A", brand: "Porsche", model: "918 Spyder", garageLevel: 14, blueprintPrices: [144000, 216000, 288000, 360000, 432000] },
  { class: "A", brand: "McLaren", model: "570S Spider", garageLevel: 17, blueprintPrices: [228000, 338000, 448000, 558000, 668000] },
  { class: "A", brand: "Vanda Electrics", model: "Dendrobium", garageLevel: 17, blueprintPrices: [228000, 338000, 448000, 558000, 668000] },
  { class: "A", brand: "Ferrari", model: "LaFerrari Aperta", garageLevel: 19, blueprintPrices: [228000, 338000, 448000, 558000, 668000] },
  { class: "A", brand: "Genty", model: "Akylone", garageLevel: 20, blueprintPrices: [228000, 338000, 448000, 558000, 668000] },


  { class: "S", brand: "Ferrari", model: "FXX K", garageLevel: 12, blueprintPrices: [180000, 270000, 360000, 450000, 540000] },
  { class: "S", brand: "Lamborghini", model: "Centenario", garageLevel: 11, starRank: 5, carRarity: "Legendary", blueprintPrices: [180000, 270000, 360000, 450000, 540000] },
  { class: "S", brand: "Koenigsegg", model: "Regera", garageLevel: 18, blueprintPrices: [300000, 450000, 600000, 750000, 900000] },
  { class: "S", brand: "Bugatti", model: "Chiron", garageLevel: 20, blueprintPrices: [300000, 450000, 600000, 750000, 900000] },
  { class: "S", brand: "Icona", model: "Vulcano Titanium", garageLevel: 13, starRank: 5, carRarity: "Legendary", blueprintPrices: [180000, 270000, 360000, 450000, 540000] },
  { class: "S", brand: "W Motors", model: "Lykan Hypersport", garageLevel: 16, blueprintPrices: [180000, 270000, 360000, 450000, 540000] },
  // { class: "S", brand: "Lamborghini", model: "Veneno", garageLevel: 14, blueprintPrices: [180000, 270000, 360000, 450000, 540000] },
  // { class: "S", brand: "Bugatti", model: "Veyron 16.4 Grand Sport Vitesse", garageLevel: 59, blueprintPrices: [180000, 270000, 360000, 450000, 540000] },
  // { class: "S", brand: "Koenigsegg", model: "Agera RS", garageLevel: 17, blueprintPrices: [180000, 270000, 360000, 450000, 540000] },

];
