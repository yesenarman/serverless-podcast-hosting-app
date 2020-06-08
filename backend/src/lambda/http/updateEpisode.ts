import "source-map-support/register";

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { UpdateEpisodeRequest } from "../../requests/UpdateEpisodeRequest";
import { episodesService } from "../../businessLogic";
import { getUserId, mapErrorToAPIGatewayResponse } from "../utils";
import { createLogger } from "../../utils/logger";

const logger = createLogger("updateEpisode");

const updateEpisodeHandler: APIGatewayProxyHandler = async function (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  logger.info("Caller event", { event });

  const userId = getUserId(event);
  const podcastId = event.pathParameters?.podcastId;
  const episodeId = event.pathParameters?.episodeId;
  const updateEpisodeRequest = JSON.parse(
    event.body || ""
  ) as UpdateEpisodeRequest;

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
    await episodesService.updateEpisode(
      userId,
      podcastId,
      episodeId,
      updateEpisodeRequest
    );

    logger.info("Podcast episode was updated", {
      userId,
      podcastId,
      episodeId,
    });

    return {
      statusCode: 200,
      body: "",
    };
  } catch (error) {
    logger.error("Podcast episode update failed", { error });
    return mapErrorToAPIGatewayResponse(error);
  }
};

export const handler = middy(updateEpisodeHandler).use(
  cors({ credenials: true })
);
