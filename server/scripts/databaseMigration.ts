import * as fs from "fs";

class Vehicle {
  id: number = 0;
  carClass: string = "";
  order: number = 0;
  brand: string = "";
  model: string = "";
  rarity: string = "";
  stars: number = 0;
  maxRank: number = 0;
  epics: number = 0;
  obtainableVia: string = "";
  garageLevel: number = 0;
  topSpeed: number = 0;
  acceleration: number = 0;
  handling: number = 0;
  nitro: number = 0;
  nitroTS: number = 0;
  unknown: number = 0;
  perfectNitroTS: number = 0;
  added: string = "";
  addedWith: string = "";
  addedDate: Date = new Date();
  totalUpgradeCost: number = 0;
  totalGlPoints: number = 0;
  country: string = "";
  tags: string = "";
  bPs1: number = 0;
  bPs2: number = 0;
  bPs3: number = 0;
  bPs4: number = 0;
  bPs5: number = 0;
  bPs6: number = 0;
  totalBps: number = 0;
  unknown2: number = 0;
  costEpic: number = 0;
}

let output = fs.readFileSync(
  "../Resources/asphalt-legends-unite-database-cars.csv"
);
let rows: any[] = output.toString().split("\n");

let vehicles: Vehicle[] = [];

function customParseInt(value: string): number {
  if (value.length === 0) {
    return 0;
  }

  if (isNaN(parseInt(value))) {
    return 0;
  }

  return parseInt(value);
}

rows.map((row, index) => {
  if (index !== 0) {
    let parsedRow = row.split(",");
    let tmpVehicle = new Vehicle();

    tmpVehicle.id = customParseInt(parsedRow[0]);
    tmpVehicle.carClass = parsedRow[1];
    tmpVehicle.order = customParseInt(parsedRow[2]);
    tmpVehicle.brand = parsedRow[3];
    tmpVehicle.model = parsedRow[4];
    tmpVehicle.rarity = parsedRow[5];
    tmpVehicle.stars = customParseInt(parsedRow[6]);
    tmpVehicle.maxRank = customParseInt(parsedRow[7]);
    tmpVehicle.epics = customParseInt(parsedRow[8]);
    tmpVehicle.obtainableVia = parsedRow[9];
    tmpVehicle.garageLevel = customParseInt(parsedRow[10]);
    tmpVehicle.topSpeed = customParseInt(parsedRow[11]);
    tmpVehicle.acceleration = customParseInt(parsedRow[12]);
    tmpVehicle.handling = customParseInt(parsedRow[13]);
    tmpVehicle.nitro = customParseInt(parsedRow[14]);
    tmpVehicle.nitroTS = customParseInt(parsedRow[15]);
    tmpVehicle.unknown = customParseInt(parsedRow[16]);
    tmpVehicle.perfectNitroTS = customParseInt(parsedRow[17]);
    tmpVehicle.added = parsedRow[18];
    tmpVehicle.addedWith = parsedRow[19];
    tmpVehicle.addedDate = parsedRow[20];
    tmpVehicle.totalUpgradeCost = customParseInt(parsedRow[21]);
    tmpVehicle.totalGlPoints = customParseInt(parsedRow[22]);
    tmpVehicle.country = parsedRow[23];
    tmpVehicle.tags = parsedRow[24];
    tmpVehicle.bPs1 = customParseInt(parsedRow[25]);
    tmpVehicle.bPs2 = customParseInt(parsedRow[26]);
    tmpVehicle.bPs3 = customParseInt(parsedRow[27]);
    tmpVehicle.bPs4 = customParseInt(parsedRow[28]);
    tmpVehicle.bPs5 = customParseInt(parsedRow[29]);
    tmpVehicle.bPs6 = customParseInt(parsedRow[30]);
    tmpVehicle.totalBps = customParseInt(parsedRow[31]);
    tmpVehicle.unknown2 = customParseInt(parsedRow[32]);
    tmpVehicle.costEpic = customParseInt(parsedRow[33]);
    vehicles.push(tmpVehicle);
  }
});

vehicles.map((vehicle) => {
  console.log(vehicle);
});
