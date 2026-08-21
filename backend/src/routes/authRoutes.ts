import { Router } from "express";
import * as SessionController from "../controllers/SessionController";
import * as UserController from "../controllers/UserController";
import isAuth from "../middleware/isAuth";

const authRoutes = Router();

authRoutes.post("/signup", UserController.store);

authRoutes.post("/login", SessionController.store);
authRoutes.post("/mobile/login", SessionController.mobileStore);

authRoutes.post("/refresh_token", SessionController.update);
authRoutes.post("/mobile/refresh", SessionController.mobileUpdate);

authRoutes.delete("/logout", isAuth, SessionController.remove);
authRoutes.delete("/mobile/logout", isAuth, SessionController.mobileRemove);
authRoutes.get("/me", isAuth, SessionController.me);

export default authRoutes;
