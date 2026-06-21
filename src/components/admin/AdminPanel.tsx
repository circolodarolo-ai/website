'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Settings, X, Menu, UtensilsCrossed, PartyPopper, Palette, FileText, Map, Building2, ShieldCheck, CalendarDays, Users } from 'lucide-react';
import LoginDialog from './LoginDialog';
import AdminMenu from './AdminMenu';
import AdminTheme from './AdminTheme';
import AdminSiteInfo from './AdminSiteInfo';
import AdminFooter from './AdminFooter';
import AdminCompanyData from './AdminCompanyData';
import AdminEventi from './AdminEventi';
import AdminPrenotazioni from './AdminPrenotazioni';
import AdminUsers from './AdminUsers';

type Section = 'menu' | 'eventi' | 'temi' | 'site-info' | 'footer' | 'company-data' | 'cookie-privacy' | 'prenotazioni' | 'users';

interface NavItem {
  id: Section;
  label: string;
  icon: React.ReactNode;
  group: string;
  permission?: string;
}

const navItems: NavItem[] = [
  { id: 'menu', label: 'Menu', icon: <UtensilsCrossed className="h-5 w-5" />, group: 'CONTENUTI', permission: 'puoGestireMenu' },
  { id: 'eventi', label: 'Eventi', icon: <PartyPopper className="h-5 w-5" />, group: 'CONTENUTI', permission: 'puoGestireEventi' },
  { id: 'temi', label: 'Temi e Personalizzazioni', icon: <Palette className="h-5 w-5" />, group: 'ASPETTO', permission: 'puoGestireTemi' },
  { id: 'site-info', label: 'Info Sito e SEO', icon: <FileText className="h-5 w-5" />, group: 'ASPETTO', permission: 'puoGestireSito' },
  { id: 'footer', label: 'Footer', icon: <Map className="h-5 w-5" />, group: 'ASPETTO', permission: 'puoGestireFooter' },
  { id: 'company-data', label: 'Dati Azienda', icon: <Building2 className="h-5 w-5" />, group: 'AZIENDA', permission: 'puoGestireDatiAzienda' },
  { id: 'cookie-privacy', label: 'Cookie e Privacy', icon: <ShieldCheck className="h-5 w-5" />, group: 'AZIENDA', permission: 'puoGestireDatiAzienda' },
  { id: 'prenotazioni', label: 'Prenotazioni', icon: <CalendarDays className="h-5 w-5" />, group: 'GESTIONE', permission: 'puoGestirePrenotazioni' },
  { id: 'users', label: 'Profili Utenti', icon: <Users className="h-5 w-5" />, group: 'GESTIONE', permission: 'puoGestireProfili' },
];

export default function AdminPanel() {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean> | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('menu');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      fetchMe(savedToken);
    }
  }, []);

  const fetchMe = useCallback(async (t: string) => {
    try {
      const res = await fetch('/api/admin/me', {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) {
        localStorage.removeItem('admin_token');
        setToken(null);
        setUserPermissions(null);
        return;
      }
      const data = await res.json();
      setUserPermissions(data.permessi ? {
        puoGestireMenu: data.permessi.puoGestireMenu,
        puoGestireFooter: data.permessi.puoGestireFooter,
        puoGestireTemi: data.permessi.puoGestireTemi,
        puoGestirePrenotazioni: data.permessi.puoGestirePrenotazioni,
        puoGestireDatiAzienda: data.permessi.puoGestireDatiAzienda,
        puoGestireProfili: data.permessi.puoGestireProfili,
        puoGestireAnalytics: data.permessi.puoGestireAnalytics,
        puoGestireSito: data.permessi.puoGestireSito,
        puoGestireEventi: data.permessi.puoGestireEventi,
      } : null);
    } catch {
      console.error('Failed to fetch user');
    }
  }, []);

  const handleOpenAdmin = () => {
    if (token) {
      setOpen(true);
    } else {
      setLoginOpen(true);
    }
  };

  const handleLoginSuccess = (newToken: string) => {
    setToken(newToken);
    fetchMe(newToken);
    setOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setUserPermissions(null);
    setOpen(false);
    toast.success('Disconnesso con successo');
  };

  const hasPermission = (permission?: string) => {
    if (!permission) return true;
    if (!userPermissions) return false;
    return userPermissions[permission] === true;
  };

  const handleNavClick = (id: Section) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'menu': return <AdminMenu />;
      case 'eventi': return <AdminEventi />;
      case 'temi': return <AdminTheme />;
      case 'site-info': return <AdminSiteInfo />;
      case 'footer': return <AdminFooter />;
      case 'company-data': return <AdminCompanyData />;
      case 'cookie-privacy': return <AdminCompanyData initialTab="cookie" />;
      case 'prenotazioni': return <AdminPrenotazioni />;
      case 'users': return <AdminUsers />;
      default: return <AdminMenu />;
    }
  };

  const groups = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <>
      {/* Floating Settings Button */}
      {!open && (
        <button
          onClick={handleOpenAdmin}
          className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
          aria-label="Apri Pannello Admin"
        >
          <Settings className="h-6 w-6" />
        </button>
      )}

      {/* Login Dialog */}
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} onLoginSuccess={handleLoginSuccess} />

      {/* Full-Page Overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 flex">
          {/* Mobile Header */}
          <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1">
                <Menu className="h-5 w-5" />
              </button>
              <span className="font-semibold">Admin Panel</span>
            </div>
            <button onClick={() => setOpen(false)} className="p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Sidebar Overlay */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          )}

          {/* Sidebar */}
          <aside className={cn(
            "bg-gray-900 text-white flex flex-col transition-all duration-300 z-50",
            "lg:relative lg:translate-x-0",
            mobileMenuOpen ? "fixed left-0 top-0 bottom-0 w-72 translate-x-0" : "fixed -translate-x-full lg:translate-x-0 w-0 lg:w-72"
          )}>
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700 min-h-[56px]">
              <span className="font-bold text-lg">🍽️ Admin</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white h-8 w-8 hidden lg:flex"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <button onClick={() => setOpen(false)} className="p-1 text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <nav className="px-3 py-2">
                {Object.entries(groups).map(([group, items]) => (
                  <div key={group} className="mb-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {group}
                    </div>
                    {items.filter(item => hasPermission(item.permission)).map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-0.5",
                          activeSection === item.id
                            ? "bg-red-600 text-white"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        )}
                      >
                        {item.icon}
                        <span className="truncate">{item.label}</span>
                      </button>
                    ))}
                    <Separator className="my-2 bg-gray-700/50" />
                  </div>
                ))}
              </nav>
            </ScrollArea>

            <div className="border-t border-gray-700 p-3">
              <Button
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 bg-white flex flex-col min-h-screen lg:min-h-0">
            <div className="flex-1 overflow-auto pt-14 lg:pt-0">
              <div className="max-w-7xl mx-auto p-4 lg:p-8">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
