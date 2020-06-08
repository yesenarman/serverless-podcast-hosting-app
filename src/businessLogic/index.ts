import { PodcastsAccess } from "../dataLayer/PodcastsAccess";
import { EpisodesAccess } from "../dataLayer/EpisodesAccess";
import { createDynamoDBClient } from "../dataLayer/utils";
import { EpisodesService } from "./services/EpisodesService";

const docClient = createDynamoDBClient();
const podcastsAccess = new PodcastsAccess(docClient);
const episodesAccess = new EpisodesAccess(docClient);

export const episodesService = new EpisodesService(
  podcastsAccess,
  episodesAccess
);
