type EnvironmentVariableValue = string | null;

export class EnvironmentVariableHelper {
  private static readonly cache = new Map<string, Promise<EnvironmentVariableValue>>();

  public static clearCache(schemaName?: string): void {
    if (schemaName) {
      this.cache.delete(schemaName);
      return;
    }

    this.cache.clear();
  }

  public static getValue(schemaName: string): Promise<string | null> {
    const cached = this.cache.get(schemaName);
    if (cached) return cached;

    const request = this.fetchValue(schemaName).catch((error: unknown) => {
      if (this.cache.get(schemaName) === request) this.cache.delete(schemaName);
      throw error;
    });
    this.cache.set(schemaName, request);
    return request;
  }

  private static async fetchValue(schemaName: string): Promise<EnvironmentVariableValue> {
    const response = await Xrm.WebApi.online.execute({
      DefinitionSchemaName: schemaName,
      getMetadata: () => ({
        boundParameter: null,
        operationName: 'RetrieveEnvironmentVariableValue',
        operationType: 1, // Web API function.
        parameterTypes: {
          DefinitionSchemaName: { typeName: 'Edm.String', structuralProperty: 1 },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Could not read environment variable '${schemaName}' (HTTP ${response.status}).`);
    }

    const { Value } = await response.json() as { Value?: string | null };
    return Value ?? null;
  }

  public static async getRequiredValue(schemaName: string): Promise<string> {
    const value = await this.getValue(schemaName);

    if (value === null || value.trim().length === 0) {
      throw new Error(`Environment variable '${schemaName}' was not found or has no value.`);
    }

    return value;
  }

  /** Parses JSON. The caller supplies its TypeScript type and can validate its shape. */
  public static async getJsonValue<T>(schemaName: string): Promise<T | null> {
    const value = await this.getValue(schemaName);

    if (!value?.trim()) {
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

    if (!value?.trim()) {
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

    if (!value?.trim()) {
      return null;
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      throw new Error(`Environment variable '${schemaName}' does not contain a valid number.`);
    }

    return parsed;
  }
}
