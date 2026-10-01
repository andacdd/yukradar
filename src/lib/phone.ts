export function normalizeTrPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  let national: string;
  if (digits.length === 12 && digits.startsWith("90")) {
    national = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    national = digits.slice(1);
  } else if (digits.length === 10) {
    national = digits;
  } else {
    return null;
  }
  if (!/^[2-5]\d{9}$/.test(national)) return null;
  return `+90${national}`;
}

export function normalizeTrMobile(input: string): string | null {
  const normalized = normalizeTrPhone(input);
  if (!normalized || normalized[3] !== "5") return null;
  return normalized;
}

export function formatTrPhone(e164: string): string {
  const n = e164.replace(/^\+90/, "");
  if (n.length !== 10) return e164;
  return `0${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6, 8)} ${n.slice(8)}`;
}

export function whatsappLink(e164: string, text?: string): string {
  const base = `https://wa.me/${e164.replace(/\D/g, "")}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function isTrMobile(e164: string): boolean {
  return /^\+905\d{9}$/.test(e164);
}
