export interface Car {
    class: string; // D, C, B, A, S
    brand: string; // Car brand
    model: string; // Car model
    blueprintPrices: number[]; // Prices for blueprints 1-5
  }
  
  export const cars: Car[] = [
    { class: "D", brand: "Mitsubishi", model: "Lancer Evolution", blueprintPrices: [10000, 15000, 20000, 25000, 30000] },
    { class: "D", brand: "BMW", model: "Z4 LCI E89", blueprintPrices: [10000, 15000, 20000, 25000, 30000] },
    { class: "C", brand: "Chevrolet", model: "Camaro LT", blueprintPrices: [10000, 15000, 20000, 25000, 30000] },
    { class: "B", brand: "Porsche", model: "911 GT3 Coupe", blueprintPrices: [27000, 36000, 45000, 54000, 63000] },
    { class: "A", brand: "Lotus", model: "Elise", blueprintPrices: [33000, 50000, 67000, 84000, 101000] },
    { class: "S", brand: "Ferrari", model: "LaFerrari", blueprintPrices: [144000, 216000, 288000, 360000, 432000] },
  ];
  