const validTag = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0 && value.length <= 100 && !/[\u0000-\u001f\u007f]/.test(value);

export const isAttribution = (value: unknown): value is { company: string; role: string } =>
  value !== null &&
  typeof value === "object" &&
  "company" in value &&
  "role" in value &&
  validTag(value.company) &&
  validTag(value.role);
