'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, Globe, Monitor, Clock, MapPin, Smartphone, FileText, ArrowUpRight, ArrowDownRight,
  Users, Activity, Eye, Timer, Layers, ExternalLink, Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import {
  BarChart, Bar, PieChart as RPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Area, AreaChart,
} from 'recharts';

// --- Types ---
type InsightTab = 'overview' | 'geo' | 'pages' | 'referrers' | 'devices' | 'sessions' | 'events';

interface OverviewData {
  dailyVisits: Array<{ date: string; label: string; visits: number; uniqueVisitors: number }>;
  totalVisits: number;
  uniqueVisitors: number;
  avgDuration: number;
  todayVisits: number;
  yesterdayVisits: number;
  dailyChange: number;
  topPages: Array<{ page: string; count: number }>;
  hourlyData: Array<{ hour: number; label: string; visits: number }>;
  daysRange: number;
}

interface GeoData {
  countries: Array<{ name: string; count: number }>;
  cities: Array<{ city: string; country: string; count: number }>;
  totalWithGeo: number;
  totalAll: number;
}

interface PageData {
  pages: Array<{ page: string; visits: number; avgDuration: number; label: string }>;
}

interface ReferrerData {
  sources: Array<{ name: string; count: number; percentage: number }>;
  total: number;
}

interface DeviceData {
  devices: Array<{ name: string; count: number }>;
  browsers: Array<{ name: string; count: number }>;
  os: Array<{ name: string; count: number }>;
}

interface SessionData {
  depthData: Array<{ name: string; count: number }>;
  bounceRate: number;
  totalSessions: number;
  durationData: Array<{ name: string; count: number }>;
}

interface AnalyticsEventRow {
  id: string;
  sessionId: string;
  eventType: string;
  pageUrl: string;
  productId: string | null;
  duration: number | null;
  referrer: string | null;
  country: string | null;
  city: string | null;
  timestamp: string;
}

const TABS: { id: InsightTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Panoramica', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'geo', label: 'Geolocalizzazione', icon: <Globe className="h-4 w-4" /> },
  { id: 'pages', label: 'Pagine', icon: <FileText className="h-4 w-4" /> },
  { id: 'referrers', label: 'Sorgenti', icon: <ExternalLink className="h-4 w-4" /> },
  { id: 'devices', label: 'Dispositivi', icon: <Smartphone className="h-4 w-4" /> },
  { id: 'sessions', label: 'Sessioni', icon: <Users className="h-4 w-4" /> },
  { id: 'events', label: 'Log Eventi', icon: <Activity className="h-4 w-4" /> },
];

// --- Colors ---
const CHART_COLORS = ['#ea580c', '#0d9488', '#6366f1', '#eab308', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e', '#3b82f6', '#22c55e', '#f97316', '#a855f7'];
const PIE_COLORS = ['#ea580c', '#0d9488', '#6366f1', '#eab308', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e'];

const overviewConfig = {
  visits: { label: 'Visite', color: '#ea580c' },
  uniqueVisitors: { label: 'Visitatori Unici', color: '#0d9488' },
} satisfies ChartConfig;

const hourlyConfig = {
  visits: { label: 'Visite', color: '#ea580c' },
} satisfies ChartConfig;

const geoConfig = {
  count: { label: 'Visite', color: '#ea580c' },
} satisfies ChartConfig;

const pagesConfig = {
  visits: { label: 'Visite', color: '#ea580c' },
} satisfies ChartConfig;

const pieSourceConfig = {
  count: { label: 'Visite', color: '#0d9488' },
} satisfies ChartConfig;

export default function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState<InsightTab>('overview');
  const [days, setDays] = useState('30');
  const [loading, setLoading] = useState(true);

  // Data states
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [geo, setGeo] = useState<GeoData | null>(null);
  const [pages, setPages] = useState<PageData | null>(null);
  const [referrers, setReferrers] = useState<ReferrerData | null>(null);
  const [devices, setDevices] = useState<DeviceData | null>(null);
  const [sessions, setSessions] = useState<SessionData | null>(null);
  const [events, setEvents] = useState<AnalyticsEventRow[]>([]);
  const [eventsTotal, setEventsTotal] = useState(0);
  const [eventsPage, setEventsPage] = useState(1);
  const [deleteStatus, setDeleteStatus] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchInsight = useCallback(async (insight: InsightTab) => {
    if (insight === 'events') return; // handled separately
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics/insights?insight=${insight}&days=${days}`);
      if (!res.ok) {
        console.error(`[AdminAnalytics] insight=${insight} returned status ${res.status}`);
        setLoading(false);
        return;
      }
      const json = await res.json();
      // Guard: don't store error responses as valid data
      if (json.error) {
        console.error(`[AdminAnalytics] API error for ${insight}:`, json.error);
        setLoading(false);
        return;
      }
      switch (insight) {
        case 'overview': setOverview(json); break;
        case 'geo': setGeo(json); break;
        case 'pages': setPages(json); break;
        case 'referrers': setReferrers(json); break;
        case 'devices': setDevices(json); break;
        case 'sessions': setSessions(json); break;
      }
    } catch (e) {
      console.error('Insight fetch error:', e);
    }
    setLoading(false);
  }, [days]);

  const fetchEvents = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const params = new URLSearchParams({
        range: 'events',
        page: page.toString(),
        limit: '50',
        startDate: daysAgo.toISOString().split('T')[0],
        endDate: tomorrow.toISOString().split('T')[0],
      });
      const res = await fetch(`/api/admin/analytics?${params}`);
      if (!res.ok) {
        console.error(`[AdminAnalytics] events returned status ${res.status}`);
        setLoading(false);
        return;
      }
      const json = await res.json();
      setEvents(json.data || []);
      setEventsTotal(json.total || 0);
    } catch {
      console.error('Events fetch error');
    }
    setLoading(false);
  }, [days]);

  useEffect(() => {
    if (activeTab === 'events') {
      fetchEvents(eventsPage);
    } else {
      fetchInsight(activeTab);
    }
  }, [activeTab, fetchInsight, fetchEvents, eventsPage]);

  const handleDaysChange = (newDays: string) => {
    setDays(newDays);
    setEventsPage(1);
  };

  const handleDeleteData = async () => {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));
    const startDate = daysAgo.toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];
    try {
      setDeleteStatus('Cancellazione in corso...');
      const res = await fetch(`/api/admin/analytics/delete?startDate=${startDate}&endDate=${endDate}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok) {
        setDeleteStatus(`${json.message}`);
        setShowDeleteConfirm(false);
        fetchInsight(activeTab);
      } else {
        setDeleteStatus(`Errore: ${json.error}`);
      }
      setTimeout(() => setDeleteStatus(''), 5000);
    } catch {
      setDeleteStatus('Errore di connessione');
      setTimeout(() => setDeleteStatus(''), 5000);
    }
  };

  const fmtDuration = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    return `${Math.floor(sec / 60)}m ${sec % 60}s`;
  };

  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return d; }
  };
  const fmtDateTime = (d: string) => {
    try { return new Date(d).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return d; }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" /> Analytics
        </h2>
        <div className="flex items-center gap-3">
          <Label className="text-xs text-gray-500 whitespace-nowrap">Periodo:</Label>
          <select
            value={days}
            onChange={e => handleDaysChange(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm bg-white"
          >
            <option value="7">Ultimi 7 giorni</option>
            <option value="14">Ultimi 14 giorni</option>
            <option value="30">Ultimi 30 giorni</option>
            <option value="90">Ultimi 90 giorni</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 ml-2"
            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Cancella Dati
          </Button>
        </div>
      </div>

      {deleteStatus && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          {deleteStatus}
        </div>
      )}

      {showDeleteConfirm && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 mb-3">
            Sei sicuro di voler cancellare <strong>tutti i dati analytics degli ultimi {days} giorni</strong>?
            Questa azione e irreversibile (GDPR Art. 17).
          </p>
          <div className="flex gap-2">
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteData}>
              Conferma Cancellazione
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Annulla
            </Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={v => { setActiveTab(v as InsightTab); setEventsPage(1); }}>
        <TabsList className="mb-6 flex flex-wrap h-auto gap-1 bg-gray-100 p-1 rounded-xl">
          {TABS.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1.5 text-xs px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
              {tab.icon} {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ===== OVERVIEW ===== */}
        <TabsContent value="overview">
          {!overview ? (loading ? <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i=><SkeletonCard key={i}/>)}</div> : <NoData />) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1"><Eye className="h-4 w-4" /> Visite Totali</div>
                    <p className="text-2xl font-bold">{overview.totalVisits.toLocaleString('it-IT')}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs">
                      {overview.dailyChange >= 0 ? (
                        <><ArrowUpRight className="h-3 w-3 text-green-600" /><span className="text-green-600">+{overview.dailyChange}% oggi</span></>
                      ) : (
                        <><ArrowDownRight className="h-3 w-3 text-red-600" /><span className="text-red-600">{overview.dailyChange}% oggi</span></>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1"><Users className="h-4 w-4" /> Visitatori Unici</div>
                    <p className="text-2xl font-bold">{overview.uniqueVisitors.toLocaleString('it-IT')}</p>
                    <p className="text-xs text-gray-400 mt-1">ultimi {overview.daysRange} giorni</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1"><Timer className="h-4 w-4" /> Durata Media</div>
                    <p className="text-2xl font-bold">{fmtDuration(overview.avgDuration)}</p>
                    <p className="text-xs text-gray-400 mt-1">per sessione</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1"><Monitor className="h-4 w-4" /> Visite Oggi</div>
                    <p className="text-2xl font-bold">{overview.todayVisits.toLocaleString('it-IT')}</p>
                    <p className="text-xs text-gray-400 mt-1">ieri: {overview.yesterdayVisits}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Trend Chart */}
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Andamento Visite Giornaliere</CardTitle>
                  <CardDescription>Visite totali e visitatori unici per giorno</CardDescription>
                </CardHeader>
                <CardContent>
                  {overview.dailyVisits.length > 0 ? (
                    <ChartContainer config={overviewConfig} className="h-[280px] w-full">
                      <AreaChart data={overview.dailyVisits} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="fillVisits" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-visits)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--color-visits)" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="fillUnique" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-uniqueVisitors)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--color-uniqueVisitors)" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 11 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Area type="monotone" dataKey="visits" stroke="var(--color-visits)" fill="url(#fillVisits)" strokeWidth={2} />
                        <Area type="monotone" dataKey="uniqueVisitors" stroke="var(--color-uniqueVisitors)" fill="url(#fillUnique)" strokeWidth={2} />
                      </AreaChart>
                    </ChartContainer>
                  ) : <NoData />}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hourly Distribution */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Distribuzione Oraria</CardTitle>
                    <CardDescription>Visite per fascia oraria (media del periodo)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {overview.hourlyData.some(h => h.visits > 0) ? (
                      <ChartContainer config={hourlyConfig} className="h-[250px] w-full">
                        <BarChart data={overview.hourlyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={2} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="visits" fill="var(--color-visits)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ChartContainer>
                    ) : <NoData />}
                  </CardContent>
                </Card>

                {/* Top Pages Quick View */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Pagine Piu Visitate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {overview.topPages.length > 0 ? (
                      <div className="space-y-3">
                        {overview.topPages.map((p, i) => (
                          <div key={p.page} className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-xs font-bold text-gray-400 w-5">{i + 1}.</span>
                              <span className="text-sm truncate">{p.page}</span>
                            </div>
                            <Badge variant="secondary" className="shrink-0 font-mono">{p.count}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : <NoData />}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* ===== GEO ===== */}
        <TabsContent value="geo">
          {!geo ? (loading ? <SkeletonCard /> : <NoData />) : geo.countries.length === 0 ? <NoData /> : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500 mb-1">Visite con Geo-IP</div>
                    <p className="text-xl font-bold">{geo.totalWithGeo.toLocaleString('it-IT')}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500 mb-1">Visite senza Geo</div>
                    <p className="text-xl font-bold">{(geo.totalAll - geo.totalWithGeo).toLocaleString('it-IT')}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500 mb-1">Copertura Geo</div>
                    <p className="text-xl font-bold">{geo.totalAll > 0 ? Math.round((geo.totalWithGeo / geo.totalAll) * 100) : 0}%</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Countries Bar Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Visite per Paese</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={geoConfig} className="h-[300px] w-full">
                      <BarChart data={geo.countries.slice(0, 10)} layout="vertical" margin={{ top: 5, right: 10, left: 80, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={75} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Countries Table */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Dettaglio Paesi</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Paese</TableHead>
                          <TableHead className="text-right">Visite</TableHead>
                          <TableHead className="text-right">%</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {geo.countries.map(c => (
                          <TableRow key={c.name}>
                            <TableCell className="font-medium flex items-center gap-2">
                              <Globe className="h-3.5 w-3.5 text-gray-400" /> {c.name}
                            </TableCell>
                            <TableCell className="text-right font-mono">{c.count}</TableCell>
                            <TableCell className="text-right text-sm">{geo.totalWithGeo > 0 ? ((c.count / geo.totalWithGeo) * 100).toFixed(1) : 0}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Cities */}
              {geo.cities.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" /> Top Citta</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Citta</TableHead>
                          <TableHead>Paese</TableHead>
                          <TableHead className="text-right">Visite</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {geo.cities.map(c => (
                          <TableRow key={c.city + c.country}>
                            <TableCell className="font-medium flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-red-500" /> {c.city}
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">{c.country}</TableCell>
                            <TableCell className="text-right font-mono">{c.count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* ===== PAGES ===== */}
        <TabsContent value="pages">
          {!pages ? (loading ? <SkeletonCard /> : <NoData />) : pages.pages.length === 0 ? <NoData /> : (
            <>
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Pagine Piu Visitate</CardTitle>
                  <CardDescription>Classifica delle pagine per numero di visite</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={pagesConfig} className="h-[350px] w-full">
                    <BarChart data={pages.pages.slice(0, 12)} layout="vertical" margin={{ top: 5, right: 10, left: 100, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={95} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="visits" fill="var(--color-visits)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Dettaglio Pagine</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Pagina</TableHead>
                        <TableHead>Label</TableHead>
                        <TableHead className="text-right">Visite</TableHead>
                        <TableHead className="text-right">Durata Media</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pages.pages.map(p => (
                        <TableRow key={p.page}>
                          <TableCell className="font-mono text-xs text-gray-500">{p.page}</TableCell>
                          <TableCell className="font-medium">{p.label}</TableCell>
                          <TableCell className="text-right font-mono">{p.visits}</TableCell>
                          <TableCell className="text-right">{p.avgDuration > 0 ? fmtDuration(p.avgDuration) : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ===== REFERRERS ===== */}
        <TabsContent value="referrers">
          {!referrers ? (loading ? <SkeletonCard /> : <NoData />) : referrers.sources.length === 0 ? <NoData /> : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Pie Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Distribuzione Sorgenti di Traffico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={pieSourceConfig} className="h-[300px] w-full">
                      <RPieChart>
                        <Pie
                          data={referrers.sources}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={110}
                          paddingAngle={2}
                          dataKey="count"
                          nameKey="name"
                          label={({ name, percentage }) => `${name} ${percentage}%`}
                        >
                          {referrers.sources.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </RPieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Table */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Dettaglio Sorgenti</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {referrers.sources.map((s, i) => (
                        <div key={s.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <span className="text-sm">{s.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-mono">{s.count}</span>
                            <Badge variant="outline" className="font-mono text-xs">{s.percentage}%</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* ===== DEVICES ===== */}
        <TabsContent value="devices">
          {!devices ? (loading ? <SkeletonCard /> : <NoData />) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Device Type */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2"><Smartphone className="h-4 w-4" /> Tipo Dispositivo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{ count: { label: 'Visite', color: '#ea580c' } }} className="h-[350px] w-full">
                      <RPieChart>
                        <Pie data={devices.devices} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={2} dataKey="count" nameKey="name">
                          {devices.devices.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                      </RPieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Browser */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Browser</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{ count: { label: 'Visite', color: '#0d9488' } }} className="h-[350px] w-full">
                      <RPieChart>
                        <Pie data={devices.browsers} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={2} dataKey="count" nameKey="name">
                          {devices.browsers.map((_, i) => <Cell key={i} fill={CHART_COLORS[(i + 3) % CHART_COLORS.length]} />)}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                      </RPieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* OS */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Sistema Operativo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{ count: { label: 'Visite', color: '#6366f1' } }} className="h-[350px] w-full">
                      <RPieChart>
                        <Pie data={devices.os} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={2} dataKey="count" nameKey="name">
                          {devices.os.map((_, i) => <Cell key={i} fill={CHART_COLORS[(i + 6) % CHART_COLORS.length]} />)}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                      </RPieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* ===== SESSIONS ===== */}
        <TabsContent value="sessions">
          {!sessions ? (loading ? <SkeletonCard /> : <NoData />) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500 mb-1">Sessioni Totali</div>
                    <p className="text-2xl font-bold">{sessions.totalSessions.toLocaleString('it-IT')}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500 mb-1">Frequenza di Rimbalzo</div>
                    <p className="text-2xl font-bold">{sessions.bounceRate}%</p>
                    <p className="text-xs text-gray-400 mt-1">sessioni a pagina singola</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500 mb-1">Pagine per Sessione</div>
                    <p className="text-2xl font-bold">{sessions.totalSessions > 0 && overview
                      ? (overview.totalVisits / sessions.totalSessions).toFixed(1)
                      : '-'
                    }</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Session Depth */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2"><Layers className="h-4 w-4" /> Profondita Sessione</CardTitle>
                    <CardDescription>Quante pagine vengono visitate per sessione</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{ count: { label: 'Sessioni', color: '#6366f1' } }} className="h-[250px] w-full">
                      <BarChart data={sessions.depthData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Duration Distribution */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Distribuzione Durata</CardTitle>
                    <CardDescription>Quanto tempo gli utenti rimangono sul sito</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{ count: { label: 'Sessioni', color: '#0d9488' } }} className="h-[250px] w-full">
                      <BarChart data={sessions.durationData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* ===== EVENTS LOG ===== */}
        <TabsContent value="events">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-16 text-gray-400">
                  <Activity className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                  <p>Caricamento eventi...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-16 text-gray-400">Nessun evento registrato</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Data/Ora</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Pagina</TableHead>
                        <TableHead>Durata</TableHead>
                        <TableHead>Paese</TableHead>
                        <TableHead>Citta</TableHead>
                        <TableHead>Sessione</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="text-sm whitespace-nowrap">{fmtDateTime(e.timestamp)}</TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{e.eventType}</Badge></TableCell>
                          <TableCell className="text-sm max-w-[200px] truncate">{e.pageUrl}</TableCell>
                          <TableCell className="text-sm">{e.duration ? fmtDuration(e.duration) : '-'}</TableCell>
                          <TableCell className="text-sm">{e.country || '-'}</TableCell>
                          <TableCell className="text-sm">{e.city || '-'}</TableCell>
                          <TableCell className="text-xs text-gray-400 font-mono">{e.sessionId.slice(0, 8)}...</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {Math.ceil(eventsTotal / 50) > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={eventsPage <= 1} onClick={() => setEventsPage(p => p - 1)}>Precedente</Button>
              <span className="text-sm text-gray-500">Pagina {eventsPage} di {Math.ceil(eventsTotal / 50)}</span>
              <Button variant="outline" size="sm" disabled={eventsPage >= Math.ceil(eventsTotal / 50)} onClick={() => setEventsPage(p => p + 1)}>Successiva</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SkeletonCard() {
  return (
    <Card><CardContent className="p-6"><div className="h-20 bg-gray-100 rounded animate-pulse" /></CardContent></Card>
  );
}

function NoData() {
  return (
    <Card>
      <CardContent className="py-16 text-center text-gray-400">
        <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-lg font-medium mb-1">Nessun dato disponibile</p>
        <p className="text-sm">I dati verranno visualizzati non appena i visitatori inizieranno a navigare sul sito.</p>
      </CardContent>
    </Card>
  );
}