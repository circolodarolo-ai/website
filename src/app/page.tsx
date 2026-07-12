import Header from '@/components/restaurant/Header';
import Hero from '@/components/restaurant/Hero';
import ChiSiamo from '@/components/restaurant/ChiSiamo';
import SpecialitaCarousel from '@/components/restaurant/SpecialitaCarousel';
import EventiSection from '@/components/restaurant/EventiSection';
import ReservationDialog from '@/components/restaurant/ReservationDialog';
import Footer from '@/components/restaurant/Footer';
import SocialSidebar from '@/components/restaurant/SocialSidebar';
import AdminPanelLoader from '@/components/admin/AdminPanelLoader';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <ChiSiamo />
        <SpecialitaCarousel />
        <EventiSection />
        <ReservationDialog />
      </main>
      <Footer />
      <SocialSidebar />
      <AdminPanelLoader />
    </div>
  );
}