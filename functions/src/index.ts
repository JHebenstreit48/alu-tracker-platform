import { setGlobalOptions } from "firebase-functions/v2/options";
import { onRequest } from "firebase-functions/v2/https";
import app from "./app";

setGlobalOptions({ maxInstances: 10 });

export const aluTrackerCommentsFeedbackApi = onRequest(
  {
    secrets: ["PROTON_SMTP_USER", "PROTON_SMTP_PASS", "NOTIFY_EMAIL"],
  },
  app
);