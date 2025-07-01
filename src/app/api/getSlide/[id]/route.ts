import { getDefaultRedisService } from "@/config/defaults";
import { apiErrorHandler } from "@/lib/utils/apiResponse.utils";
import { ErrorResponse } from "@/types";
import { NextResponse } from "next/server";

export async function GET(req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const redisService = getDefaultRedisService();
    const slideData = await redisService.get(id);
    const slideJSON = await JSON.parse(slideData);
    return NextResponse.json(slideJSON);
  } catch (error) {
    apiErrorHandler(error as ErrorResponse);

  }


}
