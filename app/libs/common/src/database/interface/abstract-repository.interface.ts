import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  RemoveOptions,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export interface AbstractRepositoryInterface<T> {
  findOne(options: FindOneOptions<T>): Promise<T>;
  find(options: FindManyOptions<T>): Promise<T[]>;
  create(data: DeepPartial<T>): T;
  save(data: DeepPartial<T>): Promise<T>;
  update(
    criteria: FindOptionsWhere<T>,
    data: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult>;
  delete(criteria: FindOptionsWhere<T>): Promise<DeleteResult>;
  findWithCount(options: FindManyOptions<T>): Promise<[T[], number]>;
  remove(entities: T[], options?: RemoveOptions): Promise<T[]>;
}
