# Yük Bulma — Aşama 1 + 2

Türkiye'ye özel lojistik yük bulma web uygulaması. Yük sahipleri ilan verir, tır/kamyon sahipleri yük arar.

Stack: Next.js 16 (App Router, TypeScript, Tailwind CSS 4), Supabase (Auth + Postgres + PostGIS), PWA, mobil öncelikli, Türkçe arayüz.

## Aşama 1 kapsamı

- Telefon + SMS OTP ile giriş/kayıt (Supabase phone auth, `+90` cep telefonu doğrulaması)
- Kayıt sonrası profil: ad soyad, rol (yük sahibi / araç sahibi / ikisi), araç tipi, plaka (opsiyonel), KVKK onay kutusu
- Yük ilanı verme: nereden/nereye (il + opsiyonel ilçe), yük türü, ton, araç tipi, yükleme tarihi, fiyat (opsiyonel), açıklama, iletişim telefonu
- Alım/teslim koordinatı il merkezinden `geography(Point,4326)` kolonlarına yazılır (Aşama 2 harita için hazır)
- İlan listesi: nereden, nereye, araç tipi, tarih aralığı, ton aralığı filtreleri; en yeni üstte; 20'li sayfalama
- İlan detayı: "Ara" (`tel:`) ve "WhatsApp" (`wa.me`) butonları; telefon **yalnızca giriş yapmış kullanıcıya** döner (veritabanı yetkisiyle zorlanır)
- İlanlarım: düzenle, sil, kapat (yük bulundu), yeniden yayınla
- WhatsApp kaynaklı ilanlar için "WhatsApp grubundan alındı" rozeti ve KVKK "Bu ilanı kaldır" başvuru akışı
- KVKK aydınlatma metni sayfası
- PWA: manifest, ikonlar, çevrimdışı sayfası ve basit service worker

## Gereksinimler

- Node.js 20.9+ (Next.js 16 gereksinimi)
- Bir Supabase projesi (bulut) veya yerelde Supabase CLI + Docker
- Canlı SMS için Netgsm hesabı (onaylı mesaj başlığı + API kullanıcısı)

## Kurulum

```bash
npm install
cp .env.local .env.local
```

`.env.local` içeriği:

| Değişken | Açıklama |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Aynı sayfadaki `anon` (veya yeni `publishable`) anahtar |

Service role anahtarı bu uygulamada kullanılmaz; asla `NEXT_PUBLIC_` ile başlayan bir değişkene koymayın.

Ortam değişkenleri olmadan da `npm run build` geçer; uygulama üstte "Supabase bağlantısı yapılandırılmamış" uyarısıyla açılır. `NEXT_PUBLIC_` değişkenleri derleme anında gömüldüğü için değişkenleri ekledikten sonra yeniden derleyin.

## Veritabanı migration'ları

Migration dosyaları `supabase/migrations` altında, sırayla çalıştırılmalıdır:

| Dosya | İçerik |
| --- | --- |
| `20260930000001_init.sql` | PostGIS, `profiles`, `loads`, tetikleyiciler (updated_at, profil telefonu, ilan bitiş süresi), indeksler |
| `20260930000002_rls.sql` | RLS politikaları ve kolon bazlı yetkiler |
| `20260930000003_removal_requests.sql` | KVKK kaldırma talepleri tablosu ve `resolve_removal_request` fonksiyonu |
| `20261001000001_nearby_loads.sql` | Aşama 2: `nearby_loads` RPC fonksiyonu (alım noktasına uzaklığa göre sıralı ilanlar) |

### Seçenek A: Supabase CLI ile (önerilen)

```bash
npx supabase login
npx supabase link --project-ref <proje-ref>
npx supabase db push
```

### Seçenek B: SQL Editor ile

Supabase Dashboard → SQL Editor'da dosyaların içeriğini yukarıdaki sırayla çalıştırın.

### Yerel Supabase

```bash
npx supabase init
npx supabase start
npx supabase db reset
npx supabase status
```

`supabase init` mevcut `supabase/migrations` klasörüne dokunmaz; `db reset` tüm migration'ları uygular. `status` çıktısındaki `API URL` ve `anon key` değerlerini `.env.local` dosyasına yazın.

## Telefon ile giriş (Phone OTP)

1. Dashboard → Authentication → Sign In / Providers → **Phone** sağlayıcısını açın.
2. "Enable phone signup" açık olsun, "Enable phone confirmations" açık kalabilir.
3. SMS'i Supabase'in yerleşik sağlayıcıları (Twilio, MessageBird vb.) yerine Netgsm üzerinden göndermek için aşağıdaki **Send SMS Hook** kurulumunu yapın. Hook etkinken Supabase SMS'i kendisi göndermez, üretilen kodu hook'a iletir.

Uygulama numarayı `+905XXXXXXXXX` biçimine çevirir; sadece Türkiye cep telefonları (`5` ile başlayan 10 hane) kabul edilir. Kullanıcı `0532 123 45 67`, `532 123 4567` veya `+90 532 123 45 67` yazabilir.

### Netgsm için Send SMS Hook kurulumu (adım adım)

Hazır Edge Function: `supabase/functions/send-sms/index.ts`. Supabase'den gelen isteğin imzasını Standard Webhooks ile doğrular, numarayı `905XXXXXXXXX` biçimine getirir ve Netgsm REST v2 `send` uç noktasına gönderir.

**1. Netgsm tarafı**

1. Netgsm panelinde onaylı bir **mesaj başlığınız** (gönderici adı) olsun, örn. `YUKBULMA`.
2. Panelden API yetkili bir **alt kullanıcı** oluşturun. Kullanıcı kodu (usercode) ve şifreyi not edin.
3. API kullanıcısında IP kısıtlaması varsa kapatın veya Edge Function çıkış IP'lerine izin verin; Supabase Edge Function IP'leri sabit değildir.
4. OTP için ayrı bir Netgsm OTP paketi kullanıyorsanız, Netgsm dokümanındaki OTP uç noktasını `NETGSM_API_URL` ile verebilirsiniz; istek gövdesi farklıysa fonksiyondaki `fetch` gövdesini ona göre uyarlayın.

**2. Fonksiyonu yayınlayın**

```bash
npx supabase functions deploy send-sms --no-verify-jwt
```

`--no-verify-jwt` gereklidir; Auth hook istekleri kullanıcı JWT'si taşımaz, güvenlik webhook imzasıyla sağlanır.

**3. Hook'u Dashboard'da oluşturun**

1. Dashboard → Authentication → **Auth Hooks** → **Add hook** → **Send SMS hook**.
2. Hook tipi olarak **HTTPS** seçin.
3. URL: `https://<proje-ref>.supabase.co/functions/v1/send-sms`
4. **Generate secret** ile bir gizli anahtar üretin ve kopyalayın (`v1,whsec_...` biçimindedir).
5. Hook'u kaydedip etkinleştirin.

**4. Fonksiyon gizli değişkenlerini girin**

```bash
npx supabase secrets set \
  SEND_SMS_HOOK_SECRET="v1,whsec_XXXXXXXX" \
  NETGSM_USERCODE="850XXXXXXX" \
  NETGSM_PASSWORD="api-sifreniz" \
  NETGSM_MSGHEADER="YUKBULMA" \
  SMS_APP_NAME="Yuk Bulma"
```

İsteğe bağlı: `NETGSM_API_URL` (varsayılan `https://api.netgsm.com.tr/sms/rest/v2/send`).

**5. Test edin**

- `/giris` sayfasında kendi numaranızı girin, SMS gelmeli.
- Hata olursa: Dashboard → Edge Functions → `send-sms` → Logs. Netgsm hatalarında `netgsm_error` satırı Netgsm'in döndürdüğü kodu gösterir.
- Fonksiyon; Netgsm `code` alanı `00` değilse Supabase'e 502 döner ve kullanıcı "SMS gönderilemedi" mesajı görür.

**Rate limit:** Dashboard → Authentication → Rate Limits bölümünden SMS limitlerini (saatlik SMS sayısı, OTP tekrar gönderme aralığı) ihtiyaca göre ayarlayın. Arayüz 60 saniyede bir yeniden gönderime izin verir.

### Geliştirme için test OTP numaraları

Gerçek SMS göndermeden geliştirme yapmak için:

**Bulut projede:** Dashboard → Authentication → Sign In / Providers → Phone → **Test Phone Numbers and OTPs** alanına `numara=kod` biçiminde ekleyin (numara `+` olmadan):

```
905551112233=123456
905554445566=654321
```

Bu numaralar için SMS gönderilmez, belirtilen kod her zaman geçerlidir. Test numaralarına bir son kullanma tarihi verilebilir; canlıya çıkmadan önce silin.

**Yerel Supabase'de:** `supabase/config.toml` dosyasında ilgili bölümlere ekleyin ve `npx supabase stop && npx supabase start` ile yeniden başlatın:

```toml
[auth.sms]
enable_signup = true
enable_confirmations = true

[auth.sms.test_otp]
905551112233 = "123456"
```

Yerel ortamda bir SMS sağlayıcısı etkin değilse CLI sürümüne göre telefonla kayıt reddedilebilir. Bu durumda `[auth.sms.twilio]` altında `enabled = true` ve sahte değerlerle bir sağlayıcı tanımlayın; test numaralarına SMS gönderilmediği için sahte değerler yeterlidir. Yerelde Netgsm hook'unu denemek isterseniz:

```toml
[auth.hook.send_sms]
enabled = true
uri = "http://host.docker.internal:54321/functions/v1/send-sms"
secrets = "env(SEND_SMS_HOOK_SECRET)"
```

ve `npx supabase functions serve send-sms --no-verify-jwt --env-file supabase/.env.local` ile fonksiyonu çalıştırın.

## Yerelde çalıştırma

```bash
npm run dev
```

Tarayıcıda `http://localhost:3000`. Mobil görünüm için tarayıcı geliştirici araçlarında cihaz modunu açın.

Diğer komutlar:

```bash
npm run build
npm run start
npm run lint
```

Service worker yalnızca production modunda (`npm run build && npm run start`) kaydolur.

## Aşama 2: Harita ve konuma göre sıralama

### Neler eklendi

- **Harita altyapısı:** Leaflet 1.9 + react-leaflet 5 + OpenStreetMap karoları. Harita bileşenleri istemci bileşeni içinden `next/dynamic` ile `ssr: false` yüklenir; sunucu tarafında Leaflet hiç çalışmaz. Varsayılan marker ikonları `leaflet/dist/images` altından import edilip `L.Icon.Default.mergeOptions` ile Next'in ürettiği `/_next/static/media/...` yollarına bağlanır (`src/components/map/leaflet-setup.ts`).
- **İlan detayı:** Alım (mavi) ve teslim (kırmızı) noktası işaretli harita, iki nokta arasında kesikli düz çizgi ve kuş uçuşu mesafe (km, haversine). Dış rota servisi kullanılmaz. Koordinat `pickup_point` / `delivery_point` kolonlarından okunur; boşsa il merkezi kullanılır.
- **İlanlar sayfası, Liste / Harita geçişi** (`?gorunum=harita`): Filtreyle eşleşen aktif ilanların alım noktaları haritada gösterilir (en yeni 500 ilan). Yakın noktalar `leaflet.markercluster` ile kümelenir; aynı ildeki ilanlar en yakın zoomda örümcek gibi açılır. İşarete dokununca haritanın altında özet kart ve "İlan detayına git" bağlantısı çıkar.
- **Bana en yakın yükler** (`?sirala=yakin`): Tarayıcıdan konum izni istenir; konum yalnızca tarayıcıdan doğrudan Supabase'e giden `nearby_loads` RPC isteğinin gövdesinde, yaklaşık 100 m'ye yuvarlanmış olarak kullanılır. Next sunucusuna, URL'ye, çereze veya veritabanına yazılmaz. İzin verilmezse ya da konum alınamazsa il seçilir (`&merkez=<plaka kodu>`) ve aynı sıralama il merkezi koordinatıyla yapılır. Her kartta "X km uzakta" görünür; alım noktası olmayan ilanlar en sonda "Mesafe bilinmiyor" ile listelenir.
- Nereden, nereye, araç tipi, tarih ve ton filtreleri liste, harita ve yakınlık sıralamasında aynı şekilde çalışır; 20'li sayfalama yakınlık sıralamasında da korunur (`&sayfa=2`). Filtre formu görünüm/sıralama seçimini gizli alanlarla taşır.

### Yeni migration'ı uygulama

`supabase/migrations/20261001000001_nearby_loads.sql` dosyası yalnızca bir fonksiyon ekler; tablo, RLS politikası veya kolon yetkisi değiştirmez.

```bash
npx supabase db push
```

veya Supabase Dashboard → SQL Editor'da dosya içeriğini çalıştırın. Ardından kontrol için:

```sql
select from_province, to_province, distance_km, total_count
from public.nearby_loads(41.0082, 28.9784, p_limit => 5);
```

Fonksiyonu ekledikten sonra PostgREST şema önbelleği genelde kendiliğinden yenilenir; RPC "function not found" hatası verirse SQL Editor'da `notify pgrst, 'reload schema';` çalıştırın.

### `nearby_loads` fonksiyonu

| Parametre | Tür | Açıklama |
| --- | --- | --- |
| `p_lat`, `p_lng` | double precision | Zorunlu. Sıralama merkezi (WGS84). Geçersizse `22023` hatası |
| `p_from_province`, `p_to_province` | smallint | İl plaka kodu filtresi |
| `p_vehicle_type` | text | Araç tipi; eşleşenler + `farketmez` ilanlar döner |
| `p_date_from`, `p_date_to` | date | Yükleme tarihi aralığı |
| `p_min_tons`, `p_max_tons` | numeric | Ağırlık aralığı |
| `p_limit`, `p_offset` | integer | Sayfalama; limit 1–50 arasına sıkıştırılır |

Döndürdüğü kolonlar herkese açık ilan kolonları + `distance_km` (alım noktasına kuş uçuşu, 0,1 km hassasiyet) + `total_count` (filtreye uyan toplam ilan). Güvenlik:

- `security invoker` çalışır; çağıranın RLS politikaları ve kolon yetkileri aynen uygulanır. Yalnızca aktif ve süresi dolmamış ilanlar döner.
- `contact_phone` ve `owner_id` dönüş tipinde yoktur ve fonksiyon içinde okunmaz; `anon` rolünün bu kolonlara erişimi yine yoktur.
- `execute` yetkisi `public`'ten alınıp yalnızca `anon`, `authenticated`, `service_role` rollerine verilir. `search_path` boştur, PostGIS fonksiyonları `extensions.` önekiyle çağrılır.

### Bilinen sınırlar

- Koordinatlar şimdilik il merkezidir (ilan formu ilçe koordinatı üretmez); aynı ildeki ilanlar haritada aynı noktada kümelenir, mesafe il merkezleri arasıdır.
- Harita görünümü filtreye uyan en yeni 500 ilanı gösterir; daha fazlası için filtre daraltılmalıdır.
- Karolar doğrudan `tile.openstreetmap.org` üzerinden gelir. OSM karo kullanım politikası yüksek trafik için uygun değildir; trafik artınca kendi karo sunucunuza veya ücretli bir sağlayıcıya geçin (`OSM_TILE_URL` sabiti).
- Konum izni yalnızca güvenli bağlamda (HTTPS veya `localhost`) çalışır.

## Güvenlik tasarımı

- **Telefon gizliliği sunucuda zorlanır.** `anon` rolünün `loads` tablosunda `contact_phone` ve `owner_id` kolonlarına `SELECT` yetkisi yoktur (kolon bazlı `GRANT`). Giriş yapmamış biri API'ye doğrudan `select=contact_phone` isteği atsa bile Postgres `permission denied` döner. Uygulama da giriş yoksa telefon kolonunu hiç sorgulamaz.
- `loads` RLS: herkes aktif ve süresi dolmamış ilanları görür; sahibi kendi ilanlarını her durumda görür. Kullanıcı yalnızca kendi adına ve `source = 'user'` ile ilan ekleyebilir; `source`, `source_group`, `expires_at`, `owner_id` gibi alanları güncelleyemez (kolon bazlı `UPDATE` yetkisi). Durumu yalnızca `active` / `found` yapabilir; `removed` yalnızca yönetim tarafından verilir.
- `profiles`: herkes yalnızca kendi profilini okur/yazar. `phone` alanı tetikleyiciyle `auth.users` tablosundan doldurulur, istemci değiştiremez. `kvkk_accepted_at` sunucu saatiyle yazılır.
- İlanın bitiş süresi (`expires_at`) tetikleyiciyle hesaplanır: `max(şimdi + 10 gün, yükleme tarihi + 2 gün)`. Yeniden yayınlamada veya tarih değişince yeniden hesaplanır.

## Aşama 3 hazırlığı: WhatsApp botu

Bot sunucu tarafında **service role** anahtarıyla bağlanır (RLS'i aşar). Örnek:

```ts
import { createClient } from "@supabase/supabase-js";
import { getProvince, provincePointEWKT } from "./src/lib/data/provinces";

const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

await admin.from("loads").upsert(
  {
    source: "whatsapp",
    source_group: "Ankara Yük Grubu",
    source_message_id: "wamid.XXXX",
    owner_id: null,
    from_province_code: 6,
    from_province: getProvince(6)!.name,
    to_province_code: 34,
    to_province: getProvince(34)!.name,
    pickup_point: provincePointEWKT(6),
    delivery_point: provincePointEWKT(34),
    cargo_type: "Dökme",
    weight_tons: 25,
    vehicle_type: "farketmez",
    load_date: "2026-10-02",
    contact_phone: "+905321234567",
  },
  { onConflict: "source_group,source_message_id", ignoreDuplicates: true },
);
```

- `source = 'whatsapp'` için `source_group` zorunludur, `owner_id` boş olabilir.
- `(source_group, source_message_id)` üzerinde kısmi benzersiz indeks olduğu için aynı mesaj iki kez eklenmez.
- Bot isterse `expires_at` değerini kendisi verebilir; vermezse tetikleyici hesaplar.

## KVKK kaldırma talepleri

WhatsApp kaynaklı ilanların detay sayfasında "Bu ilanı kaldır" bağlantısı `/ilanlar/<id>/kaldir` formuna gider. Giriş gerekmez; talep `removal_requests` tablosuna `pending` olarak düşer. Aynı ilan + telefon için bekleyen ikinci talep engellenir.

Talepleri SQL Editor'dan görüp sonuçlandırın:

```sql
select r.*, l.from_province, l.to_province, l.source_group
from public.removal_requests r
left join public.loads l on l.id = r.load_id
where r.status = 'pending'
order by r.created_at;

select public.resolve_removal_request('<talep-id>', true);
select public.resolve_removal_request('<talep-id>', false);
```

Onaylanan talepte ilan `removed` durumuna geçer ve listeden kalkar. Fonksiyon yalnızca `service_role` (ve SQL Editor'daki `postgres`) tarafından çalıştırılabilir.

## Dosya yapısı

```
src/
  app/
    actions/            sunucu aksiyonları (auth, profile, loads, removal)
    auth/devam/         giriş sonrası profil kontrolü ve yönlendirme
    giris/              telefon + OTP formu
    profil/             profil oluşturma/düzenleme
    ilan-ver/           yeni ilan
    ilanlar/            liste, [id] detay, [id]/kaldir KVKK formu
    ilanlarim/          kendi ilanları, [id]/duzenle
    kvkk/               aydınlatma metni
    offline/            PWA çevrimdışı sayfası
    pwa-icon/[size]/    PWA ikonları (192, 512)
    manifest.ts
  components/           header, ilan kartı, ilan formu, sayfalama, rozet, yakındaki ilanlar
    map/                Leaflet kurulum, güzergâh haritası, kümelemeli ilan haritası
  lib/
    data/provinces.ts   81 il plaka kodu + merkez koordinatı
    data/options.ts     araç tipleri, roller, yük türü önerileri
    supabase/           sunucu, tarayıcı ve proxy istemcileri
    geo.ts              koordinat ayrıştırma (EWKB/GeoJSON/WKT), haversine, km biçimi
    load-filters.ts     ilan filtreleri: okuma, doğrulama, sorguya ve RPC'ye uygulama
    auth.ts phone.ts validation.ts loads.ts
  proxy.ts              oturum yenileme (Next.js 16'da middleware yerine)
supabase/
  migrations/           SQL migration'lar
  functions/send-sms/   Netgsm Send SMS Hook Edge Function
public/sw.js            service worker
```
