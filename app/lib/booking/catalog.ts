export type Service = {
  id: string;
  number: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceTry: number;
};

export const services: Service[] = [
  { id: "haircut", number: "01", name: "Saç Kesimi", description: "Tarzınıza göre şekillenen, özenli bir kesim.", durationMinutes: 30, priceTry: 700 },
  { id: "beard", number: "02", name: "Sakal Kesimi", description: "Net hatlar ve dengeli bir form.", durationMinutes: 20, priceTry: 200 },
  { id: "care", number: "03", name: "Bakım", description: "Kendinize ayırdığınız kısa bir yenilenme molası.", durationMinutes: 10, priceTry: 300 },
  { id: "haircut-beard", number: "04", name: "Saç + Sakal", description: "Bir arada, baştan sona tamamlanmış bir görünüm.", durationMinutes: 60, priceTry: 900 },
  { id: "complete-care", number: "05", name: "Saç + Sakal + Bakım", description: "Tam bir berber deneyimi, tek seansta.", durationMinutes: 80, priceTry: 1000 },
];

export function formatPrice(priceTry: number) {
  return `${new Intl.NumberFormat("tr-TR").format(priceTry)} TL`;
}

export function formatDuration(durationMinutes: number) {
  return `${durationMinutes} dk`;
}
