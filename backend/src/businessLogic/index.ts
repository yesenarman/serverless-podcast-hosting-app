import { createDynamoDBClient, createS3Client } from "../dataLayer/utils";
import { PodcastsAccess } from "../dataLayer/PodcastsAccess";
import { EpisodesAccess } from "../dataLayer/EpisodesAccess";
import { FileStorage } from "../dataLayer/FileStorage";
import { PodcastsService } from "./services/PodcastsService";
import { EpisodesService } from "./services/EpisodesService";

const docClient = createDynamoDBClient();
const s3 = createS3Client();
const podcastsAccess = new PodcastsAccess(docClient);
const episodesAccess = new EpisodesAccess(docClient);
const imageStorage = new FileStorage(s3, process.env.IMAGES_S3_BUCKET || "");
const audioStorage = new FileStorage(s3, process.env.AUDIOS_S3_BUCKET || "");

export const podcastsService = new PodcastsService(
  podcastsAccess,
  imageStorage
);

export const episodesService = new EpisodesService(
  podcastsAccess,
  episodesAccess,
  audioStorage
);
