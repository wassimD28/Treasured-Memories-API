import { ApiResponse } from "./../interfaces/common.interface";
import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import Like from "../models/like.model";
import Memory from "../models/memory.model";
import Notification from "../models/notification.model";
import { NotificationTapeName } from "../Enums/common.enum";
import User from "../models/user.model";

/**
 * link user like with a specified memory.
 * @method POST
 * @route /api/like/:id
 * @access public
 */
export const putLikeToMemory = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const memory_id = req.params.id;
    const user_id = req.auth?.userId;
    let response: ApiResponse;

    // check if memory id is specified
    if (!memory_id) {
      response = {
        success: false,
        message: "Memory id is required.",
      };
      res.status(400).json(response);
      return;
    }

    // check if the memory exists
    const memoryExists = await Memory.findByPk(memory_id);
    if (!memoryExists) {
      response = {
        success: false,
        message: `Memory with id ${memory_id} not found.`,
      };
      res.status(404).json(response);
      return;
    }

    // Check if the user has already liked this memory
    const likeExists = await Like.findOne({
      where: {
        memory_id,
        user_id,
      },
    });

    if (likeExists) {
      response = {
        success: false,
        message: "You have already liked this memory.",
      };
      res.status(400).json(response);
      return;
    }

    // link like object with the specified memory
    const newLike = await Like.create({
      memory_id,
      user_id,
    });

    // increment the like counter in the specified memory
    await memoryExists.increment("likeCounter");
    // create a notification for the user who liked the memory.
    await Notification.create({
      user_id: memoryExists.user_id,
      interactor_id: user_id,
      type: NotificationTapeName.LIKE,
      source_id: newLike.id,
      isRead: false,
      createdAt: newLike.createdAt,
    });
    // increment the notification counter in the user of the specified memory.
    const user = await User.findByPk(memoryExists.user_id);
    if (user) {
      user.increment("notificationCounter");
    }
    // return the updated memory
    response = {
      success: true,
      message: "Like added successfully",
    };
    res.status(201).json(response);
  }
);

/**
 * remove user like from a specified memory.
 * @method DELETE
 * @route /api/like/:id
 * @access public
 */
export const removeLikeFromMemory = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const memory_id = req.params.id;
    const user_id = req.auth?.userId;
    let response: ApiResponse;

    // Check if memory id is specified
    if (!memory_id) {
      response = {
        success: false,
        message: "Memory id is required.",
      };
      res.status(400).json(response);
      return;
    }

    // Check if the memory exists
    const memoryExists = await Memory.findByPk(memory_id);
    if (!memoryExists) {
      response = {
        success: false,
        message: `Memory with id ${memory_id} not found.`,
      };
      res.status(404).json(response);
      return;
    }

    // Check if the user has liked this memory
    const like = await Like.findOne({
      where: {
        memory_id,
        user_id,
      },
    });

    if (!like) {
      response = {
        success: false,
        message: "You have not liked this memory.",
      };
      res.status(400).json(response);
      return;
    }

    // Remove the like
    await like.destroy();

    // check if there is unread notification of the like
    const unreadNotification = await Notification.findOne({
      where: {
        user_id: memoryExists.user_id,
        interactor_id: user_id,
        type: NotificationTapeName.LIKE,
        isRead: false,
        createdAt: like.createdAt,
      },
    });
    // delete the unread notification if exists
    if (unreadNotification) {
      await unreadNotification.destroy();
      //find the memory's user and decrement the notification counter
      const user = await User.findByPk(memoryExists.user_id);
      if (user && user.notificationCounter > 0) {
        user.decrement("notificationCounter");
      }
    }

    // Decrement the like counter in the specified memory
    await memoryExists.decrement("likeCounter");

    response = {
      success: true,
      message: "Like removed successfully",
    };
    res.status(200).json(response);
  }
);
