import { v4 as uuidv4 } from "uuid";
import { Episode } from "../../models/Episode";
import { PodcastsAccess } from "../../dataLayer/PodcastsAccess";
import { EpisodesAccess } from "../../dataLayer/EpisodesAccess";
import { FileStorage } from "../../dataLayer/FileStorage";
import { CreateEpisodeRequest } from "../../requests/CreateEpisodeRequest";
import { UpdateEpisodeRequest } from "../../requests/UpdateEpisodeRequest";
import { EpisodeNotFoundError, PodcastNotFoundError } from "../errors";

export class EpisodesService {
  constructor(
    private readonly podcastsAccess: PodcastsAccess,
    private readonly episodesAccess: EpisodesAccess,
    private readonly audioStorage: FileStorage
  ) {}

  async getAllEpisodes(userId: string, podcastId: string): Promise<Episode[]> {
    const podcast = await this.podcastsAccess.findPodcastByKey(
      userId,
      podcastId
    );

    if (!podcast) {
      throw new PodcastNotFoundError();
    }

    const items = await this.episodesAccess.getAllEpisodes(podcastId);

    return Promise.all(
      items.map(
        async (item): Promise<Episode> => {
          if (await this.audioStorage.fileExists(item.episodeId)) {
            return {
              ...item,
              audioUrl: this.audioStorage.getDownloadUrl(item.episodeId),
            };
          }
          return item;
        }
      )
    );
  }

  async createEpisode(
    userId: string,
    podcastId: string,
    createEpisodeRequest: CreateEpisodeRequest
  ): Promise<Episode> {
    const podcast = await this.podcastsAccess.findPodcastByKey(
      userId,
      podcastId
    );

    if (!podcast) {
      throw new PodcastNotFoundError();
    }

    return this.episodesAccess.createEpisode({
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
    const [podcast, episode] = await Promise.all([
      this.podcastsAccess.findPodcastByKey(userId, podcastId),
      this.episodesAccess.findEpisodeByKey(podcastId, episodeId),
    ]);

    if (!podcast) {
      throw new PodcastNotFoundError();
    }

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
    const podcast = await this.podcastsAccess.findPodcastByKey(
      userId,
      podcastId
    );

    if (!podcast) {
      throw new PodcastNotFoundError();
    }

    await this.episodesAccess.deleteEpisode(podcastId, episodeId);
  }

  async generateAudioUploadUrl(
    userId: string,
    podcastId: string,
    episodeId: string
  ): Promise<string> {
    const [podcast, episode] = await Promise.all([
      this.podcastsAccess.findPodcastByKey(userId, podcastId),
      this.episodesAccess.findEpisodeByKey(podcastId, episodeId),
    ]);

    if (!podcast) {
      throw new PodcastNotFoundError();
    }

    if (!episode) {
      throw new EpisodeNotFoundError();
    }

    return this.audioStorage.getUploadUrl(episodeId);
  }
}
