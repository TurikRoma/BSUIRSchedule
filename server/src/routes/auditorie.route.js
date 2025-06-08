import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { uploadFavoriteAuditorie } from "../controllers/auditorie.controller.js";

// import { authMiddleware } from "../middleware/auth.middleware.js";
const AuditorieRouter = express.Router();

AuditorieRouter.post("/add/favoriteAuditorie", authMiddleware, uploadFavoriteAuditorie);


export default AuditorieRouter;