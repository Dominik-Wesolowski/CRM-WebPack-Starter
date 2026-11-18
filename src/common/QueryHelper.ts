export interface RecordQueryOptions {
  select?: string[];
  expand?: string[];
}

export interface QueryOptions extends RecordQueryOptions {
  filter?: string;
  top?: number;
  orderBy?: string[];
}

export class QueryHelper {
  public static build(options?: QueryOptions): string {
    if (!options) {
      return '';
    }

    const parts: string[] = [];

    if (options.select && options.select.length > 0) {
      parts.push(`$select=${encodeURIComponent(options.select.join(','))}`);
    }

    if (options.filter) {
      parts.push(`$filter=${encodeURIComponent(options.filter)}`);
    }

    if (options.expand && options.expand.length > 0) {
      parts.push(`$expand=${encodeURIComponent(options.expand.join(','))}`);
    }

    if (options.top !== undefined) {
      if (!Number.isSafeInteger(options.top) || options.top < 0) {
        throw new RangeError('$top must be a non-negative safe integer.');
      }
      parts.push(`$top=${options.top}`);
    }

    if (options.orderBy && options.orderBy.length > 0) {
      parts.push(`$orderby=${encodeURIComponent(options.orderBy.join(','))}`);
    }

    return parts.length > 0 ? `?${parts.join('&')}` : '';
  }

  public static select(...columns: string[]): string {
    return this.build({ select: columns });
  }

  public static byId(id: string, select?: string[]): string {
    const cleanId = id.replace(/[{}]/g, '');
    const query = this.build({ select });
    return `(${cleanId})${query}`;
  }

  public static filterEquals(field: string, value: string | number | boolean): string {
    if (typeof value === 'string') {
      const escaped = value.replace(/'/g, "''");
      return `${field} eq '${escaped}'`;
    }

    if (typeof value === 'boolean') {
      return `${field} eq ${value.toString()}`;
    }

    return `${field} eq ${value}`;
  }

  public static and(...filters: Array<string | null | undefined>): string {
    const valid = filters.filter((x): x is string => Boolean(x && x.trim()));
    return valid.map((x) => `(${x})`).join(' and ');
  }

  public static or(...filters: Array<string | null | undefined>): string {
    const valid = filters.filter((x): x is string => Boolean(x && x.trim()));
    return valid.map((x) => `(${x})`).join(' or ');
  }

  public static async retrieve<T>(
    entityLogicalName: string,
    id: string,
    options?: RecordQueryOptions,
  ): Promise<T> {
    const cleanId = id.replace(/[{}]/g, '');
    const query = this.build({ select: options?.select, expand: options?.expand });

    const result = await Xrm.WebApi.retrieveRecord(entityLogicalName, cleanId, query);
    return result as T;
  }

  public static async retrieveMultiple<T>(
    entityLogicalName: string,
    options?: QueryOptions,
    maxPageSize?: number,
  ): Promise<Xrm.RetrieveMultipleResult<T>> {
    const query = this.build(options);

    return await Xrm.WebApi.retrieveMultipleRecords<T>(entityLogicalName, query, maxPageSize);
  }

  public static async retrieveNextPage<T>(
    entityLogicalName: string,
    nextLink: string,
    maxPageSize?: number,
  ): Promise<Xrm.RetrieveMultipleResult<T>> {
    const queryStart = nextLink.indexOf('?');
    if (queryStart < 0 || queryStart === nextLink.length - 1) {
      throw new Error('nextLink must contain the Dataverse paging query.');
    }

    return await Xrm.WebApi.retrieveMultipleRecords<T>(
      entityLogicalName,
      nextLink.slice(queryStart),
      maxPageSize,
    );
  }
}
