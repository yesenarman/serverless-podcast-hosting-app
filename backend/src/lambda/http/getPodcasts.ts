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

const logger = createLogger("getPodcasts");

const getPodcastsHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info("Caller event", { event });

  const userId = getUserId(event);

  try {
    const items = await podcastsService.getAllPodcasts(userId);

    logger.info("Podcasts were fetched", { userId, count: items.length });

    return {
      statusCode: 200,
      body: JSON.stringify({ items }),
    };
  } catch (error) {
    logger.error("Podcasts fetch failed", { error });
    return mapErrorToAPIGatewayResponse(error);
  }
};

export const handler = middy(getPodcastsHandler).use(
  cors({ credenials: true })
);
