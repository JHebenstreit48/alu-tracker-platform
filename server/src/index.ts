import { connectToDb } from "./Utility/connection";

const main = async () => {
  await connectToDb();
  // Your application logic here
};

main().catch(err => console.error(err));


