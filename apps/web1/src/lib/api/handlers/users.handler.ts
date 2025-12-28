import { Context } from "hono";
import { usersService } from "../services/users.service";

export const usersHandler = {
  async getProfile(c: Context) {
    // TODO: 実装
    return c.json({ message: "Get profile handler" });
  },

  async registerSmartAccount(c: Context) {
    // TODO: 実装
    return c.json({ message: "Register smart account handler" });
  },
};

