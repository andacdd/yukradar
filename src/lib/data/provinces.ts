export type Province = {
  code: number;
  name: string;
  lat: number;
  lng: number;
};

export const PROVINCES: readonly Province[] = [
  { code: 1, name: "Adana", lat: 37.0, lng: 35.3213 },
  { code: 2, name: "Adıyaman", lat: 37.7648, lng: 38.2786 },
  { code: 3, name: "Afyonkarahisar", lat: 38.7507, lng: 30.5567 },
  { code: 4, name: "Ağrı", lat: 39.7191, lng: 43.0503 },
  { code: 5, name: "Amasya", lat: 40.6499, lng: 35.8353 },
  { code: 6, name: "Ankara", lat: 39.9334, lng: 32.8597 },
  { code: 7, name: "Antalya", lat: 36.8969, lng: 30.7133 },
  { code: 8, name: "Artvin", lat: 41.1828, lng: 41.8183 },
  { code: 9, name: "Aydın", lat: 37.856, lng: 27.8416 },
  { code: 10, name: "Balıkesir", lat: 39.6484, lng: 27.8826 },
  { code: 11, name: "Bilecik", lat: 40.1451, lng: 29.9798 },
  { code: 12, name: "Bingöl", lat: 38.8847, lng: 40.4939 },
  { code: 13, name: "Bitlis", lat: 38.4006, lng: 42.1095 },
  { code: 14, name: "Bolu", lat: 40.7392, lng: 31.6089 },
  { code: 15, name: "Burdur", lat: 37.7203, lng: 30.2906 },
  { code: 16, name: "Bursa", lat: 40.1885, lng: 29.061 },
  { code: 17, name: "Çanakkale", lat: 40.1553, lng: 26.4142 },
  { code: 18, name: "Çankırı", lat: 40.6013, lng: 33.6134 },
  { code: 19, name: "Çorum", lat: 40.5506, lng: 34.9556 },
  { code: 20, name: "Denizli", lat: 37.7765, lng: 29.0864 },
  { code: 21, name: "Diyarbakır", lat: 37.9144, lng: 40.2306 },
  { code: 22, name: "Edirne", lat: 41.6818, lng: 26.5623 },
  { code: 23, name: "Elazığ", lat: 38.681, lng: 39.2264 },
  { code: 24, name: "Erzincan", lat: 39.75, lng: 39.5 },
  { code: 25, name: "Erzurum", lat: 39.9, lng: 41.27 },
  { code: 26, name: "Eskişehir", lat: 39.7767, lng: 30.5206 },
  { code: 27, name: "Gaziantep", lat: 37.0662, lng: 37.3833 },
  { code: 28, name: "Giresun", lat: 40.9128, lng: 38.3895 },
  { code: 29, name: "Gümüşhane", lat: 40.4386, lng: 39.5086 },
  { code: 30, name: "Hakkari", lat: 37.5833, lng: 43.7333 },
  { code: 31, name: "Hatay", lat: 36.2021, lng: 36.16 },
  { code: 32, name: "Isparta", lat: 37.7648, lng: 30.5566 },
  { code: 33, name: "Mersin", lat: 36.8, lng: 34.6333 },
  { code: 34, name: "İstanbul", lat: 41.0082, lng: 28.9784 },
  { code: 35, name: "İzmir", lat: 38.4237, lng: 27.1428 },
  { code: 36, name: "Kars", lat: 40.6167, lng: 43.1 },
  { code: 37, name: "Kastamonu", lat: 41.3887, lng: 33.7827 },
  { code: 38, name: "Kayseri", lat: 38.7312, lng: 35.4787 },
  { code: 39, name: "Kırklareli", lat: 41.7333, lng: 27.2167 },
  { code: 40, name: "Kırşehir", lat: 39.1425, lng: 34.1709 },
  { code: 41, name: "Kocaeli", lat: 40.8533, lng: 29.8815 },
  { code: 42, name: "Konya", lat: 37.8667, lng: 32.4833 },
  { code: 43, name: "Kütahya", lat: 39.4167, lng: 29.9833 },
  { code: 44, name: "Malatya", lat: 38.3552, lng: 38.3095 },
  { code: 45, name: "Manisa", lat: 38.6191, lng: 27.4289 },
  { code: 46, name: "Kahramanmaraş", lat: 37.5858, lng: 36.9371 },
  { code: 47, name: "Mardin", lat: 37.3212, lng: 40.7245 },
  { code: 48, name: "Muğla", lat: 37.2153, lng: 28.3636 },
  { code: 49, name: "Muş", lat: 38.9462, lng: 41.7539 },
  { code: 50, name: "Nevşehir", lat: 38.6939, lng: 34.6857 },
  { code: 51, name: "Niğde", lat: 37.9667, lng: 34.6833 },
  { code: 52, name: "Ordu", lat: 40.9839, lng: 37.8764 },
  { code: 53, name: "Rize", lat: 41.0201, lng: 40.5234 },
  { code: 54, name: "Sakarya", lat: 40.694, lng: 30.4358 },
  { code: 55, name: "Samsun", lat: 41.2928, lng: 36.3313 },
  { code: 56, name: "Siirt", lat: 37.9333, lng: 41.95 },
  { code: 57, name: "Sinop", lat: 42.0231, lng: 35.1531 },
  { code: 58, name: "Sivas", lat: 39.7477, lng: 37.0179 },
  { code: 59, name: "Tekirdağ", lat: 40.9833, lng: 27.5167 },
  { code: 60, name: "Tokat", lat: 40.3167, lng: 36.55 },
  { code: 61, name: "Trabzon", lat: 41.0015, lng: 39.7178 },
  { code: 62, name: "Tunceli", lat: 39.1079, lng: 39.5401 },
  { code: 63, name: "Şanlıurfa", lat: 37.1591, lng: 38.7969 },
  { code: 64, name: "Uşak", lat: 38.6823, lng: 29.4082 },
  { code: 65, name: "Van", lat: 38.4891, lng: 43.4089 },
  { code: 66, name: "Yozgat", lat: 39.8181, lng: 34.8147 },
  { code: 67, name: "Zonguldak", lat: 41.4564, lng: 31.7987 },
  { code: 68, name: "Aksaray", lat: 38.3687, lng: 34.037 },
  { code: 69, name: "Bayburt", lat: 40.2552, lng: 40.2249 },
  { code: 70, name: "Karaman", lat: 37.1759, lng: 33.2287 },
  { code: 71, name: "Kırıkkale", lat: 39.8468, lng: 33.5153 },
  { code: 72, name: "Batman", lat: 37.8812, lng: 41.1351 },
  { code: 73, name: "Şırnak", lat: 37.4187, lng: 42.4918 },
  { code: 74, name: "Bartın", lat: 41.6344, lng: 32.3375 },
  { code: 75, name: "Ardahan", lat: 41.1105, lng: 42.7022 },
  { code: 76, name: "Iğdır", lat: 39.9237, lng: 44.045 },
  { code: 77, name: "Yalova", lat: 40.65, lng: 29.2667 },
  { code: 78, name: "Karabük", lat: 41.2061, lng: 32.6204 },
  { code: 79, name: "Kilis", lat: 36.7184, lng: 37.1212 },
  { code: 80, name: "Osmaniye", lat: 37.0742, lng: 36.2478 },
  { code: 81, name: "Düzce", lat: 40.8438, lng: 31.1565 },
];

export const PROVINCES_SORTED: readonly Province[] = [...PROVINCES].sort((a, b) =>
  a.name.localeCompare(b.name, "tr"),
);

export function getProvince(code: number): Province | undefined {
  return PROVINCES.find((p) => p.code === code);
}

export function provincePointEWKT(code: number): string | null {
  const p = getProvince(code);
  if (!p) return null;
  return `SRID=4326;POINT(${p.lng} ${p.lat})`;
}
