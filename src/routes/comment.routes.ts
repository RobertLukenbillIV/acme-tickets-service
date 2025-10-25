import { Router } from 'express';
import { body } from 'express-validator';
import { CommentController } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();
const commentController = new CommentController();

router.use(authenticate);

router.post(
  '/:ticketId/comments',
  [body('content').notEmpty(), validate],
  commentController.createComment.bind(commentController)
);

router.get('/:ticketId/comments', commentController.getComments.bind(commentController));

router.put(
  '/:ticketId/comments/:id',
  [body('content').notEmpty(), validate],
  commentController.updateComment.bind(commentController)
);

router.delete('/:ticketId/comments/:id', commentController.deleteComment.bind(commentController));

export default router;
