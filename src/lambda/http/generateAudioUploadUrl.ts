import "source-map-support/register";

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler,
} from "aws-lambda";
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { episodesService } from "../../businessLogic";
import { getUserId, mapErrorToAPIGatewayResponse } from "../utils";
import { createLogger } from "../../utils/logger";

const logger = createLogger("generateAudioUploadUrl");

export const generateAudioUploadUrlHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info("Caller event", event);

  const userId = getUserId(event);
  const podcastId = event.pathParameters?.podcastId;
  const episodeId = event.pathParameters?.episodeId;

  if (!podcastId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid podcastId parameter" }),
    };
  }

  if (!episodeId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid episodeId parameter" }),
    };
  }

  try {
    const uploadUrl = await episodesService.generateAudioUploadUrl(
      userId,
      podcastId,
      episodeId
    );

    logger.info("Audio upload url was generated", {
      userId,
      podcastId,
      uploadUrl,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl }),
    };
  } catch (error) {
    logger.error("Audio upload url generate failed", { error });
    return mapErrorToAPIGatewayResponse(error);
  }
};

export const handler = middy(generateAudioUploadUrlHandler).use(
  cors({
    credenials: true,
  })
);
