import { Request, Response, NextFunction } from 'express';

// Mock upload middleware
export const handleUpload = (req: Request, res: Response, next: NextFunction) => {
  // Logic for multer or parsing multipart forms would go here
  next();
};
