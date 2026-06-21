import Header from '@/components/restaurant/Header';
import Hero from '@/components/restaurant/Hero';
import MenuSection from '@/components/restaurant/MenuSection';
import EventiSection from '@/components/restaurant/EventiSection';
import ChiSiamo from '@/components/restaurant/ChiSiamo';
import ReservationDialog from '@/components/restaurant/ReservationDialog';
import Footer from '@/components/restaurant/Footer';
import CookieBanner from '@/components/restaurant/CookieBanner';
import AdminPanel from '@/components/restaurant/AdminPanel';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <MenuSection />
        <EventiSection />
        <ChiSiamo />
        <ReservationDialog />
      </main>
      <Footer />
      <CookieBanner />
      <AdminPanel />
    </div>
  );
}