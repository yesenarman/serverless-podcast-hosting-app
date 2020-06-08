import { S3 } from "aws-sdk";
import { createLogger } from "../utils/logger";

const logger = createLogger("ImageStorage");

export class ImageStorage {
  constructor(
    private readonly s3: S3,
    private readonly imagesBucket = process.env.IMAGES_S3_BUCKET || "",
    private readonly uploadUrlExpiration = parseInt(
      process.env.UPLOAD_URL_EXPIRATION || "0"
    ),
    private readonly downloadUrlExpiration = parseInt(
      process.env.DOWNLOAD_URL_EXPIRATION || "0"
    )
  ) {}

  async fileExists(podcastId: string): Promise<boolean> {
    try {
      logger.info("Checking if file exists", {
        Bucket: this.imagesBucket,
        Key: podcastId,
      });
      const head = await this.s3
        .headObject({
          Bucket: this.imagesBucket,
          Key: podcastId,
        })
        .promise();
      logger.info("Head object result", { head });
      return true;
    } catch (error) {
      logger.error("Head object error", { error });
      return false;
    }
  }

  getUploadUrl(podcastId: string) {
    return this.s3.getSignedUrl("putObject", {
      Bucket: this.imagesBucket,
      Key: podcastId,
      Expires: this.uploadUrlExpiration,
    });
  }

  getDownloadUrl(podcastId: string) {
    return this.s3.getSignedUrl("getObject", {
      Bucket: this.imagesBucket,
      Key: podcastId,
      Expires: this.downloadUrlExpiration,
    });
  }
}
