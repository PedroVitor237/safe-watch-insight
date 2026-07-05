export interface RepositoryDelegate<
  TEntity,
  TCreateInput,
  TUpdateInput,
  TWhereUniqueInput,
  TFindManyArgs,
  TCountArgs,
> {
  create(args: { data: TCreateInput }): Promise<TEntity>;
  update(args: { where: TWhereUniqueInput; data: TUpdateInput }): Promise<TEntity>;
  delete(args: { where: TWhereUniqueInput }): Promise<TEntity>;
  findUnique(args: { where: TWhereUniqueInput }): Promise<TEntity | null>;
  findMany(args?: TFindManyArgs): Promise<TEntity[]>;
  count(args?: TCountArgs): Promise<number>;
}

export abstract class BaseRepository<
  TEntity,
  TCreateInput,
  TUpdateInput,
  TWhereUniqueInput,
  TFindManyArgs,
  TCountArgs,
> {
  protected constructor(
    protected readonly delegate: RepositoryDelegate<
      TEntity,
      TCreateInput,
      TUpdateInput,
      TWhereUniqueInput,
      TFindManyArgs,
      TCountArgs
    >,
  ) {}

  create(data: TCreateInput): Promise<TEntity> {
    return this.delegate.create({ data });
  }

  update(where: TWhereUniqueInput, data: TUpdateInput): Promise<TEntity> {
    return this.delegate.update({ where, data });
  }

  delete(where: TWhereUniqueInput): Promise<TEntity> {
    return this.delegate.delete({ where });
  }

  findById(where: TWhereUniqueInput): Promise<TEntity | null> {
    return this.delegate.findUnique({ where });
  }

  findMany(args?: TFindManyArgs): Promise<TEntity[]> {
    return this.delegate.findMany(args);
  }

  count(args?: TCountArgs): Promise<number> {
    return this.delegate.count(args);
  }
}

