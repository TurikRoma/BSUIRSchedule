import bcrypt from "bcrypt";

import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from "../utils/token.js";
import User from "../models/User.js";

export const register = async (req, res) => {
  const { fullName, email, password } = req.body;

  const existingUser = await User.findOne({email: email})
  if (existingUser)
    return res.status(400).json({ message: "User already exists" });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: fullName,
    email: email,
    password: passwordHash,
    favoriteAuditories: []
  });
  const accessToken = generateAccessToken(user.id, "USER");
  const refreshToken = generateRefreshToken(user.id, "USER");

  await hashRefreshToken(refreshToken, user.id);

  res.json({ user, accessToken, refreshToken });
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({email: email});
  if (!user) return res.status(404).json({ message: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await hashRefreshToken(refreshToken, user.id);

  res.json({ user, accessToken, refreshToken });
};