import "source-map-support/register";

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { UpdatePodcastRequest } from "../../requests/UpdatePodcastRequest";
import { updatePodcast } from "../../businessLogic/podcasts";
import { getUserId } from "../utils";
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

  const updated = await updatePodcast(userId, podcastId, updatePodcastRequest);
  if (!updated) {
    logger.info("Podcast does not exist", { userId, podcastId });
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: "Podcast does not exist",
      }),
    };
  }

  logger.info("Podcast was updated", { userId, podcastId });

  return {
    statusCode: 200,
    body: "",
  };
};

export const handler = middy(updatePodcastHandler).use(
  cors({ credenials: true })
);
