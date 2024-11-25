import { response } from "express";
// src/controllers/memory.controller.ts
import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import Memory from "../models/memory.model";
import Location from "../models/location.model";
import { ApiResponse, LocationPayload } from "../interfaces/common.interface";
import { Model } from "sequelize";
import User from "../models/user.model";
import Album from "../models/album.model";
import AlbumMemory from "../models/albumMemory.model";

/**
 * @description Returns all user memories by his ID.
 * @method GET
 * @route /api/memory
 * @access public
 */
const getMemoriesController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const user_id = req.params.id;
    if (!user_id) {
      res.status(200).json({ message: "Messing user_id parameter" });
      return;
    }
    // check if user exists
    const userExists = await User.findByPk(user_id);
    if (!userExists) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Fetch user memories from the database using user_id
    const userMemories = await Memory.findAll({
      where: { user_id: user_id },
      // don't return user_id within the response
      attributes: { exclude: ["user_id"] },
      // include location details within the response
      include: [
        {
          model: Location,
          attributes: ["name", "longitude", "latitude"],
        },
      ],
    });
    // Return user memories in the response
    res.status(200).json(userMemories);
  }
);
/**
 * @description Returns one user memory by his memory ID.
 * @method GET
 * @route /api/memory/:id
 * @access public
 */
const getMemoryByIdController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const memory_id = req.params.id;
    // check if memory id is specified
    if (!memory_id) {
      res.status(400).json({ message: "Missing memory_id parameter." });
      return;
    }
    // Check if entity exists
    const memoryExists = await Memory.findByPk(memory_id);
    if (!memoryExists) {
      res
        .status(404)
        .json({ message: `There is no such memory with id = ${memory_id}` });
      return;
    }

    // Fetch user memory from the database using user_id and memory_id
    const userMemory = await Memory.findOne({
      where: { id: memory_id },
      // don't return user_id within the response
      attributes: { exclude: ["user_id"] },
      // include location details within the response
      include: [
        {
          model: Location,
          attributes: ["name", "longitude", "latitude"],
        },
      ],
    });
    if (!userMemory) {
      res.status(404).json({ message: "Memory not found" });
      return;
    }
    // Return user memory in the response
    res.status(200).json(userMemory);
  }
);
/**
 * @description Update user memory by his memory ID.
 * @method GET
 * @route /api/memory/:id
 * @access public
 */
export const updateMemoryController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const memory_id = req.params.id;
    const { title, description } = req.body;
    // check body
    if (!title || !description) {
      res.status(400).json({ message: "Title and description are required." });
      return;
    }

    // check if memory id is specified
    if (!memory_id) {
      res.status(400).json({ message: "Missing memory_id parameter." });
      return;
    }
    // Check if entity exists
    const memoryExists = await Memory.findByPk(memory_id);
    if (!memoryExists) {
      res
        .status(404)
        .json({ message: `There is no such memory with id = ${memory_id}` });
      return;
    }

    // update user memory
    const userMemory = await Memory.update(
      { title, description },
      { where: { id: memory_id } }
    );
    if (!userMemory) {
      res.status(500).json({ message: "Failed to update memory" });
      return;
    }

    // Return user memory in the response
    res.status(200).json({ message: "Memory has been updated successfully" });
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
 * @description Delete memory by its id.
 * @method POST
 * @route /api/memory
 * @access public
 */
export const deleteMemoryController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const memory_id = req.params.id;
    // check if memory id is specified
    if (!memory_id) {
      res.status(400).json({ message: "Missing memory_id parameter." });
      return;
    }
    // Check if entity exists
    const memoryExists = await Memory.findByPk(memory_id);
    if (!memoryExists) {
      res
        .status(404)
        .json({ message: `There is no such memory with id = ${memory_id}` });
      return;
    }

    // Delete memory
    await memoryExists.destroy();
    res.status(200).json({ message: "Memory deleted successfully" });
  }
);

/**
 * link one specific memory with an album via memory_id and album_id
 * @method POST
 * @route /api/memory/:id/album/:album_id
 * @access private
 */
export const linkMemoryWithAlbumController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const memory_id = req.params.id;
    const album_id = req.params.album_id;
    let response: ApiResponse;
    // check if memory id and album id are specified
    if (!album_id) {
      response = {
        success: false,
        message: "Album id is required.",
      };
      res.status(400).json(response);
      return;
    }
    // Check if entity exists
    const memoryExists = await Memory.findByPk(memory_id);
    if (!memoryExists) {
      response = {
        success: false,
        message: "Memory not found.",
      };
      res.status(404).json(response);
      return;
    }
    // check if the album exists
    const albumExists = await Album.findByPk(album_id);
    if (!albumExists) {
      response = {
        success: false,
        message: "Album not found.",
      };
      res.status(404).json(response);
      return;
    }
    // check if the album belongs to the user
    if (albumExists.user_id !== memoryExists.user_id) {
      response = {
        success: false,
        message: "You do not have permission to access this album.",
      };
      res.status(403).json(response);
      return;
    }
    // check if the memory already linked with the album
    const memoryInAlbum = await AlbumMemory.findOne({
      where: { memory_id, album_id },
    });
    if (memoryInAlbum) {
      response = {
        success: false,
        message: "Memory is already linked with this album.",
      };
      res.status(400).json(response);
      return;
    }

    
    // link memory with album
    await AlbumMemory.create({
      memory_id,
      album_id,
    });
    response = {
      success: true,
      message: "Memory has been linked with the album.",
    };
    res.status(200).json(response);
  }
);

/**
 * unlink one specific memory with an album via memory_id and album_id
 * @method DELETE
 * @route /api/memory/:id/album/:album_id
 * @access private
 */

export const unlinkMemoryWithAlbumController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const memory_id = req.params.id;
    const album_id = req.params.album_id;
    let response: ApiResponse;
    // check if memory id and album id are specified
    if (!album_id) {
      response = {
        success: false,
        message: "Album id is required.",
      };
      res.status(400).json(response);
      return;
    }
    // Check if entity exists
    const memoryExists = await Memory.findByPk(memory_id);
    if (!memoryExists) {
      response = {
        success: false,
        message: "Memory not found.",
      };
      res.status(404).json(response);
      return;
    }
    // check if the album exists
    const albumExists = await Album.findByPk(album_id);
    if (!albumExists) {
      response = {
        success: false,
        message: "Album not found.",
      };
      res.status(404).json(response);
      return;
    }
    // check if the album belongs to the user
    if (albumExists.user_id!== memoryExists.user_id) {
      response = {
        success: false,
        message: "You do not have permission to access this album.",
      };
      res.status(403).json(response);
      return;
    }
    // check if the memory already linked with the album
    const memoryInAlbum = await AlbumMemory.findOne({
      where: { memory_id, album_id },
    });
    if (!memoryInAlbum) {
      response = {
        success: false,
        message: "Memory is not linked with this album.",
      };
      res.status(400).json(response);
      return;
    }
    // unlink memory with album
    await memoryInAlbum.destroy();
    response = {
      success: true,
      message: "Memory has been unlinked with the album.",
    };
    res.status(200).json(response);
  })


/**
 * check if specific memory is linked with an album.
 * @method GET
 * @route /api/album/:id/memory/:album_id
 * @access private
 */

export const checkMemoryInAlbumController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const memory_id = req.params.id;
    const album_id = req.params.album_id;
    let response: ApiResponse;
    // check if memory id and album id are specified
    if (!album_id) {
      response = {
        success: false,
        message: "Album id is required.",
      };
      res.status(400).json(response);
      return;
    }
    // Check if entity exists
    const memoryExists = await Memory.findByPk(memory_id);
    if (!memoryExists) {
      response = {
        success: false,
        message: "Memory not found.",
      };
      res.status(404).json(response);
      return;
    }
    // check if the album exists
    const albumExists = await Album.findByPk(album_id);
    if (!albumExists) {
      response = {
        success: false,
        message: "Album not found.",
      };
      res.status(404).json(response);
      return;
    }
    // check if the memory belongs to the album
    const memoryInAlbum = await AlbumMemory.findOne({
      where: { memory_id, album_id },
    })
    if(!memoryInAlbum){
      response = {
        success: false,
        message: "Memory is not linked with this album.",
      };
      res.status(400).json(response);
      return;
    }
    response = {
      success: true,
      message: "Memory is linked with the album.",
    };
    res.status(200).json(response);
  })
export {
  getMemoriesController,
  createMemoryController,
  getMemoryByIdController,
};
