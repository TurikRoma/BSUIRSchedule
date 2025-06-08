
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from "../utils/token.js";
import User from "../models/User.js";

export const uploadFavoriteAuditorie = async (req, res) => {
    const userId = req.iat
  const { auditorieName } = req.body;
  console.log(userId);

  const existingUser = await User.findOne({_id: userId})
  if (!existingUser)
    return res.status(400).json({ message: "User not exist" });


  const user = await User.update( { _id: userId }, // Находим пользователя по ID
    { $push: { favoriteAuditories: auditorieName } } );
  const accessToken = generateAccessToken(user.id, "USER");
  const refreshToken = generateRefreshToken(user.id, "USER");

  await hashRefreshToken(refreshToken, user.id);

  res.json({ user, accessToken, refreshToken });
};
