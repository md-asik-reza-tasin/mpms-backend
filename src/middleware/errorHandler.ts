import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = "Server Error";

  if (err instanceof mongoose.Error.CastError && err.kind === "ObjectId") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(err.errors).map((value) => value.message).join(", ");
  }

  if ((err as any).code === 11000) {
    statusCode = 400;
    message = "Duplicate field value entered";
  }

  if ((err as any).message) {
    message = (err as any).message;
  }

  res.status(statusCode).json({ message });
};
