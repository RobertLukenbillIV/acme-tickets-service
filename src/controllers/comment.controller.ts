import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CommentService } from '../services/comment.service';

const commentService = new CommentService();

export class CommentController {
  async createComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comment = await commentService.createComment({
        ...req.body,
        ticketId: req.params.ticketId,
        authorId: req.user!.id,
        tenantId: req.user!.tenantId,
      });
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }

  async getComments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comments = await commentService.getCommentsByTicket(
        req.params.ticketId,
        req.user!.tenantId
      );
      res.json(comments);
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comment = await commentService.updateComment(
        req.params.id,
        req.params.ticketId,
        req.user!.tenantId,
        req.body.content,
        req.user!.id
      );
      res.json(comment);
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await commentService.deleteComment(
        req.params.id,
        req.params.ticketId,
        req.user!.tenantId,
        req.user!.id
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
