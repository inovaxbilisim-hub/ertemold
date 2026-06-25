

export function logSize<T>(name: string, data: T): T {
  if (process.env.NODE_ENV === 'development') {
    console.log(`${name} size:`, JSON.stringify(data).length);
  }
  return data;
}

export function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true';
  return fallback;
}
