export function validOptionalLastmod(value) {
  if (value === undefined) return true;
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)) return false;
  const day = value.slice(0, 10);
  const date = new Date(`${day}T00:00:00Z`);
  return Number.isFinite(new Date(value).getTime()) && Number.isFinite(date.getTime())
    && date.toISOString().slice(0, 10) === day;
}
