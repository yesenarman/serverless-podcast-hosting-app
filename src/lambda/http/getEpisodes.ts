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

const logger = createLogger("getEpisodes");

const getEpisodesHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info("Caller event", { event });

  const userId = getUserId(event);
  const podcastId = event.pathParameters?.podcastId;

  if (!podcastId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid podcastId parameter" }),
    };
  }

  try {
    const items = await episodesService.getAllEpisodes(userId, podcastId);

    logger.info("Podcast episodes were fetched", {
      userId,
      podcastId,
      count: items.length,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ items }),
    };
  } catch (error) {
    logger.error("Podcast episodes fetch failed", { error });
    return mapErrorToAPIGatewayResponse(error);
  }
};

export const handler = middy(getEpisodesHandler).use(
  cors({ credenials: true })
);
