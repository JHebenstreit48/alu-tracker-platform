import { Router, type Request, type Response } from "express";
import { claimCommentsByEmail } from "@/comments/firestore";

const router = Router();
const SERVICE_KEY = process.env.COMMENTS_SERVICE_KEY;

router.post("/comments/claim-by-email", async (req: Request, res: Response) => {
  try {
    if (!SERVICE_KEY || req.header("x-service-key") !== SERVICE_KEY) {
      res
        .status(401)
        .json({
          ok: false,
          error: { code: "UNAUTHORIZED", message: "Invalid service key" },
        });
      return;
    }

    const { userId, email } = req.body as {
      userId?: string;
      email?: string;
    };

    if (!userId || !email) {
      res
        .status(400)
        .json({
          ok: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing userId or email",
          },
        });
      return;
    }

    const { matched, modified } = await claimCommentsByEmail(email, userId);
    res.json({ ok: true, data: { matched, modified } });
  } catch (err) {
    console.error(
      "POST /api/internal/comments/claim-by-email error:",
      err
    );
    res
      .status(500)
      .json({
        ok: false,
        error: { code: "SERVER_ERROR", message: "Unexpected error" },
      });
  }
});

export default router;