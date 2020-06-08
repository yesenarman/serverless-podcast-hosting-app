import "source-map-support/register";

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler,
} from "aws-lambda";
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { deletePodcast } from "../../businessLogic/podcasts";
import { getUserId } from "../utils";
import { createLogger } from "../../utils/logger";

const logger = createLogger("deletePodcast");

export const deletePodcastHandler: APIGatewayProxyHandler = async (
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

  await deletePodcast(userId, podcastId);

  logger.info("Podcast was deleted", { userId, podcastId });

  return {
    statusCode: 200,
    body: "",
  };
};

export const handler = middy(deletePodcastHandler).use(
  cors({ credenials: true })
);
