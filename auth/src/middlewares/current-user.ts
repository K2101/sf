import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export class CurrentUser implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const jwt = req.get('Authorization') || false;

    console.log(req);
  }
}
