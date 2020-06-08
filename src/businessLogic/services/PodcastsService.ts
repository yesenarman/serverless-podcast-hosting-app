import { v4 as uuidv4 } from "uuid";

import { Podcast } from "../../models/Podcast";
import { PodcastsAccess } from "../../dataLayer/PodcastsAccess";
import { CreatePodcastRequest } from "../../requests/CreatePodcastRequest";
import { UpdatePodcastRequest } from "../../requests/UpdatePodcastRequest";
import { PodcastNotFoundError } from "../errors";

export class PodcastsService {
  constructor(private readonly podcastsAccess: PodcastsAccess) {}

  async getAllPodcasts(userId: string): Promise<Podcast[]> {
    return await this.podcastsAccess.getAllPodcasts(userId);
  }

  async createPodcast(
    userId: string,
    createPodcastRequest: CreatePodcastRequest
  ): Promise<Podcast> {
    return await this.podcastsAccess.createPodcast({
      userId,
      podcastId: uuidv4(),
      createdAt: new Date().toISOString(),
      isPublic: false,
      ...createPodcastRequest,
    });
  }

  async updatePodcast(
    userId: string,
    podcastId: string,
    updatePodcastRequest: UpdatePodcastRequest
  ): Promise<void> {
    const podcast = await this.podcastsAccess.findPodcastByKey(
      userId,
      podcastId
    );

    if (!podcast) {
      throw new PodcastNotFoundError();
    }

    await this.podcastsAccess.updatePodcast(
      userId,
      podcastId,
      updatePodcastRequest
    );
  }

  async deletePodcast(userId: string, podcastId: string): Promise<void> {
    await this.podcastsAccess.deletePodcast(userId, podcastId);
  }
}
