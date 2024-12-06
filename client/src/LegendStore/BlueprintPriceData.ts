export interface Car {
    class: string; // D, C, B, A, S
    brand: string; // Car brand
    model: string; // Car model
    blueprintPrices: number[]; // Prices for blueprints 1-5
  }
  
  export const cars: Car[] = [
    { class: "D", brand: "Mitsubishi", model: "Lancer Evolution", blueprintPrices: [10000, 15000, 20000, 25000, 30000] },
    { class: "D", brand: "BMW", model: "Z4 LCI E89", blueprintPrices: [10000, 15000, 20000, 25000, 30000] },
    { class: "D", brand: "Chevrolet", model: "Camaro LT", blueprintPrices: [10000, 15000, 20000, 25000, 30000] },
    { class: "D", brand: "Lotus", model: "Elise Sprint 220", blueprintPrices: [33000, 50000, 67000, 84000, 101000] },
    { class: "C", brand: "Dodge", model: "Challenger SRT8", blueprintPrices: [13000, 19500, 26000, 32500, 39000] },
    { class: "C", brand: "Chevrolet", model: "Camaro ZL1 50th Ed.", blueprintPrices: [13000, 19500, 26000, 32500, 39000] },
    { class: "C", brand: "BMW", model: "3.0 CSL Hommage", blueprintPrices: [13000, 19500, 26000, 32500, 39000] },
    { class: "B", brand: "Porsche", model: "911 GTS Coupe", blueprintPrices: [18000, 27000, 36000, 45000, 54000] },
    { class: "B", brand: "Ford", model: "GT", blueprintPrices: [60000, 90000, 120000, 150000, 180000] },
    { class: "A", brand: "Ferrari", model: "LaFerrari", blueprintPrices: [144000, 216000, 288000, 360000, 432000] },
    { class: "A", brand: "Aston Martin", model: "Vulcan", blueprintPrices: [57000, 86000, 115000, 144000, 173000] },
    { class: "A", brand: "Pagani", model: "Huayra BC", blueprintPrices: [228000, 338000, 448000, 558000, 668000] },
    { class: "S", brand: "Koenigsegg", model: "Regera", blueprintPrices: [300000, 450000, 600000, 750000, 900000] },
    { class: "S", brand: "Bugatti", model: "Chiron", blueprintPrices: [300000, 450000, 600000, 750000, 900000] },

  ];
  