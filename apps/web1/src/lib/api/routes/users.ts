import { Hono } from "hono";
import { usersHandler } from "../handlers/users.handler";
import { authGuard } from "../middlewares/auth-guard";

const users = new Hono()
  .use("*", authGuard)
  .get("/profile", usersHandler.getProfile)
  .post("/smart-account", usersHandler.registerSmartAccount);

export default users;

