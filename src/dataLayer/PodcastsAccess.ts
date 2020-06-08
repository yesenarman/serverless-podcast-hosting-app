import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Podcast } from "../models/Podcast";
import { PodcastUpdate } from "../models/PodcastUpdate";
import { createDynamoDBClient } from "./utils";

export class PodcastsAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly podcastsTable: string = process.env.PODCASTS_TABLE || "",
    private readonly podcastCreatedAtIndex: string = process.env
      .PODCAST_CREATED_AT_INDEX || ""
  ) {}

  async getAllPodcasts(userId: string): Promise<Podcast[]> {
    const result = await this.docClient
      .query({
        TableName: this.podcastsTable,
        IndexName: this.podcastCreatedAtIndex,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
      .promise();

    return result.Items as Podcast[];
  }

  async findPodcastByKey(
    userId: string,
    podcastId: string
  ): Promise<Podcast | null> {
    const result = await this.docClient
      .get({
        TableName: this.podcastsTable,
        Key: { userId, podcastId },
      })
      .promise();

    if (!result.Item) {
      return null;
    }

    return result.Item as Podcast;
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
  ): Promise<void> {
    await this.docClient
      .update({
        TableName: this.podcastsTable,
        Key: { userId, podcastId },
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
  }

  async deletePodcast(userId: string, podcastId: string): Promise<void> {
    await this.docClient
      .delete({
        TableName: this.podcastsTable,
        Key: { userId, podcastId },
      })
      .promise();
  }
}
