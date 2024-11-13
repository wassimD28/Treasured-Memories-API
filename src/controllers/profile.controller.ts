import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import User from "../models/user.model";
import Profile from "../models/profile.model";
import { ProfilePayload } from "../interfaces/common.interface";

/**
 * Get user profile by its user id (not profile id).
 * @method GET
 * @route /api/profile/:id
 * @access public
 */
export const getUserProfile = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const user_id = req.params.id;

    // Get user with profile in a single query
    const userWithProfile = await User.findByPk(user_id, {
      attributes: {
        exclude: ["password", "email", "roles", "createdAt", "updatedAt"],
      },
      include: [
        {
          model: Profile,
          attributes: [
            "firstName",
            "lastName",
            "bio",
            "avatarImage",
            "wallImage",
            "address",
            "gender",
            "birthday",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
    });

    // Check if user exists
    if (!userWithProfile) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Return the profile
    res.status(200).json({
      success: true,
      user: userWithProfile,
    });
  }
);

export const updateUserProfile = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.params.id;
    const profilePayload = req.body as ProfilePayload;
    if (!profilePayload) {
      res.status(400).json({
        success: false,
        message: "Invalid profile payload",
      });
      return;
    }
    try {
      // Find user first
      const user = await User.findByPk(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // Find or create profile
      let profile = await Profile.findOne({
        where: { user_id: userId },
      });

      if (!profile) {
        // Create new profile
        profile = await Profile.create({
          user_id: userId,
          ...profilePayload,
        });

        res.status(201).json({
          success: true,
          message: "Profile created successfully",
          data: profile,
        });
        return;
      }

      // Update existing profile
      await profile.update(profilePayload);

      // Fetch updated profile with all attributes
      const updatedProfile = await Profile.findOne({
        where: { user_id: userId },
        attributes: [
          "id",
          "firstName",
          "lastName",
          "bio",
          "avatarImage",
          "wallImage",
          "address",
          "gender",
          "birthday",
          "createdAt",
          "updatedAt",
        ],
      });

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedProfile,
      });
      return;
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating profile",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return;
    }
  }
);
