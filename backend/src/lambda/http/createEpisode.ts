import "source-map-support/register";

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { CreateEpisodeRequest } from "../../requests/CreateEpisodeRequest";
import { episodesService } from "../../businessLogic";
import { getUserId, mapErrorToAPIGatewayResponse } from "../utils";
import { createLogger } from "../../utils/logger";

const logger = createLogger("createEpisode");

const createEpisodeHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info("Caller event", { event });

  const userId = getUserId(event);
  const podcastId = event.pathParameters?.podcastId;
  const createEpisodeRequest = JSON.parse(
    event.body || ""
  ) as CreateEpisodeRequest;

  if (!podcastId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid podcastId parameter" }),
    };
  }

  try {
    const episode = await episodesService.createEpisode(
      userId,
      podcastId,
      createEpisodeRequest
    );

    logger.info("Podcast episode was created", {
      userId,
      podcastId,
      episodeId: episode.episodeId,
    });

    return {
      statusCode: 201,
      body: JSON.stringify({ item: episode }),
    };
  } catch (error) {
    logger.error("Podcast episode create failed", { error });
    return mapErrorToAPIGatewayResponse(error);
  }
};

export const handler = middy(createEpisodeHandler).use(
  cors({ credenials: true })
);
