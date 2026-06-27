// Validate a user-supplied CSS hex color (#rgb, #rrggbb, #rrggbbaa). Returns
// the normalized color or the fallback. Prevents CSS injection when admin
// colors are interpolated into a <style> tag.
export function safeHexColor(value: string, fallback: string): string {
  const v = value.trim();
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v)
    ? v
    : fallback;
}
