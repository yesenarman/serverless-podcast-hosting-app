import { S3 } from "aws-sdk";
import { createLogger } from "../utils/logger";

const logger = createLogger("FileStorage");

export class FileStorage {
  constructor(
    private readonly s3: S3,
    private readonly bucket: string,
    private readonly uploadUrlExpiration = parseInt(
      process.env.UPLOAD_URL_EXPIRATION || "0"
    ),
    private readonly downloadUrlExpiration = parseInt(
      process.env.DOWNLOAD_URL_EXPIRATION || "0"
    )
  ) {}

  async fileExists(fileId: string): Promise<boolean> {
    try {
      logger.info("Checking if file exists", {
        Bucket: this.bucket,
        Key: fileId,
      });
      const head = await this.s3
        .headObject({
          Bucket: this.bucket,
          Key: fileId,
        })
        .promise();
      logger.info("Head object result", { head });
      return true;
    } catch (error) {
      logger.error("Head object error", { error });
      return false;
    }
  }

  getUploadUrl(fileId: string) {
    return this.s3.getSignedUrl("putObject", {
      Bucket: this.bucket,
      Key: fileId,
      Expires: this.uploadUrlExpiration,
    });
  }

  getDownloadUrl(fileId: string) {
    return this.s3.getSignedUrl("getObject", {
      Bucket: this.bucket,
      Key: fileId,
      Expires: this.downloadUrlExpiration,
    });
  }
}
