export class ValidationHelper {
  public static hasValue<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
  }

  public static isNullOrWhiteSpace(value: string | null | undefined): boolean {
    return !value || value.trim().length === 0;
  }

  public static hasLookupValue(value: Xrm.LookupValue[] | null | undefined): boolean {
    return Array.isArray(value) && value.length > 0;
  }

  public static maxLengthExceeded(value: string | null | undefined, maxLength: number): boolean {
    if (!value) {
      return false;
    }

    return value.length > maxLength;
  }

  public static minLengthNotMet(value: string | null | undefined, minLength: number): boolean {
    if (!value) {
      return true;
    }

    return value.trim().length < minLength;
  }

  public static isPhoneLikelyValid(value: string | null | undefined): boolean {
    if (this.isNullOrWhiteSpace(value) || !value) {
      return false;
    }

    const normalized = value.replace(/[^\d+]/g, '');
    return normalized.length >= 7;
  }

  public static isEmailLikelyValid(value: string | null | undefined): boolean {
    if (this.isNullOrWhiteSpace(value) || !value) {
      return false;
    }

    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value.trim());
  }
}
