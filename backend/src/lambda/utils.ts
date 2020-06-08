import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { parseUserId } from "../auth/utils";
import {
  ActionForbiddenError,
  PodcastNotFoundError,
  EpisodeNotFoundError,
} from "../businessLogic/errors";

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization;
  const split = authorization.split(" ");
  const jwtToken = split[1];

  return parseUserId(jwtToken);
}

export function mapErrorToAPIGatewayResponse(
  error: Error
): APIGatewayProxyResult {
  if (error instanceof ActionForbiddenError) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: "Action is forbidden" }),
    };
  }

  if (error instanceof PodcastNotFoundError) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Podcast does not exist" }),
    };
  }

  if (error instanceof EpisodeNotFoundError) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Episode does not exist" }),
    };
  }

  return {
    statusCode: 500,
    body: JSON.stringify({ error: "Internal server error" }),
  };
}
