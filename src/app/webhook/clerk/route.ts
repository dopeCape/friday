import { getDefaultLogger, getDefaultUserService, } from '@/config/defaults';
import { responseCreator, apiErrorHandler } from '@/lib/utils/apiResponse.utils';
import { ErrorResponse, User } from '@/types';
import { UserJSON } from '@clerk/nextjs/server';
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import dbConnect from '@/config/mongodb.config';

export async function POST(req: Request) {
  try {
    const logger = getDefaultLogger()
    const userService = getDefaultUserService()
    await dbConnect();
    const evt = await verifyWebhook(req)
    const { id } = evt.data
    const eventType = evt.type
    const data = evt.data
    logger.info("Webhook received", { id, eventType, webhook: "Clerk" });
    switch (eventType) {
      case 'user.created':
        const userFromClerk = data as UserJSON
        const email = userFromClerk.email_addresses[0].email_address;
        logger.info("user create event from clerk", { email })
        const userExists = await userService.checkIfUserExists(email);
        if (!userExists) {
          const user: User = {
            name: userFromClerk.first_name || userFromClerk.username || "",
            email,
            profileImage: userFromClerk.image_url,
          }
          await userService.createUser(user);
        } else {
          logger.warn("User already exists", { email, webhook: "Clerk", id });
        }
        break;
      case 'user.updated':
      case 'user.deleted':
    }
    return responseCreator(200, true, "Webhook processed", null)
  } catch (err) {
    return apiErrorHandler(err as ErrorResponse)
  }
}
