import { v4 as uuidv4 } from "uuid";

import { Podcast } from "../models/Podcast";
import { PodcastsAccess } from "../dataLayer/PodcastsAccess";
import { CreatePodcastRequest } from "../requests/CreatePodcastRequest";
import { UpdatePodcastRequest } from "../requests/UpdatePodcastRequest";

const podcastsAccess = new PodcastsAccess();

export async function getAllPodcasts(userId: string): Promise<Podcast[]> {
  return await podcastsAccess.getAllPodcasts(userId);
}

export async function createPodcast(
  userId: string,
  createPodcastRequest: CreatePodcastRequest
): Promise<Podcast> {
  return await podcastsAccess.createPodcast({
    userId,
    podcastId: uuidv4(),
    createdAt: new Date().toISOString(),
    isPublic: false,
    ...createPodcastRequest,
  });
}

export async function updatePodcast(
  userId: string,
  podcastId: string,
  updatePodcastRequest: UpdatePodcastRequest
): Promise<boolean> {
  return await podcastsAccess.updatePodcast(
    userId,
    podcastId,
    updatePodcastRequest
  );
}

export async function deletePodcast(
  userId: string,
  podcastId: string
): Promise<void> {
  await podcastsAccess.deletePodcast(userId, podcastId);
}
