import express from "express";
import { refreshAccessToken } from "../utils/token.js";
import { login, register } from "../controllers/auth.controller.js";
// import { authMiddleware } from "../middleware/auth.middleware.js";
const AuthRouter = express.Router();

AuthRouter.post("/register", register);
AuthRouter.post("/login", login);
AuthRouter.post("/refreshToken", refreshAccessToken);

export default AuthRouter;