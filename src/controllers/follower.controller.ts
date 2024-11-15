import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { ApiResponse } from "../interfaces/common.interface";
import User from "../models/user.model";
import Follower from "../models/follower.model";
import Notification from "../models/notification.model";
import { NotificationTapeName } from "../Enums/common.enum";

/**
 * Adds a new follower to the user via user_id and followed_id.
 * @method POST
 * @route /api/follow/:id/:followed_id
 * @access private
 */

export const addFollow = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const user_id = req.auth?.userId;
    const followed_id = req.params.followed_id;
    let response: ApiResponse;
    // check if the followed id is valid
    if (!followed_id) {
      response = {
        success: false,
        message: "Followed user ID is required",
      };
      res.status(400).json(response);
      return;
    }
    // check if the followed user exists
    const followedUserExists = await User.findByPk(followed_id);
    if (!followedUserExists) {
      response = {
        success: false,
        message: "Followed user not found",
      };
      res.status(404).json(response);
      return;
    }
    // check if the user is already following the followed user
    const isFollowing = await Follower.findOne({
      where: { followerId: user_id, followingId: followed_id },
    });
    if (isFollowing) {
      response = {
        success: false,
        message: "User is already following the followed user",
      };
      res.status(400).json(response);
      return;
    }
    // follow the user
    await Follower.create({
      followerId: user_id,
      followingId: followed_id,
    });
    // update followers counter in followed user
    await User.increment("followersCounter", { where: { id: followed_id } });
    // update following counter in follower
    await User.increment("followingsCounter", { where: { id: user_id } });
    // create a new notification for the followed user
    await Notification.create({
      user_id: followed_id,
      interactor_id: user_id,
      type: NotificationTapeName.NEW_FOLLOWER,
      isRead: false,
      createdAt: new Date(),
    });
    // increment the notification counter in the user of the followed user
    await User.increment("notificationCounter", { where: { id: followed_id } });

    response = {
      success: true,
      message: "User Followed successfully",
    };
    res.status(201).json(response);
  }
);

/**
 * remove an existing follower from the user via user_id and followed_id.
 * @method POST
 * @route /api/follow/:id/:followed_id
 * @access private
 */

export const removeFollow = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const user_id = req.auth?.userId;
    const followed_id = req.params.followed_id;
    let response: ApiResponse;
    // check if the followed id is valid
    if (!followed_id) {
      response = {
        success: false,
        message: "Followed user ID is required",
      };
      res.status(400).json(response);
      return;
    }
    // check if the followed user exists
    const followedUserExists = await User.findByPk(followed_id);
    if (!followedUserExists) {
      response = {
        success: false,
        message: "Followed user not found",
      };
      res.status(404).json(response);
      return;
    }
    // check if the user is already following the followed user
    const isFollowing = await Follower.findOne({
      where: { followerId: user_id, followingId: followed_id },
    });
    if (!isFollowing) {
      response = {
        success: false,
        message: "User is not following the followed user",
      };
      res.status(400).json(response);
      return;
    }
    // unfollow the user
    await Follower.destroy({
      where: { followerId: user_id, followingId: followed_id },
    });
    // update followers counter in followed user
    await User.decrement("followersCounter", { where: { id: followed_id } });
    // update following counter in follower
    await User.decrement("followingsCounter", { where: { id: user_id } });
    // remove the notification for the followed user
    await Notification.destroy({
      where: {
        user_id: followed_id,
        interactor_id: user_id,
        type: NotificationTapeName.NEW_FOLLOWER,
      },
    });
    // decrement the notification counter in the user of the followed user
    await User.decrement("notificationCounter", { where: { id: followed_id } });
    response = {
      success: true,
      message: "User Unfollowed successfully",
    };
    res.status(200).json(response);
  }
);
