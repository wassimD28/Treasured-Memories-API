import { Request, response, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import Notification from "../models/notification.model";
import { ApiResponse } from "../interfaces/common.interface";
import User from "../models/user.model";
import sequelize from "../config/database";

/**
 * Returns all notifications to the user in descending order by creation date.
 * @method GET
 * @route /api/notification/:id
 * @access private
 */
export const getNotificationController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const user_id = req.auth?.userId;
    // get all notifications
    const notifications = await Notification.findAll({
      where: { user_id },
      order: [["createdAt", "DESC"]], // Order by 'createdAt' column in descending order
    });
    const response: ApiResponse = {
      success: true,
      message: "Notifications retrieved successfully",
      data: notifications,
    };
    res.status(200).json(response);
  }
);

/**
 * Returns all notifications of a user via user id in descending order by creation date.
 * @method GET
 * @route /api/notification/unread/:id
 * @access private
 */

export const getUnreadNotificationController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const user_id = req.auth?.userId;
    // get all unread notifications
    const notifications = await Notification.findAll({
      where: { user_id, isRead: false },
      order: [["createdAt", "DESC"]], // Order by 'createdAt' column in descending order
    });
    const response: ApiResponse = {
      success: true,
      message: "Unread notifications retrieved successfully",
      data: notifications,
    };
    res.status(200).json(response);
  }
);

/**
 * read single notification of a user.
 * @method GET
 * @route /api/notification/:id
 * @access private
 */

export const readNotificationController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const user_id = req.auth?.userId;
    const notification_id = req.params.id;

    // check if the notification exists
    const notificationExists = await Notification.findByPk(notification_id);
    if (!notificationExists) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }

    // mark notification as read
    notificationExists.isRead = true;
    // decrement the user's notification counter in the database
    const user = await User.findByPk(user_id);
    if (user && user.notificationCounter > 0) {
      user.decrement("notificationCounter");
    }
    // save the updated notification
    await notificationExists.save();
    const response: ApiResponse = {
      success: true,
      message: "Notification read successfully",
      data: notificationExists,
    };
    res.status(200).json(response);
  }
);

/**
 * read all notification of a user.
 * @method GET
 * @route /api/notification/:id
 * @access private
 */

export const readAllNotificationController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const user_id = req.auth?.userId;

    // Begin transaction for consistency
    const transaction = await sequelize.transaction();
    try {
      // Get all unread notifications and update them in bulk
      const notifications = await Notification.findAll({
        where: { user_id, isRead: false },
        order: [["createdAt", "DESC"]],
        transaction,
      });

      // Mark all notifications as read in one bulk update
      await Notification.update(
        { isRead: true },
        { where: { user_id, isRead: false }, transaction }
      );

      // Decrement or reset the user's notification counter
      const user = await User.findByPk(user_id, { transaction });
      if (user && user.notificationCounter > 0) {
        const unreadCount = notifications.length;
        user.notificationCounter = Math.max(
          0,
          user.notificationCounter - unreadCount
        );
        await user.save({ transaction });
      }

      await transaction.commit();

      // Respond with a success message
      const response: ApiResponse = {
        success: true,
        message: "All notifications read successfully",
      };
      res.status(200).json(response);
    } catch (error) {
      // Rollback transaction in case of error
      await transaction.rollback();
      const response: ApiResponse = {
        success: false,
        message: "An error occurred while trying to mark all notifications as read.",
      };
      res.status(500).json(response);
    }
  }
);
