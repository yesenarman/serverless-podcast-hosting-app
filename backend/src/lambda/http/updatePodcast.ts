import "source-map-support/register";

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { UpdatePodcastRequest } from "../../requests/UpdatePodcastRequest";
import { podcastsService } from "../../businessLogic";
import { getUserId, mapErrorToAPIGatewayResponse } from "../utils";
import { createLogger } from "../../utils/logger";

const logger = createLogger("updatePodcast");

const updatePodcastHandler: APIGatewayProxyHandler = async function (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  logger.info("Caller event", { event });

  const userId = getUserId(event);
  const podcastId = event.pathParameters?.podcastId;
  const updatePodcastRequest = JSON.parse(
    event.body || ""
  ) as UpdatePodcastRequest;

  if (!podcastId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid podcastId parameter" }),
    };
  }

  try {
    await podcastsService.updatePodcast(
      userId,
      podcastId,
      updatePodcastRequest
    );

    logger.info("Podcast was updated", { userId, podcastId });

    return {
      statusCode: 200,
      body: "",
    };
  } catch (error) {
    logger.error("Podcast update failed", { error });
    return mapErrorToAPIGatewayResponse(error);
  }
};

export const handler = middy(updatePodcastHandler).use(
  cors({ credenials: true })
);
