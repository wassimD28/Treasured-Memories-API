import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import Album from "../models/album.model";
import { ApiResponse } from "../interfaces/common.interface";
import Memory from "../models/memory.model";
import AlbumMemory from "../models/albumMemory.model";
import sequelize from "../config/database";


/**
 * get all memories in specific album.
 * @method GET
 * @route /api/album/memories/:id
 * @access private
 */

export const getAlbumMemoriesController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const album_id = req.params.id;
    let response: ApiResponse;

    // Start a transaction
    const transaction = await sequelize.transaction();

    try {
      // Check if the album exists
      const album = await Album.findByPk(album_id, { transaction });
      if (!album) {
        response = {
          success: false,
          message: "Album not found",
        };
        await transaction.rollback();
        res.status(404).json(response);
        return;
      }

      // Fetch all albumMemory entries for the album
      const albumMemoryEntries = await AlbumMemory.findAll({
        where: { album_id },
        transaction,
      });

      // Extract memory IDs from the albumMemory entries
      const memoryIds = albumMemoryEntries.map((entry) => entry.memory_id);

      // Fetch Memory records associated with the album
      const memories = await Memory.findAll({
        where: { id: memoryIds },
        attributes: [
          "id",
          "title",
          "description",
          "images",
          "likeCounter",
          "commentCounter",
          "user_id",
          "location_id",
          "createdAt",
          "updatedAt",
        ],
        transaction,
      });

      // Commit the transaction
      await transaction.commit();

      // Build the response
      response = {
        success: true,
        message: "Memories fetched successfully",
        data: {
          album_id: album.id,
          title: album.title, // Include album name or any other fields as needed
          memories,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      // Rollback the transaction on error
      await transaction.rollback();

      response = {
        success: false,
        message: "An error occurred while fetching album memories.",
      };
      res.status(500).json(response);
    }
  }
);
/**
 * get all albums via user id.
 * @method GET
 * @route /api/album/:id
 * @access private
 */
export const getAllAlbumController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const user_id = req.auth?.userId;
    const albums = await Album.findAll({ where: { user_id } });
    const response: ApiResponse = {
      success: true,
      message: "Albums fetched successfully",
      data: albums,
    };
    res.status(200).json(response);
  }
);

/**
 * get single album by id.
 * @method GET
 * @route /api/album/:id
 * @access private
 */

export const getSingleAlbumController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const album_id = req.params.id;
    let response: ApiResponse;
    // check if album id is specified
    if (!album_id) {
      res.status(400).json({ message: "Missing album_id parameter." });
      return;
    }
    // check if album exists
    const album = await Album.findByPk(album_id, {
      include: {
        model: Memory,
        as: "memories", // Use the alias specified in the association
        attributes: [
          "id",
          "title",
          "description",
          "images",
          "createdAt",
          "updatedAt",
        ], // Specify attributes to retrieve
        through: { attributes: [] }, // Exclude AlbumMemory attributes if not needed
      },
    });
    if (!album) {
      res.status(404).json({ message: "Album not found." });
      return;
    }
    response = {
      success: true,
      message: "Album fetched successfully",
      data: album,
    };
    res.status(200).json(response);
  }
);

/**
 * create a new album.
 * @method POST
 * @route /api/album/:id
 * @access private
 */

export const createAlbumController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const user_id = req.auth?.userId;
    const { title, description } = req.body;
    let response: ApiResponse;
    // check if album title is specified
    if (!title) {
      response = {
        success: false,
        message: "Album title is required",
      };
      res.status(400).json(response);
      return;
    }
    // check if album description is specified
    if (!description) {
      response = {
        success: false,
        message: "Album description is required",
      };
      res.status(400).json(response);
      return;
    }

    const newAlbum = await Album.create({
      user_id,
      title,
      description,
    });
    response = {
      success: true,
      message: "Album created successfully",
      data: newAlbum,
    };
    res.status(201).json(response);
  }
);

/**
 * update a specific album via album id.
 * @method PUT
 * @route /api/album/:id
 * @access private
 */

export const updateAlbumController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const album_id = req.params.id;
    const { title, description } = req.body;
    let response: ApiResponse;
    // check if one of the title of description is specified
    if (!title && !description) {
      response = {
        success: false,
        message: "At least one of the title or description is required",
      };
      res.status(400).json(response);
    }
    // check if the album exists
    const albumExists = await Album.findByPk(album_id);
    if (!albumExists) {
      response = {
        success: false,
        message: "Album not found",
      };
      res.status(404).json(response);
      return;
    }
    // update the album
    await albumExists.update({ title, description });
    response = {
      success: true,
      message: "Album updated successfully",
    };
    res.status(200).json(response);
  }
);

/**
 * delete a specific album via album id.
 * @method DELETE
 * @route /api/album/:id
 * @access private
 */

export const deleteAlbumController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const album_id = req.params.id;
    let response: ApiResponse;
    // check if the album exists
    const albumExists = await Album.findByPk(album_id);
    if (!albumExists) {
      response = {
        success: false,
        message: "Album not found",
      };
      res.status(404).json(response);
      return;
    }
    // delete the album
    await albumExists.destroy();
    response = {
      success: true,
      message: "Album deleted successfully",
    };
    res.status(200).json(response);
  }
);
