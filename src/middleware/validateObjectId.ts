import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

export const validateObjectId = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.params[paramName];
    if (!value || Array.isArray(value) || !mongoose.Types.ObjectId.isValid(value)) {
      return res.status(400).json({ message: `Invalid ${paramName}` });
    }
    next();
  };
};
