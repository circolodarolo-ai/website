import Header from '@/components/restaurant/Header';
import Hero from '@/components/restaurant/Hero';
import ChiSiamo from '@/components/restaurant/ChiSiamo';
import SpecialitaCarousel from '@/components/restaurant/SpecialitaCarousel';
import EventiSection from '@/components/restaurant/EventiSection';
import ReservationDialog from '@/components/restaurant/ReservationDialog';
import Footer from '@/components/restaurant/Footer';
import SocialSidebar from '@/components/restaurant/SocialSidebar';
import AdminPanelLoader from '@/components/admin/AdminPanelLoader';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <ErrorBoundary>
        <Header />
      </ErrorBoundary>
      <main className="flex-1">
        <ErrorBoundary>
          <Hero />
        </ErrorBoundary>
        <ErrorBoundary>
          <ChiSiamo />
        </ErrorBoundary>
        <ErrorBoundary>
          <SpecialitaCarousel />
        </ErrorBoundary>
        <ErrorBoundary>
          <EventiSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <ReservationDialog />
        </ErrorBoundary>
      </main>
      <ErrorBoundary>
        <Footer />
      </ErrorBoundary>
      <ErrorBoundary>
        <SocialSidebar />
      </ErrorBoundary>
      <AdminPanelLoader />
    </div>
  );
}