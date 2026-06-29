import { TabBar } from "@/components/student/TabBar";
import { GlobalCartBar } from "@/components/student/GlobalCartBar";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";
import { DesktopNav } from "@/components/student/DesktopNav";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DesktopNav />
      <div className="mx-auto min-h-dvh max-w-screen-xl w-full bg-surface-muted pb-24 md:px-6 md:pb-8">
        {children}
      </div>
      <GlobalCartBar />
      <TabBar />
      <PwaInstallBanner />
    </>
  );
}
