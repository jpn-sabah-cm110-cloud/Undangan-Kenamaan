
import { ApplicationData, SummaryStats } from '../types';

// Mock data generator based on the user's spreadsheet structure
export const fetchData = async (): Promise<ApplicationData[]> => {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const ppds = ['Kota Kinabalu', 'Sandakan', 'Tawau', 'Lahad Datu', 'Keningau', 'Beaufort', 'Kudat', 'Ranau', 'Tuaran', 'Penampang'];
  const kategoris = ['Ahli Parlimen', 'ADUN', 'Lain-lain', 'ADUN & Ahli Parlimen'];
  const schools = [
    'SK St Francis', 'SMK Sanzac', 'SK Stella Maris', 'SMK Likas', 'SK Tanjung Aru', 
    'SJKC Chung Hwa', 'SMK Elopura', 'SK Muhibbah', 'SMK Tawau', 'SK Pekan Keningau',
    'SMK Beaufort', 'SK Kudat II', 'SMK Mat Salleh', 'SK Pekan Ranau', 'SMK Badin'
  ];

  const mockData: ApplicationData[] = Array.from({ length: 200 }, (_, i) => {
    // Generate random months between 1 and 12
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const dateStr = `2024-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    return {
      id: `REQ-${1000 + i}`,
      sekolah: schools[Math.floor(Math.random() * schools.length)] + ` ${i % 5 === 0 ? '(P)' : ''}`,
      ppd: ppds[Math.floor(Math.random() * ppds.length)],
      kategori: kategoris[Math.floor(Math.random() * kategoris.length)],
      status: Math.random() > 0.3 ? 'Selesai' : 'Dalam Proses',
      tarikh: dateStr
    };
  });

  return mockData;
};

export const processStats = (data: ApplicationData[]): SummaryStats => {
  const categoriesMap: Record<string, number> = {};
  const ppdMap: Record<string, number> = {};

  data.forEach(item => {
    categoriesMap[item.kategori] = (categoriesMap[item.kategori] || 0) + 1;
    ppdMap[item.ppd] = (ppdMap[item.ppd] || 0) + 1;
  });

  // Ensure all categories exist even if count is 0
  ['Ahli Parlimen', 'ADUN', 'Lain-lain', 'ADUN & Ahli Parlimen'].forEach(cat => {
    if (!categoriesMap[cat]) categoriesMap[cat] = 0;
  });

  return {
    total: data.length,
    byKategori: Object.entries(categoriesMap).map(([name, value]) => ({ name, value })),
    byPPD: Object.entries(ppdMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  };
};
