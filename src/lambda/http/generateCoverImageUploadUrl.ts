import "source-map-support/register";

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler,
} from "aws-lambda";
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { podcastsService } from "../../businessLogic";
import { getUserId, mapErrorToAPIGatewayResponse } from "../utils";
import { createLogger } from "../../utils/logger";

const logger = createLogger("generateCoverImageUploadUrl");

export const generateCoverImageUploadUrlHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info("Caller event", event);

  const userId = getUserId(event);
  const podcastId = event.pathParameters?.podcastId;

  if (!podcastId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid podcastId parameter" }),
    };
  }

  try {
    const uploadUrl = await podcastsService.generateCoverImageUploadUrl(
      userId,
      podcastId
    );

    logger.info("Cover image upload url was generated", {
      userId,
      podcastId,
      uploadUrl,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl }),
    };
  } catch (error) {
    logger.error("Cover image upload url generate failed", { error });
    return mapErrorToAPIGatewayResponse(error);
  }
};

export const handler = middy(generateCoverImageUploadUrlHandler).use(
  cors({
    credenials: true,
  })
);
