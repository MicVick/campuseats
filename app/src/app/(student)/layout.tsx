import { TabBar } from "@/components/student/TabBar";
import { GlobalCartBar } from "@/components/student/GlobalCartBar";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mx-auto min-h-dvh max-w-md bg-surface-muted pb-24">
        {children}
      </div>
      <GlobalCartBar />
      <TabBar />
      <PwaInstallBanner />
    </>
  );
}
