import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { ApiResponse } from "../interfaces/common.interface";
import Memory from "../models/memory.model";
import Comment from "../models/comment.model";
import Notification from "../models/notification.model";
import { NotificationTapeName } from "../Enums/common.enum";
import User from "../models/user.model";
import Profile from "../models/profile.model";
import { emitNotification } from "../utils/socket.util";

/**
 * get all comments of specific memory via memory id.
 * @method GET
 * @route /api/comment/:id
 * @access public
 */
export const getCommentsOfMemoryController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const memory_id = req.params.id;
    let response: ApiResponse;

    // check if memory id is specified
    if (!memory_id) {
      response = {
        success: false,
        message: "Memory ID is required",
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

    // get all comments of the specified memory
    const comments = await Comment.findAll({ where: { memory_id } });
    response = {
      success: true,
      message: "Comments retrieved successfully",
      data: comments,
    };
    res.json(response);
  }
);


/**
 * add comment to specific memory.
 * @method POST
 * @route /api/comment/:id
 * @access public
 */
export const addCommentController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const memory_id = req.params.id;
    const user_id = req.auth?.userId;
    const { content } = req.body;
    let response: ApiResponse;

    // check if memory id is specified
    if (!memory_id) {
      response = {
        success: false,
        message: "Memory ID is required",
      };
      res.status(400).json(response);
      return;
    }
    // check if the content is not empty
    if (!content) {
      response = {
        success: false,
        message: "Content is required",
      };
      res.status(400).json(response);
      return;
    }
    // check if the specified memory exists
    const memoryExists = await Memory.findByPk(memory_id);
    if (!memoryExists) {
      response = {
        success: false,
        message: "Memory not found",
      };
      res.status(404).json(response);
      return;
    }

    // create a new comment
    const newComment = await Comment.create({
      content,
      user_id,
      memory_id,
    });

    // increase the comment counter in the specified memory
    await memoryExists.increment("commentCounter");
    // create a notification for the user who liked the memory.
    const notification = await Notification.create({
      user_id: memoryExists.user_id,
      interactor_id: user_id,
      type: NotificationTapeName.COMMENT,
      source_id: newComment.id,
      isRead: false,
      createdAt: newComment.createdAt,
    });
    // increment the notification counter in the user of the specified memory.
    const user = await User.findByPk(memoryExists.user_id);
    if (user) {
      user.increment("notificationCounter");

      // Emit real-time notification
      const notificationData = {
        ...notification.toJSON(),
        interactor: await User.findByPk(user_id, {
          attributes: ["id", "username"],
          include: {
            model: Profile,
            attributes: ["avatarImage", "firstName", "LastName"],
          },
        }),
      };

      emitNotification(memoryExists.user_id, notificationData);
    }

    // return success response
    response = {
      success: true,
      message: "Comment added successfully",
      data: newComment,
    };
    res.status(201).json(response);
  }
);

/**
 * delete a specific comment via comment id.
 * @method DELETE
 * @route /api/comment/:id
 * @access protected
 */

export const deleteCommentController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const comment_id = req.params.id;
    const user_id = req.auth?.userId;
    let response: ApiResponse;

    // check if comment id is specified
    if (!comment_id) {
      response = {
        success: false,
        message: "Comment ID is required",
      };
      res.status(400).json(response);
      return;
    }

    // check if the specified comment exists
    const commentExists = await Comment.findByPk(comment_id);
    if (!commentExists) {
      response = {
        success: false,
        message: "Comment not found",
      };
      res.status(404).json(response);
      return;
    }
    // find the comment's memory and check if it exists
    const memory = await Memory.findByPk(commentExists.memory_id);
    if (!memory) {
      response = {
        success: false,
        message: "Memory not found",
      };
      res.status(404).json(response);
      return;
    }

    // decrease the comment counter in the specified memory
    await memory.decrement("commentCounter");

    // check if there is unread notification of the like
    const unreadNotification = await Notification.findOne({
      where: {
        user_id: memory.user_id,
        interactor_id: user_id,
        type: NotificationTapeName.COMMENT,
        isRead: false,
        createdAt: commentExists.createdAt,
      },
    });
    // delete the unread notification if exists
    if (unreadNotification) {
      await unreadNotification.destroy();
      //find the memory's user and decrement the notification counter
      const user = await User.findByPk(memory.user_id);
      if (user && user.notificationCounter > 0) {
        user.decrement("notificationCounter");
      }
    }

    // delete the comment
    await commentExists.destroy();
    // return success response
    response = {
      success: true,
      message: "Comment deleted successfully",
    };
    res.status(200).json(response);
  }
);

/**
 * update a specific comment.
 * @method PUT
 * @route /api/comment/:id
 * @access protected
 */

export const updateCommentController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const comment_id = req.params.id;
    const { content } = req.body;
    let response: ApiResponse;

    // check if comment id is specified
    if (!comment_id) {
      response = {
        success: false,
        message: "Comment ID is required",
      };
      res.status(400).json(response);
      return;
    }
    // check if the content is not empty
    if (!content) {
      response = {
        success: false,
        message: "Content is required",
      };
      res.status(400).json(response);
      return;
    }
    

    // check if the specified comment exists
    const commentExists = await Comment.findByPk(comment_id);
    if (!commentExists) {
      response = {
        success: false,
        message: "Comment not found",
      };
      res.status(404).json(response);
      return;
    }

    // update the comment
    await commentExists.update({ content });

    // return success response
    response = {
      success: true,
      message: "Comment updated successfully",
    };
    res.status(200).json(response);
  });
