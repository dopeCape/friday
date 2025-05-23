import { AnyBulkWriteOperation, FilterQuery, PipelineStage, ProjectionType, UpdateQuery } from "mongoose"
import { WithoutId } from "../utils.type";
export type DeleteManyResult = {
  count: number
}
export type UpdateManyResult = {
  count: number;
}
export type Aggregate = PipelineStage[]
export type BulkWrites = AnyBulkWriteOperation[];


export type UpdateOpts = MongooseUpdateOpts | Record<string, any>;
export type MongooseUpdateOpts = {
  new: boolean
}
export type Filter<T> = FilterQuery<T> | Record<string, any>
export type Projection<T> = ProjectionType<T> | Record<string, any>
export type Update<T> = UpdateQuery<T> | Record<any, any>;
export interface BaseRepository<T> {
  get<P extends Partial<T> = T>(
    filter: Filter<T>,
    projection?: Projection<T>,
  ): Promise<P | null>;
  create(data: WithoutId<T>): Promise<T>;
  update(filter: Filter<T>, update: Update<T>, opts?: UpdateOpts): Promise<T | null>;
  delete(filter: Filter<T>): Promise<T | null>;
  list<P extends Partial<T> = T>(filter: Filter<T>, projection?: Projection<T>): Promise<P[]>;
  createMany(data: T[]): Promise<T[]>;
  deleteMany(filter: Filter<T>): Promise<DeleteManyResult>
  updateMany(filter: Filter<T>, update: Update<T>): Promise<UpdateManyResult>
  bulkWrite(bulkWrites: BulkWrites): void
  aggregate<K>(pipeline: Aggregate): Promise<K[]>
}



