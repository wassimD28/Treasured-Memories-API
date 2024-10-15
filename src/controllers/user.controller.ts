import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import User from "../models/user.model";

const getUserByIdController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const user_id = req.params.id;
    const user = await User.findByPk(user_id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  }
);

const deleteUserController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const user_id = req.params.id;
    const user = await User.findByPk(user_id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    await user.destroy();
    res.json({ message: "User deleted successfully" });
  }
);

export { getUserByIdController, deleteUserController };
