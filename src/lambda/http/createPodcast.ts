import "source-map-support/register";

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { CreatePodcastRequest } from "../../requests/CreatePodcastRequest";
import { createPodcast } from "../../businessLogic/podcasts";
import { getUserId } from "../utils";
import { createLogger } from "../../utils/logger";

const logger = createLogger("createPodcast");

const createPodcastHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info("Caller event", event);

  const userId = getUserId(event);
  const createPodcastRequest = JSON.parse(
    event.body || ""
  ) as CreatePodcastRequest;
  const podcast = await createPodcast(userId, createPodcastRequest);

  logger.info("Podcast was created", { userId, podcastId: podcast.podcastId });

  return {
    statusCode: 201,
    body: JSON.stringify({ item: podcast }),
  };
};

export const handler = middy(createPodcastHandler).use(
  cors({ credenials: true })
);
