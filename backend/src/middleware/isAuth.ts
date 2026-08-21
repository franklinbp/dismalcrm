import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import AppError from "../errors/AppError";
import authConfig from "../config/auth";
import User from "../models/User";

interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  companyId?: number;
  iat: number;
  exp: number;
}

const isAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = verify(token, authConfig.secret);
    const { id, profile, companyId: tokenCompanyId } = decoded as TokenPayload;
    let companyId = Number(tokenCompanyId);

    // Access tokens generated before company isolation did not carry companyId.
    // Resolve it once from the user so open browser sessions remain compatible.
    if (!companyId) {
      const user = await User.findByPk(id, {
        attributes: ["id", "companyId"]
      });

      if (!user?.companyId) {
        throw new AppError("ERR_SESSION_EXPIRED", 401);
      }

      companyId = user.companyId;
    }

    req.user = {
      id,
      profile,
      companyId
    };
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new AppError(
      "Invalid token. We'll try to assign a new one on next request",
      403
    );
  }

  next();
};

export default isAuth;
