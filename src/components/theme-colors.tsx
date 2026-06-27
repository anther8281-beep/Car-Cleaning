import { getSettings } from "@/lib/settings";
import { safeHexColor } from "@/lib/color";

/**
 * Injects the admin-configured brand colors as CSS custom properties on :root,
 * overriding the defaults in globals.css. Rendered inside layouts that read
 * from the database (public + admin), so color changes apply immediately
 * without a redeploy.
 */
export async function ThemeColors() {
  const settings = await getSettings();
  const primary = safeHexColor(settings.primaryColor, "#1a2e5a");
  const secondary = safeHexColor(settings.secondaryColor, "#c9a84c");

  return (
    <style>{`:root{--primary:${primary};--secondary:${secondary};}`}</style>
  );
}
