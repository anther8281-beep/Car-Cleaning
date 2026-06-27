import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getSettings } from "@/lib/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar businessName={settings.businessName} logoUrl={settings.logoUrl} />
      <div className="flex-1">{children}</div>
      <Footer settings={settings} />
    </div>
  );
}
