import AWS from 'aws-sdk';
import { config } from '../config/env';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class AttachmentService {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      region: config.aws.region,
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    });
  }

  async generatePresignedUrl(ticketId: string, filename: string, mimeType: string) {
    const key = `${ticketId}/${Date.now()}-${filename}`;

    const params = {
      Bucket: config.aws.s3.bucketName,
      Key: key,
      Expires: config.aws.s3.presignedUrlExpiry,
      ContentType: mimeType,
    };

    const uploadUrl = await this.s3.getSignedUrlPromise('putObject', params);

    return {
      uploadUrl,
      key,
      fileUrl: `https://${config.aws.s3.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`,
    };
  }

  async createAttachment(data: {
    filename: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    ticketId: string;
    tenantId: string;
  }) {
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: data.ticketId,
        tenantId: data.tenantId,
      },
    });

    if (!ticket) {
      throw new AppError(404, 'Ticket not found', 'NOT_FOUND');
    }

    const attachment = await prisma.attachment.create({
      data: {
        filename: data.filename,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        ticketId: data.ticketId,
      },
    });

    return attachment;
  }

  async getAttachmentsByTicket(ticketId: string, tenantId: string) {
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        tenantId,
      },
    });

    if (!ticket) {
      throw new AppError(404, 'Ticket not found', 'NOT_FOUND');
    }

    const attachments = await prisma.attachment.findMany({
      where: { ticketId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return attachments;
  }

  async deleteAttachment(id: string, ticketId: string, tenantId: string) {
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        tenantId,
      },
    });

    if (!ticket) {
      throw new AppError(404, 'Ticket not found', 'NOT_FOUND');
    }

    const attachment = await prisma.attachment.findFirst({
      where: {
        id,
        ticketId,
      },
    });

    if (!attachment) {
      throw new AppError(404, 'Attachment not found', 'NOT_FOUND');
    }

    await prisma.attachment.delete({
      where: { id },
    });
  }
}
