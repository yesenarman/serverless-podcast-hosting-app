import "source-map-support/register";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler,
} from "aws-lambda";
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { Podcast } from "../../models/Podcast";
import { getAllPodcasts } from "../../businessLogic/podcasts";
import { getUserId } from "../utils";
import { createLogger } from "../../utils/logger";

const logger = createLogger("getPodcasts");

const getPodcastsHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info("Caller event", event);

  const userId = getUserId(event);
  const items: Podcast[] = await getAllPodcasts(userId);

  logger.info("Podcasts fetched", { userId, count: items.length });

  return {
    statusCode: 200,
    body: JSON.stringify({ items }),
  };
};

export const handler = middy(getPodcastsHandler).use(
  cors({ credenials: true })
);
