import { v4 as uuidv4 } from "uuid";
import { Episode } from "../../models/Episode";
import { PodcastsAccess } from "../../dataLayer/PodcastsAccess";
import { EpisodesAccess } from "../../dataLayer/EpisodesAccess";
import { CreateEpisodeRequest } from "../../requests/CreateEpisodeRequest";
import { UpdateEpisodeRequest } from "../../requests/UpdateEpisodeRequest";
import {
  ActionForbiddenError,
  EpisodeNotFoundError,
  PodcastNotFoundError,
} from "../errors";

export class EpisodesService {
  constructor(
    private readonly podcastsAccess: PodcastsAccess,
    private readonly episodesAccess: EpisodesAccess
  ) {}

  async getAllEpisodes(
    userId: string | null,
    podcastId: string
  ): Promise<Episode[]> {
    const podcast = await this.podcastsAccess.findPodcastById(podcastId);

    if (!podcast) {
      throw new PodcastNotFoundError();
    }

    if (!podcast.isPublic && podcast.userId !== userId) {
      throw new ActionForbiddenError();
    }

    return await this.episodesAccess.getAllEpisodes(podcastId);
  }

  async createEpisode(
    userId: string,
    podcastId: string,
    createEpisodeRequest: CreateEpisodeRequest
  ): Promise<Episode> {
    const podcast = await this.podcastsAccess.findPodcastById(podcastId);

    if (!podcast) {
      throw new PodcastNotFoundError();
    }

    if (podcast.userId !== userId) {
      throw new ActionForbiddenError();
    }

    return await this.episodesAccess.createEpisode({
      podcastId,
      episodeId: uuidv4(),
      createdAt: new Date().toISOString(),
      ...createEpisodeRequest,
    });
  }

  async updateEpisode(
    userId: string,
    podcastId: string,
    episodeId: string,
    updateEpisodeRequest: UpdateEpisodeRequest
  ): Promise<void> {
    const podcast = await this.podcastsAccess.findPodcastById(podcastId);

    if (!podcast) {
      throw new PodcastNotFoundError();
    }

    if (podcast.userId !== userId) {
      throw new ActionForbiddenError();
    }

    const episode = await this.episodesAccess.findEpisodeById(
      podcastId,
      episodeId
    );

    if (!episode) {
      throw new EpisodeNotFoundError();
    }

    await this.episodesAccess.updateEpisode(
      podcastId,
      episodeId,
      updateEpisodeRequest
    );
  }

  async deleteEpisode(
    userId: string,
    podcastId: string,
    episodeId: string
  ): Promise<void> {
    const podcast = await this.podcastsAccess.findPodcastById(podcastId);

    if (!podcast) {
      throw new PodcastNotFoundError();
    }

    if (podcast.userId !== userId) {
      throw new ActionForbiddenError();
    }

    await this.episodesAccess.deleteEpisode(podcastId, episodeId);
  }
}
