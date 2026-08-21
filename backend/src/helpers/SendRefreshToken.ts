import { Request, Response } from "express";

const parseForwardedProto = (value?: string): string | null => {
  if (!value) {
    return null;
  }

  const firstValue = value.split(",")[0].trim().toLowerCase();
  return firstValue || null;
};

export const SendRefreshToken = (
  req: Request,
  res: Response,
  token: string
): void => {
  const frontendUrl = process.env.FRONTEND_URL || "";
  const explicitSecure = process.env.COOKIE_SECURE;
  const isHttpsFrontend = frontendUrl.startsWith("https://");
  const forwardedProto = parseForwardedProto(
    req.header("x-forwarded-proto") || undefined
  );
  const isHttpsRequest = req.secure || forwardedProto === "https";
  const useSecureCookie =
    explicitSecure === "true" ||
    (explicitSecure !== "false" && (isHttpsRequest || isHttpsFrontend));
  const sameSitePolicy = useSecureCookie ? "none" : "lax";

  res.cookie("jrt", token, {
    httpOnly: true,
    secure: useSecureCookie,
    sameSite: sameSitePolicy
  });
};
