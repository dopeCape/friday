import { getDefaultLogger, getDefaultUserService, } from '@/config/defaults';
import { responseCreator, apiErrorHandler } from '@/lib/utils/apiResponse.utils';
import { ErrorResponse, Logger, User, WithoutId } from '@/types';
import { DeletedObjectJSON, UserJSON } from '@clerk/nextjs/server';
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import dbConnect from '@/config/mongodb.config';
import UserService from '@/lib/services/user.service';

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
        await createUser(data as UserJSON, logger, userService, id as string);
        break;
      case 'user.updated':
      case 'user.deleted':
        await deleteUser(data as DeletedObjectJSON, logger, userService, id as string);
        break;
    }
    return responseCreator(200, true, "Webhook processed", null)
  } catch (err) {
    return apiErrorHandler(err as ErrorResponse)
  }
}

async function createUser(data: UserJSON, logger: Logger, userService: UserService, id: string) {
  const userFromClerk = data as UserJSON
  const email = userFromClerk.email_addresses[0].email_address;
  logger.info("user create event from clerk", { email })
  const userExists = await userService.checkIfUserExists(email);
  if (!userExists) {
    const user: WithoutId<User> = {
      name: userFromClerk.first_name || userFromClerk.username || "",
      email,
      profileImage: userFromClerk.image_url,
      clerkId: userFromClerk.id,
    }
    await userService.createUser(user);
  } else {
    logger.warn("User already exists", { email, webhook: "Clerk", id });
  }
}

async function deleteUser(data: DeletedObjectJSON, logger: Logger, userService: UserService, id: string) {
  const userFromClerk = data
  const clerkId = userFromClerk.id;
  if (!clerkId) {
    logger.error("Missing clerk id from webhook data", { data, webhookId: id });
    return
  }
  logger.info("user delete event from clerk", { clerkId, data })
  const deletedUser = await userService.deleteUserWithClerkId(clerkId);
  if (!deletedUser) {
    logger.warn("User does not exists", { clerkId, webhookId: id });
  }
}
