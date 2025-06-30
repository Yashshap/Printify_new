import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createWebhook = async (event, payload) => {
  return await prisma.webhook.create({
    data: {
      event,
      payload,
    },
  });
}; 