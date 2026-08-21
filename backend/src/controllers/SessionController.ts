import { Request, Response } from "express";
import AppError from "../errors/AppError";

import AuthUserService from "../services/UserServices/AuthUserService";
import { SendRefreshToken } from "../helpers/SendRefreshToken";
import { RefreshTokenService } from "../services/AuthServices/RefreshTokenService";
import ShowUserService from "../services/UserServices/ShowUserService";
import { SerializeUser } from "../helpers/SerializeUser";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  const { token, serializedUser, refreshToken } = await AuthUserService({
    email,
    password
  });

  SendRefreshToken(req, res, refreshToken);

  return res.status(200).json({
    token,
    user: serializedUser
  });
};

export const mobileStore = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email, password } = req.body;

  const { token, serializedUser, refreshToken } = await AuthUserService({
    email,
    password
  });

  return res.status(200).json({
    token,
    refreshToken,
    user: serializedUser
  });
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const token: string = req.cookies.jrt;

  if (!token) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const { user, newToken, refreshToken } = await RefreshTokenService(
    res,
    token
  );

  SendRefreshToken(req, res, refreshToken);

  return res.json({ token: newToken, user });
};

export const mobileUpdate = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { refreshToken: currentRefreshToken } = req.body;

  if (
    typeof currentRefreshToken !== "string" ||
    currentRefreshToken.trim().length === 0
  ) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const { user, newToken, refreshToken } = await RefreshTokenService(
    res,
    currentRefreshToken
  );

  return res.json({
    token: newToken,
    refreshToken,
    user: SerializeUser(user)
  });
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  res.clearCookie("jrt");

  return res.send();
};

export const mobileRemove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const user = await ShowUserService(req.user.id);

  await user.update({ tokenVersion: user.tokenVersion + 1 });

  return res.status(204).send();
};

export const me = async (req: Request, res: Response): Promise<Response> => {
  const user = await ShowUserService(req.user.id);

  return res.status(200).json({ user: SerializeUser(user) });
};
