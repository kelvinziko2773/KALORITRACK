import axios from 'axios';

const MAKANAN_INDONESIA = [
  { name: 'Nasi Putih', calories: 175, carbohydrates_total_g: 38, protein_g: 4, fat_total_g: 0 },
  { name: 'Nasi Goreng', calories: 337, carbohydrates_total_g: 45, protein_g: 10, fat_total_g: 13 },
  { name: 'Nasi Uduk', calories: 270, carbohydrates_total_g: 40, protein_g: 6, fat_total_g: 10 },
  { name: 'Nasi Padang', calories: 600, carbohydrates_total_g: 75, protein_g: 30, fat_total_g: 20 },
  { name: 'Ayam Goreng', calories: 246, carbohydrates_total_g: 7, protein_g: 23, fat_total_g: 14 },
  { name: 'Ayam Bakar', calories: 180, carbohydrates_total_g: 3, protein_g: 25, fat_total_g: 8 },
  { name: 'Ayam Geprek', calories: 320, carbohydrates_total_g: 15, protein_g: 28, fat_total_g: 18 },
  { name: 'Opor Ayam', calories: 290, carbohydrates_total_g: 8, protein_g: 24, fat_total_g: 18 },
  { name: 'Sate Ayam', calories: 280, carbohydrates_total_g: 12, protein_g: 26, fat_total_g: 14 },
  { name: 'Rendang Sapi', calories: 320, carbohydrates_total_g: 8, protein_g: 28, fat_total_g: 19 },
  { name: 'Rawon', calories: 250, carbohydrates_total_g: 10, protein_g: 22, fat_total_g: 14 },
  { name: 'Soto Ayam', calories: 180, carbohydrates_total_g: 15, protein_g: 18, fat_total_g: 6 },
  { name: 'Bakso', calories: 220, carbohydrates_total_g: 20, protein_g: 15, fat_total_g: 8 },
  { name: 'Mie Goreng', calories: 330, carbohydrates_total_g: 48, protein_g: 9, fat_total_g: 11 },
  { name: 'Mie Rebus', calories: 250, carbohydrates_total_g: 45, protein_g: 8, fat_total_g: 5 },
  { name: 'Indomie Goreng', calories: 400, carbohydrates_total_g: 58, protein_g: 9, fat_total_g: 15 },
  { name: 'Indomie Rebus', calories: 320, carbohydrates_total_g: 52, protein_g: 8, fat_total_g: 9 },
  { name: 'Tempe Goreng', calories: 200, carbohydrates_total_g: 10, protein_g: 14, fat_total_g: 12 },
  { name: 'Tahu Goreng', calories: 120, carbohydrates_total_g: 4, protein_g: 9, fat_total_g: 8 },
  { name: 'Telur Goreng', calories: 185, carbohydrates_total_g: 1, protein_g: 13, fat_total_g: 14 },
  { name: 'Telur Rebus', calories: 155, carbohydrates_total_g: 1, protein_g: 13, fat_total_g: 11 },
  { name: 'Telur Dadar', calories: 170, carbohydrates_total_g: 2, protein_g: 12, fat_total_g: 13 },
  { name: 'Ikan Goreng', calories: 200, carbohydrates_total_g: 5, protein_g: 22, fat_total_g: 10 },
  { name: 'Ikan Bakar', calories: 160, carbohydrates_total_g: 2, protein_g: 24, fat_total_g: 6 },
  { name: 'Gado Gado', calories: 250, carbohydrates_total_g: 22, protein_g: 12, fat_total_g: 14 },
  { name: 'Ketoprak', calories: 280, carbohydrates_total_g: 35, protein_g: 12, fat_total_g: 10 },
  { name: 'Siomay', calories: 180, carbohydrates_total_g: 18, protein_g: 12, fat_total_g: 6 },
  { name: 'Batagor', calories: 220, carbohydrates_total_g: 20, protein_g: 12, fat_total_g: 10 },
  { name: 'Pempek', calories: 270, carbohydrates_total_g: 35, protein_g: 12, fat_total_g: 8 },
  { name: 'Bubur Ayam', calories: 200, carbohydrates_total_g: 30, protein_g: 12, fat_total_g: 5 },
  { name: 'Sayur Bayam', calories: 45, carbohydrates_total_g: 7, protein_g: 4, fat_total_g: 1 },
  { name: 'Sayur Lodeh', calories: 120, carbohydrates_total_g: 10, protein_g: 4, fat_total_g: 7 },
  { name: 'Tumis Kangkung', calories: 80, carbohydrates_total_g: 8, protein_g: 3, fat_total_g: 4 },
  { name: 'Cap Cay', calories: 130, carbohydrates_total_g: 12, protein_g: 8, fat_total_g: 6 },
  { name: 'Martabak Telur', calories: 350, carbohydrates_total_g: 30, protein_g: 18, fat_total_g: 18 },
  { name: 'Martabak Manis', calories: 450, carbohydrates_total_g: 65, protein_g: 8, fat_total_g: 18 },
  { name: 'Pisang Goreng', calories: 200, carbohydrates_total_g: 32, protein_g: 2, fat_total_g: 8 },
  { name: 'Roti Tawar', calories: 80, carbohydrates_total_g: 15, protein_g: 3, fat_total_g: 1 },
  { name: 'Roti Bakar', calories: 150, carbohydrates_total_g: 25, protein_g: 4, fat_total_g: 4 },
  { name: 'Susu Sapi', calories: 120, carbohydrates_total_g: 12, protein_g: 8, fat_total_g: 5 },
  { name: 'Teh Manis', calories: 80, carbohydrates_total_g: 20, protein_g: 0, fat_total_g: 0 },
  { name: 'Kopi Susu', calories: 120, carbohydrates_total_g: 15, protein_g: 3, fat_total_g: 5 },
  { name: 'Jus Jeruk', calories: 90, carbohydrates_total_g: 21, protein_g: 1, fat_total_g: 0 },
  { name: 'Jus Alpukat', calories: 220, carbohydrates_total_g: 18, protein_g: 2, fat_total_g: 14 },
  { name: 'Cireng', calories: 150, carbohydrates_total_g: 28, protein_g: 2, fat_total_g: 4 },
  { name: 'Cilok', calories: 130, carbohydrates_total_g: 22, protein_g: 4, fat_total_g: 3 },
  { name: 'Lontong', calories: 100, carbohydrates_total_g: 22, protein_g: 2, fat_total_g: 0 },
  { name: 'Ketupat', calories: 120, carbohydrates_total_g: 26, protein_g: 2, fat_total_g: 0 },
  { name: 'Pepes Ikan', calories: 140, carbohydrates_total_g: 3, protein_g: 20, fat_total_g: 5 },
  { name: 'Sop Buntut', calories: 280, carbohydrates_total_g: 8, protein_g: 25, fat_total_g: 16 },
  { name: 'Pecel', calories: 220, carbohydrates_total_g: 24, protein_g: 9, fat_total_g: 10 },
{ name: 'Nasi Pecel', calories: 350, carbohydrates_total_g: 52, protein_g: 12, fat_total_g: 11 },
{ name: 'Lontong Sayur', calories: 320, carbohydrates_total_g: 45, protein_g: 10, fat_total_g: 11 },
{ name: 'Gudeg', calories: 290, carbohydrates_total_g: 45, protein_g: 7, fat_total_g: 10 },
{ name: 'Gudeg Komplit', calories: 520, carbohydrates_total_g: 58, protein_g: 24, fat_total_g: 22 },
{ name: 'Nasi Kuning', calories: 260, carbohydrates_total_g: 42, protein_g: 5, fat_total_g: 8 },
{ name: 'Nasi Liwet', calories: 290, carbohydrates_total_g: 40, protein_g: 7, fat_total_g: 11 },
{ name: 'Nasi Campur', calories: 550, carbohydrates_total_g: 65, protein_g: 25, fat_total_g: 20 },
{ name: 'Lalapan Ayam', calories: 260, carbohydrates_total_g: 8, protein_g: 24, fat_total_g: 15 },
{ name: 'Lele Goreng', calories: 230, carbohydrates_total_g: 4, protein_g: 21, fat_total_g: 14 },
{ name: 'Bebek Goreng', calories: 340, carbohydrates_total_g: 6, protein_g: 25, fat_total_g: 24 },
{ name: 'Empal Daging', calories: 280, carbohydrates_total_g: 8, protein_g: 24, fat_total_g: 16 },
{ name: 'Semur Daging', calories: 250, carbohydrates_total_g: 10, protein_g: 22, fat_total_g: 14 },
{ name: 'Semur Telur', calories: 180, carbohydrates_total_g: 7, protein_g: 11, fat_total_g: 11 },
{ name: 'Perkedel Kentang', calories: 180, carbohydrates_total_g: 18, protein_g: 4, fat_total_g: 10 },
{ name: 'Bakwan Sayur', calories: 170, carbohydrates_total_g: 18, protein_g: 4, fat_total_g: 9 },
{ name: 'Risoles', calories: 200, carbohydrates_total_g: 22, protein_g: 5, fat_total_g: 10 },
{ name: 'Pastel', calories: 210, carbohydrates_total_g: 20, protein_g: 5, fat_total_g: 11 },
{ name: 'Lemper Ayam', calories: 190, carbohydrates_total_g: 28, protein_g: 6, fat_total_g: 6 },
{ name: 'Onde Onde', calories: 220, carbohydrates_total_g: 30, protein_g: 4, fat_total_g: 9 },
{ name: 'Klepon', calories: 160, carbohydrates_total_g: 28, protein_g: 2, fat_total_g: 4 },
{ name: 'Getuk', calories: 180, carbohydrates_total_g: 38, protein_g: 1, fat_total_g: 2 },
{ name: 'Lupis', calories: 170, carbohydrates_total_g: 36, protein_g: 2, fat_total_g: 2 },
{ name: 'Serabi', calories: 190, carbohydrates_total_g: 28, protein_g: 4, fat_total_g: 7 },
{ name: 'Bika Ambon', calories: 260, carbohydrates_total_g: 42, protein_g: 4, fat_total_g: 8 },
{ name: 'Kerak Telor', calories: 330, carbohydrates_total_g: 28, protein_g: 15, fat_total_g: 18 },
{ name: 'Nasi Timbel', calories: 380, carbohydrates_total_g: 55, protein_g: 12, fat_total_g: 12 },
{ name: 'Ayam Penyet', calories: 320, carbohydrates_total_g: 10, protein_g: 28, fat_total_g: 18 },
{ name: 'Tahu Tek', calories: 290, carbohydrates_total_g: 25, protein_g: 14, fat_total_g: 15 },
{ name: 'Tahu Campur', calories: 310, carbohydrates_total_g: 24, protein_g: 18, fat_total_g: 16 },
{ name: 'Rujak Cingur', calories: 350, carbohydrates_total_g: 32, protein_g: 18, fat_total_g: 18 },
{ name: 'Lontong Balap', calories: 270, carbohydrates_total_g: 42, protein_g: 10, fat_total_g: 7 },
{ name: 'Tahu Sumedang', calories: 140, carbohydrates_total_g: 8, protein_g: 8, fat_total_g: 9 },
{ name: 'Peyek Kacang', calories: 210, carbohydrates_total_g: 18, protein_g: 6, fat_total_g: 13 },
{ name: 'Kerupuk Udang', calories: 160, carbohydrates_total_g: 20, protein_g: 4, fat_total_g: 7 },
{ name: 'Es Cendol', calories: 240, carbohydrates_total_g: 40, protein_g: 2, fat_total_g: 8 },
{ name: 'Es Teler', calories: 260, carbohydrates_total_g: 38, protein_g: 3, fat_total_g: 10 },
{ name: 'Kolak Pisang', calories: 220, carbohydrates_total_g: 42, protein_g: 2, fat_total_g: 5 },
{ name: 'Bubur Kacang Hijau', calories: 250, carbohydrates_total_g: 42, protein_g: 8, fat_total_g: 5 },
{ name: 'Es Campur', calories: 280, carbohydrates_total_g: 50, protein_g: 2, fat_total_g: 8 },
{ name: 'Bakmi Jawa', calories: 380, carbohydrates_total_g: 52, protein_g: 14, fat_total_g: 12 },
{ name: 'Mie Aceh', calories: 450, carbohydrates_total_g: 58, protein_g: 18, fat_total_g: 16 },
{ name: 'Nasi Goreng Seafood', calories: 420, carbohydrates_total_g: 52, protein_g: 18, fat_total_g: 15 },
{ name: 'Soto Betawi', calories: 350, carbohydrates_total_g: 12, protein_g: 24, fat_total_g: 22 },
{ name: 'Soto Lamongan', calories: 220, carbohydrates_total_g: 18, protein_g: 20, fat_total_g: 8 },
{ name: 'Coto Makassar', calories: 320, carbohydrates_total_g: 10, protein_g: 26, fat_total_g: 20 },
{ name: 'Pindang Patin', calories: 180, carbohydrates_total_g: 5, protein_g: 24, fat_total_g: 7 },
{ name: 'Ikan Asam Manis', calories: 240, carbohydrates_total_g: 15, protein_g: 22, fat_total_g: 10 },
{ name: 'Udang Goreng Tepung', calories: 280, carbohydrates_total_g: 20, protein_g: 18, fat_total_g: 14 },
];

// Axios instance - tetap dipakai untuk memenuhi syarat tugas
const nutritionClient = axios.create({
  baseURL: 'https://api.api-ninjas.com/v1',
  timeout: 8000,
  headers: {
    'X-Api-Key': 'gzgUbhC7lXtsNjTHqRnHls8TSdJ52FLJWNFlTaCs',
  },
});

nutritionClient.interceptors.request.use(
  (config) => { console.log('[Axios] Request:', config.url); return config; },
  (error) => Promise.reject(error)
);

nutritionClient.interceptors.response.use(
  (response) => { console.log('[Axios] OK:', response.status); return response; },
  (error) => {
    if (error.response) throw new Error(`Server error: ${error.response.status}`);
    if (error.request) throw new Error('Tidak ada koneksi internet');
    throw new Error('Terjadi kesalahan');
  }
);

export const searchFood = async (foodName) => {
  const keyword = foodName.toLowerCase().trim();

  // Cari di database lokal Indonesia dulu
  const lokalResults = MAKANAN_INDONESIA.filter(item =>
    item.name.toLowerCase().includes(keyword)
  );

  if (lokalResults.length > 0) {
    console.log('[Local] Found:', lokalResults.length, 'items');
    return lokalResults;
  }

  // Fallback ke Axios API untuk makanan yang tidak ada di lokal
  console.log('[Axios] Searching external API...');
  try {
    const response = await nutritionClient.get(
      `/nutrition?query=${encodeURIComponent(foodName)}`
    );
    return response.data.map(item => ({
      name: item.name || foodName,
      calories: parseFloat(item.calories) || 0,
      carbohydrates_total_g: parseFloat(item.carbohydrates_total_g) || 0,
      protein_g: parseFloat(item.protein_g) || 0,
      fat_total_g: parseFloat(item.fat_total_g) || 0,
    }));
  } catch (error) {
    console.log('[Axios] Error:', error.message);
    return [];
  }
};