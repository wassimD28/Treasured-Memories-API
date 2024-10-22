import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import User from "../models/user.model";

/**
 * @description returns user info by id except for his password 
 * @method GET
 * @route /api/user/:id
 * @access public
 */
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

/**
 * @description delete a user
 * @method DELETE
 * @route /api/user/:id
 * @access protected
 */
const deleteUserController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const user_id = req.params.id;
    const user = await User.findByPk(user_id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  }
);

export { getUserByIdController, deleteUserController };
