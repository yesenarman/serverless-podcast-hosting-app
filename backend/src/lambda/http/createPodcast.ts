import "source-map-support/register";

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { CreatePodcastRequest } from "../../requests/CreatePodcastRequest";
import { podcastsService } from "../../businessLogic";
import { getUserId, mapErrorToAPIGatewayResponse } from "../utils";
import { createLogger } from "../../utils/logger";

const logger = createLogger("createPodcast");

const createPodcastHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info("Caller event", { event });

  const userId = getUserId(event);
  const createPodcastRequest = JSON.parse(
    event.body || ""
  ) as CreatePodcastRequest;

  try {
    const podcast = await podcastsService.createPodcast(
      userId,
      createPodcastRequest
    );

    logger.info("Podcast was created", {
      userId,
      podcastId: podcast.podcastId,
    });

    return {
      statusCode: 201,
      body: JSON.stringify({ item: podcast }),
    };
  } catch (error) {
    logger.error("Podcast create failed", { error });
    return mapErrorToAPIGatewayResponse(error);
  }
};

export const handler = middy(createPodcastHandler).use(
  cors({ credenials: true })
);
