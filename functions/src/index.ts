import { setGlobalOptions } from "firebase-functions/v2/options";
import { onRequest } from "firebase-functions/v2/https";
import app from "./app";

// Limit concurrent containers if you want (optional but nice)
setGlobalOptions({ maxInstances: 10 });

export const aluTrackerApi = onRequest(app);