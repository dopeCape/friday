import { getDefaultUserService } from "@/config/defaults";
import dbConnect from "@/config/mongodb.config";
import { validateBody } from "@/lib/bodyValidator";
import { userOnboardingSchema } from "@/lib/schemas/request";
import { apiErrorHandler, responseCreator } from "@/lib/utils/apiResponse.utils";
import { ErrorResponse } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";


export async function GET(_: Request) {
  try {
    await dbConnect();
    const { userId } = await auth();
    if (!userId) {
      return responseCreator(401, false, "Unauthorized", {});
    }
    const usreService = getDefaultUserService();
    const isUserOnboarded = await usreService.checkIfUserIsOnboarded(userId);
    const client = await clerkClient()
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        onboarded: isUserOnboarded
      }
    });
    return responseCreator(200, true, isUserOnboarded ? "User is onboarded" : "User is not onboarded", isUserOnboarded)
  } catch (error) {
    return apiErrorHandler(error as ErrorResponse)
  }
}



export async function POST(req: Request) {
  try {
    await dbConnect();
    const { userId } = await auth();
    if (!userId) {
      return responseCreator(401, false, "Unauthorized", {});
    }
    const usreService = getDefaultUserService();
    const { level, stack, os, knowsBasicCommands, knowsGit } = await validateBody(userOnboardingSchema, req);
    const isUserOnboarded = await usreService.onboardUser(userId, level, stack, os, knowsBasicCommands, knowsGit);
    const client = await clerkClient()
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        onboarded: true
      }
    });
    return responseCreator(200, true, isUserOnboarded ? "User is onboarded" : "User is not onboarded", true);
  } catch (error) {
    return apiErrorHandler(error as ErrorResponse);
  }
}
