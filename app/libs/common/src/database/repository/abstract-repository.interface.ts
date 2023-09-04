import {
  DeepPartial,
  FindOneOptions,
  FindManyOptions,
  Repository,
  UpdateResult,
  FindOptionsWhere,
  DeleteResult,
  RemoveOptions,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { AbstractRepositoryInterface } from '../interface/abstract-repository.interface';

export abstract class AbstractRepository<T>
  implements AbstractRepositoryInterface<T>
{
  private entity: Repository<T>;
  protected constructor(entity: Repository<T>) {
    this.entity = entity;
  }

  public async remove(entities: T[], options?: RemoveOptions): Promise<T[]> {
    return await this.entity.remove(entities, options);
  }
  public async findWithCount(
    options: FindManyOptions<T>,
  ): Promise<[T[], number]> {
    const data = await this.entity.findAndCount(options);
    return data;
  }

  public async findOne(options: FindOneOptions<T>): Promise<T> {
    const data = await this.entity.findOne(options);
    return data;
  }

  public async find(options: FindManyOptions<T>): Promise<T[]> {
    const data = await this.entity.find(options);
    return data;
  }

  public create(data: DeepPartial<T>): T {
    return this.entity.create(data);
  }
  public async save(data: DeepPartial<T>): Promise<T> {
    return this.entity.save(data);
  }

  public async delete(criteria: FindOptionsWhere<T>): Promise<DeleteResult> {
    return await this.entity.delete(criteria);
  }

  public async update(
    criteria: FindOptionsWhere<T>,
    data: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    return await this.entity.update(criteria, data);
  }
}
