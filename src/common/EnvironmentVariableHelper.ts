type EnvironmentVariableValue = string | null;

interface EnvironmentVariableDefinitionResult {
  environmentvariabledefinitionid: string;
  schemaname: string;
  defaultvalue?: string | null;
}

interface EnvironmentVariableValueResult {
  value?: string | null;
}

export class EnvironmentVariableHelper {
  private static readonly cache = new Map<string, EnvironmentVariableValue>();

  public static clearCache(schemaName?: string): void {
    if (schemaName) {
      this.cache.delete(schemaName);
      return;
    }

    this.cache.clear();
  }

  public static async getValue(schemaName: string): Promise<string | null> {
    if (this.cache.has(schemaName)) {
      return this.cache.get(schemaName) ?? null;
    }

    const escapedSchemaName = schemaName.replace(/'/g, "''");

    const definitions =
      await Xrm.WebApi.retrieveMultipleRecords<EnvironmentVariableDefinitionResult>(
        'environmentvariabledefinition',
        [
          '?$select=environmentvariabledefinitionid,schemaname,defaultvalue',
          `&$filter=schemaname eq '${escapedSchemaName}'`,
          '&$top=1',
        ].join(''),
      );

    const definition = definitions.entities[0];
    if (!definition) {
      this.cache.set(schemaName, null);
      return null;
    }

    const values = await Xrm.WebApi.retrieveMultipleRecords<EnvironmentVariableValueResult>(
      'environmentvariablevalue',
      [
        '?$select=value',
        `&$filter=_environmentvariabledefinitionid_value eq ${definition.environmentvariabledefinitionid}`,
        '&$top=1',
      ].join(''),
    );

    const currentValue = values.entities[0]?.value ?? null;
    const finalValue = currentValue ?? definition.defaultvalue ?? null;

    this.cache.set(schemaName, finalValue);
    return finalValue;
  }

  public static async getRequiredValue(schemaName: string): Promise<string> {
    const value = await this.getValue(schemaName);

    if (value === null || value.trim().length === 0) {
      throw new Error(`Environment variable '${schemaName}' was not found or has no value.`);
    }

    return value;
  }

  public static async getJsonValue<T>(schemaName: string): Promise<T | null> {
    const value = await this.getValue(schemaName);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  }

  public static async getRequiredJsonValue<T>(schemaName: string): Promise<T> {
    const value = await this.getRequiredValue(schemaName);
    return JSON.parse(value) as T;
  }

  public static async getBooleanValue(schemaName: string): Promise<boolean | null> {
    const value = await this.getValue(schemaName);

    if (!value) {
      return null;
    }

    const normalized = value.trim().toLowerCase();

    if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
      return true;
    }

    if (normalized === 'false' || normalized === '0' || normalized === 'no') {
      return false;
    }

    throw new Error(`Environment variable '${schemaName}' does not contain a valid boolean value.`);
  }

  public static async getNumberValue(schemaName: string): Promise<number | null> {
    const value = await this.getValue(schemaName);

    if (!value) {
      return null;
    }

    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
      throw new Error(`Environment variable '${schemaName}' does not contain a valid number.`);
    }

    return parsed;
  }
}
