import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Podcast } from "../models/Podcast";
import { PodcastUpdate } from "../models/PodcastUpdate";
import { createDynamoDBClient } from "./utils";

export class PodcastsAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly podcastsTable: string = process.env.PODCASTS_TABLE || "",
    private readonly podcastIdIndex: string = process.env.PODCAST_ID_INDEX || ""
  ) {}

  async getAllPodcasts(userId: string): Promise<Podcast[]> {
    const result = await this.docClient
      .query({
        TableName: this.podcastsTable,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
      .promise();

    return result.Items as Podcast[];
  }

  async findPodcastById(podcastId: string): Promise<Podcast | null> {
    const result = await this.docClient
      .query({
        TableName: this.podcastsTable,
        IndexName: this.podcastIdIndex,
        KeyConditionExpression: "podcastId = :podcastId",
        ExpressionAttributeValues: {
          ":podcastId": podcastId,
        },
      })
      .promise();

    if (result.Count === 0 || !result.Items) {
      return null;
    }

    return result.Items[0] as Podcast;
  }

  async createPodcast(podcast: Podcast): Promise<Podcast> {
    await this.docClient
      .put({
        TableName: this.podcastsTable,
        Item: podcast,
      })
      .promise();

    return podcast;
  }

  async updatePodcast(
    userId: string,
    podcastId: string,
    update: PodcastUpdate
  ): Promise<boolean> {
    const podcast = await this.findPodcastById(podcastId);
    if (!podcast) {
      return false;
    }

    const createdAt = podcast.createdAt;

    await this.docClient
      .update({
        TableName: this.podcastsTable,
        Key: { userId, createdAt },
        UpdateExpression:
          "set #podcastName = :podcastName, hostName = :hostName, description = :description, isPublic = :isPublic",
        ExpressionAttributeValues: {
          ":podcastName": update.name,
          ":hostName": update.hostName,
          ":description": update.description,
          ":isPublic": update.isPublic,
        },
        ExpressionAttributeNames: {
          "#podcastName": "name",
        },
      })
      .promise();

    return true;
  }

  async deletePodcast(userId: string, podcastId: string): Promise<void> {
    const podcast = await this.findPodcastById(podcastId);
    if (!podcast) {
      return;
    }

    const createdAt = podcast.createdAt;
    await this.docClient
      .delete({
        TableName: this.podcastsTable,
        Key: { userId, createdAt },
      })
      .promise();
  }
}
