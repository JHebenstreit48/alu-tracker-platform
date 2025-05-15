import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "@/models/user";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

interface RegisterBody {
  username: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

const handleRegister = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response
): Promise<void> => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    const normalizedUsername = username.toLowerCase().trim();
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existingUser) {
      res.status(409).json({ message: "Username or email already in use" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("[ERROR] Registration failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleLogin = async (
  req: Request<{}, {}, LoginBody>,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Missing credentials" });
    return;
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      token,
      username: user.username,
      userId: user._id,
    });
  } catch (error) {
    console.error("[ERROR] Login failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

router.post("/register", handleRegister);
router.post("/login", handleLogin);

export default router;
