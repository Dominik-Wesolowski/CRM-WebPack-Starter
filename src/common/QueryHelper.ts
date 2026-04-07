export interface QueryOptions {
  select?: string[];
  filter?: string;
  expand?: string[];
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
      parts.push(`$select=${options.select.join(',')}`);
    }

    if (options.filter) {
      parts.push(`$filter=${options.filter}`);
    }

    if (options.expand && options.expand.length > 0) {
      parts.push(`$expand=${options.expand.join(',')}`);
    }

    if (typeof options.top === 'number') {
      parts.push(`$top=${options.top}`);
    }

    if (options.orderBy && options.orderBy.length > 0) {
      parts.push(`$orderby=${options.orderBy.join(',')}`);
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
    options?: QueryOptions,
  ): Promise<T> {
    const cleanId = id.replace(/[{}]/g, '');
    const query = this.build(options);

    const result = await Xrm.WebApi.retrieveRecord(entityLogicalName, cleanId, query);
    return result as T;
  }

  public static async retrieveMultiple<T>(
    entityLogicalName: string,
    options?: QueryOptions,
  ): Promise<Xrm.RetrieveMultipleResult<T>> {
    const query = this.build(options);

    const result = await Xrm.WebApi.retrieveMultipleRecords(entityLogicalName, query);
    return result as Xrm.RetrieveMultipleResult<T>;
  }
}
