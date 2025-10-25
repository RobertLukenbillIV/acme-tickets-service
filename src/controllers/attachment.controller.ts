import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AttachmentService } from '../services/attachment.service';

const attachmentService = new AttachmentService();

export class AttachmentController {
  async generateUploadUrl(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { filename, mimeType } = req.body;
      const result = await attachmentService.generatePresignedUrl(
        req.params.ticketId,
        filename,
        mimeType
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createAttachment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const attachment = await attachmentService.createAttachment({
        ...req.body,
        ticketId: req.params.ticketId,
        tenantId: req.user!.tenantId,
      });
      res.status(201).json(attachment);
    } catch (error) {
      next(error);
    }
  }

  async getAttachments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const attachments = await attachmentService.getAttachmentsByTicket(
        req.params.ticketId,
        req.user!.tenantId
      );
      res.json(attachments);
    } catch (error) {
      next(error);
    }
  }

  async deleteAttachment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await attachmentService.deleteAttachment(
        req.params.id,
        req.params.ticketId,
        req.user!.tenantId
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
