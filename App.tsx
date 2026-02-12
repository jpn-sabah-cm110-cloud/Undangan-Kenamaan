
import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Search, Info, School, MapPin, Filter, Layers, Calendar } from 'lucide-react';
import { fetchData, processStats } from './services/dataService';
import { ApplicationData, SummaryStats } from './types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const MONTHS = [
  { id: 'all', name: 'Semua Bulan' },
  { id: '01', name: 'Januari' },
  { id: '02', name: 'Februari' },
  { id: '03', name: 'Mac' },
  { id: '04', name: 'April' },
  { id: '05', name: 'Mei' },
  { id: '06', name: 'Jun' },
  { id: '07', name: 'Julai' },
  { id: '08', name: 'Ogos' },
  { id: '09', name: 'September' },
  { id: '10', name: 'Oktober' },
  { id: '11', name: 'November' },
  { id: '12', name: 'Disember' },
];

const App: React.FC = () => {
  const [rawData, setRawData] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchData();
        setRawData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter data by both search term and selected month
  const filteredData = useMemo(() => {
    return rawData.filter(item => {
      const matchesSearch = item.sekolah.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.ppd.toLowerCase().includes(searchTerm.toLowerCase());
      
      const itemMonth = item.tarikh.split('-')[1];
      const matchesMonth = selectedMonth === 'all' || itemMonth === selectedMonth;
      
      return matchesSearch && matchesMonth;
    });
  }, [rawData, searchTerm, selectedMonth]);

  // Derive stats only from currently filtered data (by month)
  // Note: We might want stats to react to month but not necessarily search, 
  // but typically dashboards filter stats based on active global filters like time.
  const statsDataForCharts = useMemo(() => {
    const monthFilteredOnly = rawData.filter(item => {
      const itemMonth = item.tarikh.split('-')[1];
      return selectedMonth === 'all' || itemMonth === selectedMonth;
    });
    return processStats(monthFilteredOnly);
  }, [rawData, selectedMonth]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">Memuatkan data dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      {/* Header Section */}
      <header className="bg-white border-b sticky top-0 z-50 px-4 md:px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full xl:w-auto">
            <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center border border-gray-100 shadow-sm">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Coat_of_arms_of_Sabah.svg/800px-Coat_of_arms_of_Sabah.svg.png" 
                alt="Logo Sabah" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none mb-1">
                Jabatan Pendidikan Negeri Sabah
              </h1>
              <p className="text-[10px] md:text-xs text-blue-600 font-bold uppercase tracking-[0.2em]">
                Dashboard Permohonan Penyelenggaraan
              </p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto">
            {/* Month Filter */}
            <div className="relative w-full md:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Calendar className="h-4 w-4" />
              </div>
              <select
                className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white sm:text-sm transition-all appearance-none font-medium text-gray-700 shadow-sm"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {MONTHS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white sm:text-sm transition-all shadow-sm"
                placeholder="Cari sekolah atau PPD..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        
        {/* Key Stats Card */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-600 rounded-2xl p-6 shadow-md text-white">
            <div className="flex items-center justify-between mb-3 opacity-80">
              <span className="text-[10px] font-bold uppercase tracking-widest">Bilangan Keseluruhan</span>
              <Layers size={18} />
            </div>
            <div className="text-4xl font-extrabold">{statsDataForCharts.total}</div>
            <div className="text-xs mt-2 font-medium opacity-90">Permohonan {selectedMonth !== 'all' ? `bagi ${MONTHS.find(m => m.id === selectedMonth)?.name}` : 'setakat ini'}</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">PPD Teraktif</span>
              <MapPin className="text-blue-500" size={18} />
            </div>
            <div className="text-2xl font-bold text-gray-800 truncate">{statsDataForCharts.byPPD[0]?.name || 'Tiada'}</div>
            <div className="text-xs text-gray-400 mt-2">{statsDataForCharts.byPPD[0]?.count || 0} permohonan aktif</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Keputusan Carian</span>
              <School className="text-green-500" size={18} />
            </div>
            <div className="text-2xl font-bold text-gray-800">{filteredData.length}</div>
            <div className="text-xs text-gray-400 mt-2">Daripada filter semasa</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Kategori Khas</span>
              <Filter className="text-amber-500" size={18} />
            </div>
            <div className="text-2xl font-bold text-gray-800">4</div>
            <div className="text-xs text-gray-400 mt-2">Pecahan kategori utama</div>
          </div>
        </section>

        {/* Charts Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h2 className="text-lg font-bold text-gray-800">Pecahan Ahli Parlimen / ADUN</h2>
              </div>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsDataForCharts.byKategori}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={8}
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {statsDataForCharts.byKategori.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-xs font-semibold text-gray-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-green-500 rounded-full"></div>
                <h2 className="text-lg font-bold text-gray-800">Pecahan Mengikut PPD</h2>
              </div>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsDataForCharts.byPPD.slice(0, 8)} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={110} fontSize={11} fontWeight={600} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* List / Search Results Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <School size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Senarai Semakan Institusi</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dipaparkan</span>
              <div className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 shadow-sm">
                {filteredData.length} Keputusan
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Institusi / Sekolah</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Pejabat Pendidikan (PPD)</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Kategori Politik</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Tarikh & Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-all group">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.sekolah}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">{item.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin size={12} className="text-gray-300" />
                          <span className="text-sm font-semibold text-gray-600">{item.ppd}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          item.kategori === 'Ahli Parlimen' ? 'bg-blue-50 text-blue-700' :
                          item.kategori === 'ADUN' ? 'bg-indigo-50 text-indigo-700' :
                          item.kategori === 'ADUN & Ahli Parlimen' ? 'bg-orange-50 text-orange-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {item.kategori}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-bold text-gray-500 mb-1">{item.tarikh}</div>
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${item.status === 'Selesai' ? 'text-green-600' : 'text-amber-500'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${item.status === 'Selesai' ? 'bg-green-600' : 'bg-amber-500'}`}></span>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                          <Search size={32} />
                        </div>
                        <p className="text-gray-400 font-medium">Tiada rekod ditemui untuk filter atau carian ini</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Footer Info */}
      <footer className="max-w-7xl mx-auto px-4 md:px-8 py-10 border-t border-gray-100 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 grayscale opacity-50">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Coat_of_arms_of_Sabah.svg/800px-Coat_of_arms_of_Sabah.svg.png" 
              alt="Logo Sabah" 
              className="w-8 h-8 object-contain"
            />
            <div className="text-xs text-gray-400 font-medium">
              Sistem Maklumat Penyelenggaraan JPN Sabah
            </div>
          </div>
          <div className="flex flex-col md:items-end gap-1">
            <p className="text-xs text-gray-400 font-medium tracking-wide">© 2024 Jabatan Pendidikan Negeri Sabah</p>
            <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-blue-600">Terma</a>
              <a href="#" className="hover:text-blue-600">Polisi</a>
              <a href="#" className="hover:text-blue-600">Hubungi Kami</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
