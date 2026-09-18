import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import BottomNav from "@/components/layout/BottomNav";
import "../globals.css";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      {children}
      <Footer />
      {/* Space for the floating bottom nav on phones/tablets */}
      <div aria-hidden className="h-[calc(5.5rem+env(safe-area-inset-bottom))] bg-ink lg:hidden" />
      <BottomNav />
    </>
  );
}
