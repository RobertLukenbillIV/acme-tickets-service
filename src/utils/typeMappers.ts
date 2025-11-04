import {
  TicketStatus as PrismaTicketStatus,
  TicketPriority as PrismaTicketPriority,
} from '@prisma/client';
import { TicketStatus, Priority } from '../contracts';

// Map contract types to Prisma types
export function contractToPrismaStatus(status: TicketStatus): PrismaTicketStatus {
  return status as PrismaTicketStatus;
}

export function contractToPrismaPriority(priority: Priority): PrismaTicketPriority {
  return priority as PrismaTicketPriority;
}

// Map Prisma types to contract types
export function prismaToContractStatus(status: PrismaTicketStatus): TicketStatus {
  return status as TicketStatus;
}

export function prismaToContractPriority(priority: PrismaTicketPriority): Priority {
  return priority as Priority;
}
