import type { Metadata } from "next";

export const metadata: Metadata = { title: "KVKK Aydınlatma Metni" };

export default function KvkkPage() {
  return (
    <article className="card space-y-4 text-sm leading-relaxed text-slate-700">
      <h1 className="text-xl font-bold text-slate-900">Kişisel Verilerin Korunması Aydınlatma Metni</h1>
      <p>
        Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) madde 10 uyarınca, Yük Bulma
        platformunu (&quot;Platform&quot;) kullanan kişilere, kişisel verilerinin hangi amaçla ve nasıl işlendiği hakkında
        bilgi vermek amacıyla hazırlanmıştır.
      </p>

      <section>
        <h2 className="font-semibold text-slate-900">1. Veri sorumlusu</h2>
        <p>
          Kişisel verileriniz, veri sorumlusu sıfatıyla Platform işletmecisi tarafından işlenmektedir. İletişim bilgileri
          yayına alınmadan önce bu bölüme eklenecektir.
        </p>
      </section>

      <section>
        <h2 className="font-semibold text-slate-900">2. İşlenen kişisel veriler</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Kimlik: ad soyad</li>
          <li>İletişim: cep telefonu numarası, ilanlarda paylaşılan iletişim telefonu</li>
          <li>Araç bilgisi: araç tipi, plaka (isteğe bağlı)</li>
          <li>İlan bilgileri: güzergah, yük türü, ağırlık, tarih, fiyat, açıklama</li>
          <li>İşlem güvenliği: giriş kayıtları, IP adresi, oturum bilgileri</li>
        </ul>
      </section>

      <section>
        <h2 className="font-semibold text-slate-900">3. İşleme amaçları</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Telefon numarası ile üyelik oluşturulması ve SMS doğrulama kodu gönderilmesi</li>
          <li>Yük ilanlarının yayınlanması ve araç sahipleri ile yük sahiplerinin iletişime geçmesinin sağlanması</li>
          <li>Kötüye kullanımın önlenmesi, bilgi güvenliğinin sağlanması</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi ve yetkili mercilerin taleplerinin karşılanması</li>
        </ul>
      </section>

      <section>
        <h2 className="font-semibold text-slate-900">4. Hukuki sebepler</h2>
        <p>
          Kişisel verileriniz KVKK madde 5/2 kapsamında; bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması,
          veri sorumlusunun hukuki yükümlülüğünü yerine getirmesi, ilgili kişinin kendisi tarafından alenileştirilmiş
          olması ve temel hak ve özgürlüklerinize zarar vermemek kaydıyla meşru menfaat hukuki sebeplerine dayanılarak
          işlenir.
        </p>
      </section>

      <section>
        <h2 className="font-semibold text-slate-900">5. WhatsApp gruplarından alınan ilanlar</h2>
        <p>
          Platformda bazı ilanlar, herkese açık lojistik WhatsApp gruplarında ilan sahibi tarafından alenileştirilmiş
          içeriklerden derlenir ve &quot;WhatsApp grubundan alındı&quot; rozeti ile gösterilir. Bu ilanlarda yer alan
          telefon numarası yalnızca giriş yapmış kullanıcılara gösterilir. İlan size aitse ilan sayfasındaki &quot;Bu
          ilanı kaldır&quot; bağlantısı ile yayından kaldırılmasını talep edebilirsiniz.
        </p>
      </section>

      <section>
        <h2 className="font-semibold text-slate-900">6. Aktarım</h2>
        <p>
          Kişisel verileriniz; SMS doğrulama hizmeti sağlayıcısına (yalnızca telefon numarası ve doğrulama kodu),
          barındırma ve veritabanı hizmeti sağlayıcılarına ve talep halinde yetkili kamu kurum ve kuruluşlarına, işleme
          amaçlarıyla sınırlı olarak aktarılabilir. Barındırma hizmetinin yurt dışında bulunması halinde aktarım KVKK
          madde 9&apos;a uygun şekilde gerçekleştirilir.
        </p>
      </section>

      <section>
        <h2 className="font-semibold text-slate-900">7. Saklama süresi</h2>
        <p>
          İlanlar yayın süresi sona erdikten sonra makul bir süre, üyelik bilgileri üyelik devam ettiği sürece saklanır;
          süre sonunda silinir, yok edilir veya anonim hale getirilir.
        </p>
      </section>

      <section>
        <h2 className="font-semibold text-slate-900">8. Haklarınız</h2>
        <p>
          KVKK madde 11 uyarınca; kişisel verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, işlenme amacını
          öğrenme, aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini, silinmesini veya yok
          edilmesini isteme, itiraz etme ve zarara uğramanız halinde tazminat talep etme haklarına sahipsiniz. Başvurularınızı
          veri sorumlusunun iletişim adresine iletebilirsiniz.
        </p>
      </section>

      <p className="text-xs text-slate-500">
        Bu metin taslak niteliğindedir; yayına alınmadan önce hukuk danışmanı tarafından gözden geçirilmelidir.
      </p>
    </article>
  );
}
