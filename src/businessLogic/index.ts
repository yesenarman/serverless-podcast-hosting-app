import { createDynamoDBClient } from "../dataLayer/utils";
import { PodcastsAccess } from "../dataLayer/PodcastsAccess";
import { EpisodesAccess } from "../dataLayer/EpisodesAccess";
import { PodcastsService } from "./services/PodcastsService";
import { EpisodesService } from "./services/EpisodesService";

const docClient = createDynamoDBClient();
const podcastsAccess = new PodcastsAccess(docClient);
const episodesAccess = new EpisodesAccess(docClient);

export const podcastsService = new PodcastsService(podcastsAccess);

export const episodesService = new EpisodesService(
  podcastsAccess,
  episodesAccess
);
