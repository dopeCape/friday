import { Logger } from "@/types";
import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";
import { AppError } from "../errorHandler/appError";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command
} from "@aws-sdk/client-s3";
import env from "@/config/env.config";
export default class BlobService {
  private static instance: BlobService | null;
  private logger: Logger;
  private errorHandler: CentralErrorHandler;
  private client = new S3Client({
    endpoint: env.BUCKET_URI,
    credentials: {
      accessKeyId: env.BUCKET_ACCESS_KEY_ID,
      secretAccessKey: env.BUCKET_ACCESS_KEY_SECRET,
    },
    region: "global",
  });

  private constructor(logger: Logger) {
    this.logger = logger;
    this.errorHandler = new CentralErrorHandler(logger);
  }

  static getInstance(logger: Logger) {
    if (!this.instance) {
      this.instance = new BlobService(logger);
    }
    return this.instance;
  }

  private checkIfPathExists(path: string) {
    return fs.existsSync(path);
  }

  private async uploadFile(filePath: string, bucketName: string, s3Key: string) {
    return this.errorHandler.handleError(async () => {
      const fileContent = await fsPromises.readFile(filePath);

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: fileContent,
      });

      const result = await this.client.send(command);
      this.logger.info("File uploaded successfully", {
        filePath,
        s3Key,
        etag: result.ETag,
        versionId: result.VersionId
      });
      return result;
    }, {
      service: "BlobService",
      method: "uploadFile"
    });
  }

  private async uploadDirectory(dirPath: string, bucketName: string, s3Prefix: string = "") {
    return this.errorHandler.handleError(async () => {
      const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });
      const uploadPromises: Promise<any>[] = [];

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const s3Key = s3Prefix ? `${s3Prefix}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          // Recursively upload subdirectory
          const subDirPromise = this.uploadDirectory(fullPath, bucketName, s3Key);
          uploadPromises.push(subDirPromise);
        } else {
          // Upload file
          const filePromise = this.uploadFile(fullPath, bucketName, s3Key.replace(/\\/g, '/'));
          uploadPromises.push(filePromise);
        }
      }

      await Promise.all(uploadPromises);
    }, {
      service: "BlobService",
      method: "uploadDirectory"
    });
  }

  public async uploadFolder(localPath: string, bucketName: string, s3FolderPrefix?: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Starting folder upload to R2", { localPath, bucketName, s3FolderPrefix });

      if (!this.checkIfPathExists(localPath)) {
        throw new AppError(400, "Path does not exist", "PATH_DOES_NOT_EXISTS", { path: localPath });
      }

      const stats = await fsPromises.stat(localPath);
      if (!stats.isDirectory()) {
        throw new AppError(400, "Path is not a directory", "PATH_NOT_DIRECTORY", { path: localPath });
      }

      await this.uploadDirectory(localPath, bucketName, s3FolderPrefix);

      this.logger.info("Folder upload completed successfully", { localPath, bucketName });
      return { success: true, message: "Folder uploaded successfully" };
    }, {
      service: "BlobService",
      method: "uploadFolder"
    });
  }

  public async uploadSingleFile(filePath: string, bucketName: string, s3Key?: string) {
    return this.errorHandler.handleError(async () => {
      if (!this.checkIfPathExists(filePath)) {
        throw new AppError(400, "File does not exist", "FILE_DOES_NOT_EXISTS", { path: filePath });
      }

      const stats = await fsPromises.stat(filePath);
      if (!stats.isFile()) {
        throw new AppError(400, "Path is not a file", "PATH_NOT_FILE", { path: filePath });
      }

      const key = s3Key || path.basename(filePath);
      return await this.uploadFile(filePath, bucketName, key);
    }, {
      service: "BlobService",
      method: "uploadSingleFile"
    });
  }

  public async deleteObject(bucketName: string, key: string) {
    return this.errorHandler.handleError(async () => {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const result = await this.client.send(command);
      this.logger.info("Object deleted successfully", { bucketName, key, deleteMarker: result.DeleteMarker });
      return result;
    }, {
      service: "BlobService",
      method: "deleteObject"
    });
  }

  public async listObjects(bucketName: string, prefix?: string, maxKeys?: number) {
    return this.errorHandler.handleError(async () => {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys,
      });

      const result = await this.client.send(command);
      this.logger.info("Objects listed successfully", {
        bucketName,
        prefix,
        count: result.Contents?.length,
        isTruncated: result.IsTruncated
      });
      return result;
    }, {
      service: "BlobService",
      method: "listObjects"
    });
  }

  public async getObjectUrl(bucketName: string, key: string) {
    return this.errorHandler.handleError(async () => {
      // For public objects, you can construct the URL directly
      const objectUrl = `${env.BUCKET_URI}/${bucketName}/${key}`;
      this.logger.info("Object URL generated", { bucketName, key, url: objectUrl });
      return objectUrl;
    }, {
      service: "BlobService",
      method: "getObjectUrl"
    });
  }

  public async headObject(bucketName: string, key: string) {
    return this.errorHandler.handleError(async () => {
      const { HeadObjectCommand } = await import("@aws-sdk/client-s3");
      const command = new HeadObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const result = await this.client.send(command);
      this.logger.info("Object metadata retrieved", {
        bucketName,
        key,
        contentLength: result.ContentLength,
        lastModified: result.LastModified
      });
      return result;
    }, {
      service: "BlobService",
      method: "headObject"
    });
  }
}
