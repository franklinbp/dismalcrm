import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as SenderController from "../controllers/SenderController";

const senderRoutes = Router();

senderRoutes.get("/senders", isAuth, SenderController.index);
senderRoutes.post("/senders", isAuth, SenderController.store);
senderRoutes.get("/senders/:senderId", isAuth, SenderController.show);
senderRoutes.put("/senders/:senderId", isAuth, SenderController.update);
senderRoutes.delete("/senders/:senderId", isAuth, SenderController.remove);

export default senderRoutes;
