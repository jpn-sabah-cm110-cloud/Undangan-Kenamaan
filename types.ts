
export interface ApplicationData {
  id: string;
  sekolah: string;
  ppd: string;
  kategori: string; // Ahli Parlimen, ADUN, Lain-lain, ADUN & Ahli Parlimen
  status: string;
  tarikh: string;
}

export interface SummaryStats {
  total: number;
  byKategori: { name: string; value: number }[];
  byPPD: { name: string; count: number }[];
}
