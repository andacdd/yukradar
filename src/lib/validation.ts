import { z } from "zod";
import { LOAD_VEHICLE_TYPE_VALUES, VEHICLE_TYPE_VALUES } from "@/lib/data/options";
import { normalizeTrMobile, normalizeTrPhone } from "@/lib/phone";

export function todayInTurkey(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(new Date());
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function parseDecimal(value: string): number | null {
  const cleaned = value.trim().replace(/\s/g, "").replace(",", ".");
  if (cleaned === "" || !/^\d+(\.\d+)?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function normalizePlate(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, " ");
}

const PLATE_RE = /^(0[1-9]|[1-7][0-9]|8[01]) ?[A-Z]{1,3} ?[0-9]{2,4}$/;

export const phoneLoginSchema = z.object({
  phone: z
    .string()
    .trim()
    .refine((v) => normalizeTrMobile(v) !== null, "Geçerli bir cep telefonu girin (örn. 0532 123 45 67)"),
});

export const otpSchema = z.object({
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "6 haneli doğrulama kodunu girin"),
});

export const profileSchema = z
  .object({
    full_name: z.string().trim().min(3, "Ad soyad en az 3 karakter olmalı").max(80, "Ad soyad çok uzun"),
    role: z.enum(["shipper", "carrier", "both"], { message: "Rol seçin" }),
    vehicle_type: z.string(),
    plate: z.string().max(12, "Plaka çok uzun"),
    kvkk: z.boolean(),
  })
  .superRefine((val, ctx) => {
    if (val.role !== "shipper" && !(VEHICLE_TYPE_VALUES as readonly string[]).includes(val.vehicle_type)) {
      ctx.addIssue({ code: "custom", path: ["vehicle_type"], message: "Araç tipini seçin" });
    }
    const plate = normalizePlate(val.plate);
    if (val.role !== "shipper" && plate !== "" && !PLATE_RE.test(plate)) {
      ctx.addIssue({ code: "custom", path: ["plate"], message: "Plaka biçimi geçersiz (örn. 34 ABC 123)" });
    }
  });

export type ProfileFormValues = z.infer<typeof profileSchema>;

const provinceCode = z
  .string()
  .refine((v) => /^\d{1,2}$/.test(v) && Number(v) >= 1 && Number(v) <= 81, "İl seçin");

export const loadSchema = z
  .object({
    from_province_code: provinceCode,
    from_district: z.string().trim().max(60, "İlçe adı çok uzun"),
    to_province_code: provinceCode,
    to_district: z.string().trim().max(60, "İlçe adı çok uzun"),
    cargo_type: z.string().trim().min(2, "Yük türünü yazın").max(60, "Yük türü çok uzun"),
    weight_tons: z.string().refine((v) => {
      const n = parseDecimal(v);
      return n !== null && n > 0 && n < 1000;
    }, "Ağırlığı ton cinsinden girin (örn. 24 veya 1,5)"),
    vehicle_type: z.enum(LOAD_VEHICLE_TYPE_VALUES, { message: "Araç tipi seçin" }),
    load_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Yükleme tarihini seçin"),
    price: z.string().refine((v) => v.trim() === "" || parseDecimal(v) !== null, "Fiyatı sayı olarak girin"),
    description: z.string().trim().max(1000, "Açıklama en fazla 1000 karakter olabilir"),
    contact_phone: z
      .string()
      .trim()
      .refine((v) => normalizeTrPhone(v) !== null, "Geçerli bir telefon girin (örn. 0532 123 45 67)"),
  })
  .superRefine((val, ctx) => {
    const today = todayInTurkey();
    if (val.load_date < today) {
      ctx.addIssue({ code: "custom", path: ["load_date"], message: "Yükleme tarihi geçmiş olamaz" });
    } else if (val.load_date > addDays(today, 90)) {
      ctx.addIssue({ code: "custom", path: ["load_date"], message: "En fazla 90 gün sonrası seçilebilir" });
    }
  });

export type LoadFormValues = z.infer<typeof loadSchema>;

export const removalSchema = z.object({
  full_name: z.string().trim().min(3, "Ad soyad en az 3 karakter olmalı").max(80, "Ad soyad çok uzun"),
  phone: z
    .string()
    .trim()
    .refine((v) => normalizeTrPhone(v) !== null, "Geçerli bir telefon girin"),
  reason: z.string().trim().min(10, "Lütfen en az 10 karakterlik bir açıklama yazın").max(1000, "Açıklama çok uzun"),
  consent: z.boolean().refine((v) => v, "Devam etmek için onay vermelisiniz"),
});

export type RemovalFormValues = z.infer<typeof removalSchema>;

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Form geçersiz";
}
