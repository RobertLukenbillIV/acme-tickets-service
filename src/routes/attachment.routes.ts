import { Router } from 'express';
import { body } from 'express-validator';
import { AttachmentController } from '../controllers/attachment.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();
const attachmentController = new AttachmentController();

router.use(authenticate);

router.post(
  '/:ticketId/attachments/upload-url',
  [body('filename').notEmpty(), body('mimeType').notEmpty(), validate],
  attachmentController.generateUploadUrl.bind(attachmentController)
);

router.post(
  '/:ticketId/attachments',
  [
    body('filename').notEmpty(),
    body('fileUrl').notEmpty(),
    body('fileSize').isInt(),
    body('mimeType').notEmpty(),
    validate,
  ],
  attachmentController.createAttachment.bind(attachmentController)
);

router.get(
  '/:ticketId/attachments',
  attachmentController.getAttachments.bind(attachmentController)
);

router.delete(
  '/:ticketId/attachments/:id',
  attachmentController.deleteAttachment.bind(attachmentController)
);

export default router;
