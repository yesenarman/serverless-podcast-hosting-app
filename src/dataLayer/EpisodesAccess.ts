import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Episode } from "../models/Episode";
import { EpisodeUpdate } from "../models/EpisodeUpdate";
import { createDynamoDBClient } from "./utils";

export class EpisodesAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly episodesTable: string = process.env.EPISODES_TABLE || "",
    private readonly episodeCreatedAtIndex: string = process.env
      .EPISODE_CREATED_AT_INDEX || ""
  ) {}

  async getAllEpisodes(podcastId: string): Promise<Episode[]> {
    const result = await this.docClient
      .query({
        TableName: this.episodesTable,
        IndexName: this.episodeCreatedAtIndex,
        KeyConditionExpression: "podcastId = :podcastId",
        ExpressionAttributeValues: {
          ":podcastId": podcastId,
        },
        ScanIndexForward: false,
      })
      .promise();

    return result.Items as Episode[];
  }

  async findEpisodeById(
    podcastId: string,
    episodeId: string
  ): Promise<Episode | null> {
    const result = await this.docClient
      .get({
        TableName: this.episodesTable,
        Key: { podcastId, episodeId },
      })
      .promise();

    if (!result.Item) {
      return null;
    }

    return result.Item as Episode;
  }

  async createEpisode(episode: Episode): Promise<Episode> {
    await this.docClient
      .put({
        TableName: this.episodesTable,
        Item: episode,
      })
      .promise();

    return episode;
  }

  async updateEpisode(
    podcastId: string,
    episodeId: string,
    update: EpisodeUpdate
  ): Promise<void> {
    await this.docClient
      .update({
        TableName: this.episodesTable,
        Key: { podcastId, episodeId },
        UpdateExpression:
          "set #episodeName = :episodeName, description = :description",
        ExpressionAttributeValues: {
          ":episodeName": update.name,
          ":description": update.description,
        },
        ExpressionAttributeNames: {
          "#episodeName": "name",
        },
      })
      .promise();
  }

  async deleteEpisode(podcastId: string, episodeId: string): Promise<void> {
    await this.docClient
      .delete({
        TableName: this.episodesTable,
        Key: { podcastId, episodeId },
      })
      .promise();
  }
}
