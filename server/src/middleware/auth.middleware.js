import jwt from "jsonwebtoken";
import { config } from '../config/index.js';

const JWT_SECRET = config.jwt_secret

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    console.log(payload.iat);
    req.user = payload;
    next();
  } catch (err) {
    console.log(err);
    res.status(403).json({ message: "Token invalid or expired" });
  }
};