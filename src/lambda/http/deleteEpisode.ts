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

const logger = createLogger("deleteEpisode");

export const deleteEpisodeHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info("Caller event", { event });

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
    await episodesService.deleteEpisode(userId, podcastId, episodeId);

    logger.info("Podcast episode was deleted", {
      userId,
      podcastId,
      episodeId,
    });

    return {
      statusCode: 200,
      body: "",
    };
  } catch (error) {
    logger.error("Podcast episode delete failed", { error });
    return mapErrorToAPIGatewayResponse(error);
  }
};

export const handler = middy(deleteEpisodeHandler).use(
  cors({ credenials: true })
);
