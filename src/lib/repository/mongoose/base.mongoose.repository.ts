import { Model, FilterQuery, ProjectionType, UpdateQuery, PipelineStage, AnyBulkWriteOperation } from "mongoose"
import { CentralErrorHandler } from "../../errorHandler/centralErrorHandler"
import { MongoErrorHandler } from "../../errorHandler/mongooseErrorHandler"
import { BaseRepository, MongooseUpdateOpts, Logger, WithoutId } from "@/types"
export class MongooseBaseRepository<T> implements BaseRepository<T> {
  private model: Model<T>
  private logger: Logger;
  private errorHandler;
  private resourceName: string;
  constructor(logger: Logger, model: Model<T>, resourceName: string) {
    this.model = model
    this.errorHandler = new CentralErrorHandler(logger);
    this.errorHandler.registerHandler(new MongoErrorHandler())
    this.resourceName = resourceName
    this.logger = logger;
  }
  private getUpperCaseResourceName() {
    return this.resourceName.charAt(0).toUpperCase() + this.resourceName.slice(1);
  }
  public async get<P extends Partial<T> = T>(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
  ): Promise<P | null> {
    return this.errorHandler.handleError(async () => {
      this.logger.info(`Getting ${this.resourceName}`, {
        filter, projection
      });
      const data = await this.model.findOne(filter, projection).lean();
      this.logger.info(`Got ${this.resourceName}`, {
        data
      })
      return data as unknown as P;
    }, {
      method: `get${this.getUpperCaseResourceName()}`,
      service: `${this.getUpperCaseResourceName()}Model`,
    })
  }
  public async create(data: WithoutId<T>) {
    return this.errorHandler.handleError(async () => {
      this.logger.info(`Creating ${this.resourceName}`, {
        data
      });
      const createdData = await this.model.create(data)
      this.logger.info(`Created ${this.resourceName}`, {
        createdData
      })
      return createdData;
    }, {
      method: `create${this.getUpperCaseResourceName()}`,
      service: `${this.getUpperCaseResourceName()}Model`,
    })
  }
  public async update(filter: FilterQuery<T>, data: UpdateQuery<T>, opts?: MongooseUpdateOpts) {
    return this.errorHandler.handleError(async () => {
      this.logger.info(`Updating ${this.resourceName}`, {
        filter, data, opts
      });
      const updatedData = await this.model.findOneAndUpdate(filter, data, opts).lean()
      this.logger.info(`Updated ${this.resourceName}`, {
        updatedData
      })
      if (!updatedData) {
        return null;
      }
      return updatedData as T;
    }, {
      method: `update${this.getUpperCaseResourceName()}`,
      service: `${this.getUpperCaseResourceName()}Model`,
    })
  }
  public async delete(filter: FilterQuery<T>) {
    return this.errorHandler.handleError(async () => {
      this.logger.info(`Deleting ${this.resourceName}`, {
        filter
      });
      const deletedData = await this.model.findOneAndDelete(filter).lean();
      if (!deletedData) {
        this.logger.warn(`${this.resourceName} does not exists`, { filter });
        return null;
      }
      this.logger.info(`Deleted ${this.resourceName}`, {
        deletedData
      })
      return deletedData as T;
    }, {
      method: `delete${this.getUpperCaseResourceName()}`,
      service: `${this.getUpperCaseResourceName()}Model`,
    })
  }
  public async list<P extends Partial<T> = T>(filter: FilterQuery<T>, projection?: ProjectionType<T>) {
    return this.errorHandler.handleError(async () => {
      this.logger.info(`Listing ${this.resourceName}`, {
        filter, projection
      });
      const data = await this.model.find(filter, projection).lean()
      this.logger.info(`Listed ${this.resourceName}`, {
        data
      })
      return data as unknown as P[];
    }, {
      method: `list${this.getUpperCaseResourceName()}`,
      service: `${this.getUpperCaseResourceName()}Model`,
    })
  }
  public async createMany(data: T[]) {
    return this.errorHandler.handleError(async () => {
      this.logger.info(`Creating multiple ${this.resourceName}'s`, {
        data
      });
      const createdData = await this.model.insertMany(data)
      this.logger.info(`Created multiple ${this.resourceName}'s`, {
        createdData
      })
      return createdData;
    }, {
      method: `createMany${this.getUpperCaseResourceName()}s`,
      service: `${this.getUpperCaseResourceName()}Model`,
    })
  }
  public async deleteMany(filter: FilterQuery<T>) {
    return this.errorHandler.handleError(async () => {
      this.logger.info(`Deleting multiple ${this.resourceName}'s`, {
        filter
      });
      const deletedData = await this.model.deleteMany(filter).lean()
      this.logger.info(`Deleted multiple ${this.resourceName}'s`, {
        deletedData
      })
      return { count: deletedData.deletedCount || 0 };
    }, {
      method: `deleteMany${this.getUpperCaseResourceName()}s`,
      service: `${this.getUpperCaseResourceName()}Model`,
    })
  }

  public async updateMany(filter: FilterQuery<T>, data: UpdateQuery<T>) {
    return this.errorHandler.handleError(async () => {
      this.logger.info(`Updating multiple ${this.resourceName}'s`, {
        filter, data
      });
      const updatedData = await this.model.updateMany(filter, data).lean()
      this.logger.info(`Updated multiple ${this.resourceName}'s`, {
        updatedData
      })
      return { count: updatedData.modifiedCount || 0 };
    }, {
      method: `updateMany${this.getUpperCaseResourceName()}s`,
      service: `${this.getUpperCaseResourceName()}Model`,
    })
  }

  public async bulkWrite(bulkWrites: AnyBulkWriteOperation[]) {
    return this.errorHandler.handleError(
      async () => {
        this.logger.info("Bulk writing to db", { bulkWrites });
        await this.model.bulkWrite(bulkWrites);
        this.logger.info("Bulk written to db");
      },
      {
        service: `${this.getUpperCaseResourceName()}Model`,
        method: "bulkWrite",
      },
    );
  }
  public async aggregate<K>(pipeline: PipelineStage[]): Promise<K[]> {
    return this.errorHandler.handleError(async () => {
      this.logger.info(`Aggregating ${this.resourceName}'s`, {
        pipeline
      });
      const data = await this.model.aggregate(pipeline)
      this.logger.info(`Aggregated ${this.resourceName}'s`, {
        data
      })
      return data;
    }, {
      method: `aggregate${this.getUpperCaseResourceName()}s`,
      service: `${this.getUpperCaseResourceName()}Model`,
    })
  }
}
