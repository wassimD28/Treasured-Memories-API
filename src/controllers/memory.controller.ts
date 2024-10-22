// src/controllers/memory.controller.ts
import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import Memory from "../models/memory.model";
import Location from "../models/location.model";
import { LocationPayload, MemoryPayload } from "../interfaces/common.interface";
import { cleanupUploadedFiles } from "../utils/fileHelper.util";

/**
 * @description Returns all user memories by his ID, if his ID is not specified the function will use the ID of the authenticated access token instead.
 * @method GET
 * @route /api/memory
 * @access public
 */
const getMemoriesController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const user_id = req.params.id ?? req.auth?.userId;
    if (!user_id) {
      res.status(200).json({ message: "User not found" });
      return;
    }
    // Fetch user memories from the database using user_id
    const userMemories = await Memory.findAll({ where: { user_id: user_id } });
    // Return user memories in the response
    res.status(200).json(userMemories);
  }
);

/**
 * @description Add a new memory for a user
 * @method POST
 * @route /api/memory
 * @access public
 */
const createMemoryController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const user_id = req.auth?.userId;
    // Parse location data
    let locationPayload: LocationPayload;
    try {
      locationPayload = JSON.parse(req.body.location);
    } catch (error) {
      console.log("Location parsing error:", error);
      res.status(400).json({
        error: "Invalid location data",
        details: "Could not parse location JSON",
      });
      return;
    }

    // Create location
    const location =
      (await Location.findOne({
        where: {
          name: locationPayload.name,
          longitude: locationPayload.longitude,
          latitude: locationPayload.latitude,
        },
      })) ??
      (await Location.create({
        name: locationPayload.name,
        longitude: locationPayload.longitude,
        latitude: locationPayload.latitude,
        user_id: user_id,
      }));

    // Create memory
    const newMemory = await Memory.create({
      user_id: user_id,
      title: req.body.title,
      description: req.body.description,
      location_id: location.id,
    });

    // Return success response
    res.status(201).json({
      id: newMemory.id,
      user_id: user_id,
      title: req.body.title,
      description: req.body.description,
      location: {
        id: location.id,
        name: location.name,
        longitude: location.longitude,
        latitude: location.latitude,
      },
    });
  }
);

/**
 * @description Add a new memory for a user
 * @method POST
 * @route /api/memory
 * @access public
 */

export { getMemoriesController, createMemoryController };
