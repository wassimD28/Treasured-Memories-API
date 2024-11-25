import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import User from "../models/user.model";
import { ApiResponse } from "../interfaces/common.interface";
import Profile from "../models/profile.model";
import { Op, Sequelize } from "sequelize";

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

/**
 * find users by username
 * @method GET
 * @route /api/user/:username
 * @access protected
 */

export const findUsersController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const input: string = req.params.input; // Extract input from request parameters
    let response: ApiResponse;
    let users: User[];
    let isUsername: boolean = false;

    // Check if the input includes '@'
    if (!input.includes("@")) {
      // Without '@', search by first name or last name (case-insensitive)
      users = await User.findAll({
        include: {
          model: Profile,
          where: {
            [Op.or]: [
              Sequelize.where(
                Sequelize.fn("LOWER", Sequelize.col("Profile.firstName")),
                "LIKE",
                `%${input.toLowerCase()}%`
              ), // Case-insensitive search for first name
              Sequelize.where(
                Sequelize.fn("LOWER", Sequelize.col("Profile.lastName")),
                "LIKE",
                `%${input.toLowerCase()}%`
              ), // Case-insensitive search for last name
            ],
          },
          attributes: ["firstName", "lastName", "avatarImage"], // Include these Profile fields
        },
        attributes: ["username"], // Only include the username field from User
        limit: 5, // Limit the number of users to 5
      });
    } else {
      // With '@', remove '@' from input and search for matching or partial usernames
      const cleanedInput = input.replace("@", ""); // Remove '@' from the input

      users = await User.findAll({
        where: {
          [Op.or]: [
            Sequelize.where(
              Sequelize.fn("LOWER", Sequelize.col("username")),
              "LIKE",
              `%${cleanedInput.toLowerCase()}%`
            ), // Case-insensitive search for username
          ],
        },
        attributes: ["username"], // Only include the username field from User
        limit: 5, // Limit the number of users to 5
        include: {
          model: Profile,
          attributes: ["firstName", "lastName", "avatarImage"], // Include Profile fields
        },
      });
      isUsername = true; // Set flag to indicate that we are searching by username
    }

    // Return response
    if (!users.length) {
      // If no users are found, return a failure response
      response = {
        success: false,
        message: `No users found with ${isUsername ? 'username' : 'name'} = ${input}`,
      };
      res.status(404).json(response); // Respond with 404 status and the message
      return;
    }

    // If users are found, return them in the response
    response = {
      success: true,
      message: "Users found successfully",
      data: users, // Include the list of found users
    };
    res.json(response);
  }
);

/**
 * get all users in specific limit
 * @method GET
 * @route /api/user/:limit
 * @access protected
 */

export const getAllUsersController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const limit = parseInt(req.params.limit);
    let response: ApiResponse;
    // check if limit is valid
    if (!Number.isInteger(limit) || limit <= 0) {
      response = {
        success: false,
        message: "Limit must be a positive integer",
      };
      res.status(400).json(response);
      return;
    }
    // return all users
    const users = await User.findAll({
      include: {
        model: Profile,
        attributes: ["firstName", "lastName", "avatarImage"], // Include Profile fields
      },
      attributes:{
        exclude: ["password"], // Exclude password field from response
      },
      limit, // Set the limit
    });
    response = {
      success: true,
      message: "Users found successfully",
      data: users, // Include the list of found users
    };
    res.status(200).json(response);
  });


/**
 * promote specific user to moderator
 * @method POST
 * @route /api/user/promote/:id
 * @access protected
 */

export const promoteToModeratorController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const user_id = req.params.id;
    let response: ApiResponse;
    // check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      response = {
        success: false,
        message: "User not found",
      };
      res.status(404).json(response);
      return;
    }
    // todo: fix getting null array
    // check if roles array not null
    
    // convert user roles to array
    const rolesArray = JSON.parse(user.roles?.toString()) ?? [];
    // check if user is already a moderator
    if (rolesArray.includes("MODERATOR")) {
      response = {
        success: false,
        message: "User is already a moderator",
      };
      res.status(400).json(response);
      return;
    }
    
    // promote user to moderator
    user.roles = ["MODERATOR"];
    await user.save();
    response = {
      success: true,
      message: "User promoted to moderator successfully",
    };
    res.status(200).json(response);
  }
);
/**
 * demote specific moderato to user
 * @method POST
 * @route /api/user/demote/:id
 * @access protected
 */

export const demoteToUserController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const user_id = req.params.id;
    let response: ApiResponse;
    // check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      response = {
        success: false,
        message: "User not found",
      };
      res.status(404).json(response);
      return;
    }
    // todo: fix getting null array
    // check if user is already a user
    if (!user.roles.includes("MODERATOR")) {
      response = {
        success: false,
        message: "User is not a moderator",
      };
      res.status(400).json(response);
      return;
    }

    // demote user to user
    user.roles = ["USER"];
    await user.save();
    response = {
      success: true,
      message: "User demoted to user successfully",
    };
    res.status(200).json(response);
  });
export { getUserByIdController, deleteUserController };
