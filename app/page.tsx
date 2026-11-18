import { formatPrice, services } from "./lib/booking/catalog";

function ScissorsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" fill="none" className="h-12 w-12">
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="36" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="m17 16 25 25M17 32 42 7M20 24h8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <div className="shell header-inner">
          <a className="brand" href="#anasayfa" aria-label="BarberBook ana sayfa">
            <span className="brand-mark">B<span>.</span></span>
            <span className="brand-name">BARBER<span>BOOK</span></span>
          </a>
          <nav className="desktop-nav" aria-label="Ana gezinme">
            <a href="#hizmetler">Hizmetler</a>
            <a href="#hakkimizda">Hakkımızda</a>
            <a href="#iletisim">İletişim</a>
            <a className="button button-small" href="/randevu">Randevu Al <span aria-hidden="true">↗</span></a>
          </nav>
          <details className="mobile-nav">
            <summary aria-label="Menüyü aç veya kapat"><span></span><span></span></summary>
            <nav aria-label="Mobil gezinme">
              <a href="#hizmetler">Hizmetler</a>
              <a href="#hakkimizda">Hakkımızda</a>
              <a href="#iletisim">İletişim</a>
              <a className="button" href="/randevu">Randevu Al <span aria-hidden="true">↗</span></a>
            </nav>
          </details>
        </div>
      </header>

      <section className="hero shell" id="anasayfa">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line"></span> KENDİNİZE AYIRDIĞINIZ ZAMAN</p>
          <h1>Tarzınız,<br />ustalıkla <em>şekillenir.</em></h1>
          <p className="hero-description">İyi bir kesim küçük bir detay değildir. BarberBook’ta kişisel stil, özenli ustalık ve zamansız bir berber deneyimi bir araya gelir.</p>
          <div className="hero-actions">
            <a className="button" href="/randevu">Randevu Al <span aria-hidden="true">↗</span></a>
            <a className="text-link" href="#hizmetler">Hizmetleri keşfet <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-note"><span className="note-dot"></span> Özenli hizmet. Zamansız stil.</div>
        </div>

        <div className="hero-art" role="img" aria-label="Berber koltuğu ve ustalık aletlerinden oluşan dekoratif illüstrasyon">
          <div className="art-topline"><span>BARBERBOOK · EST. WITH CARE</span><span>001 / BB</span></div>
          <div className="art-orbit orbit-one"></div><div className="art-orbit orbit-two"></div>
          <div className="art-sun"></div>
          <div className="art-chair">
            <div className="chair-head"></div><div className="chair-back"></div><div className="chair-seat"></div>
            <div className="chair-arm arm-left"></div><div className="chair-arm arm-right"></div>
            <div className="chair-stem"></div><div className="chair-base"></div>
          </div>
          <div className="art-tool tool-one"></div><div className="art-tool tool-two"></div>
          <div className="art-caption"><span>USTALIK, HER DETAYDA.</span><span className="caption-index">EST. 2024</span></div>
          <div className="art-corner">✳</div>
        </div>
      </section>

      <div className="ticker" aria-label="BerberBook hizmet ilkeleri">
        <div className="ticker-track"><span>ÖZENLİ USTALIK</span><i>✳</i><span>KİŞİSEL STİL</span><i>✳</i><span>ZAMANSIZ BAKIM</span><i>✳</i><span>ÖZENLİ USTALIK</span><i>✳</i><span>KİŞİSEL STİL</span><i>✳</i><span>ZAMANSIZ BAKIM</span><i>✳</i></div>
      </div>

      <section className="services-section section-pad" id="hizmetler">
        <div className="shell">
          <div className="section-heading">
            <div><p className="eyebrow"><span className="eyebrow-line"></span> MENÜMÜZ</p><h2>İyi hissettiren<br /><em>dokunuşlar.</em></h2></div>
            <p className="section-intro">İhtiyacınıza uygun hizmeti seçin. Her randevuda aynı özen, her detayda size göre bir yaklaşım.</p>
          </div>
          <div className="service-grid">
            {services.map((service) => (
              <article className={`service-card ${service.id === "complete-care" ? "service-card-campaign" : ""}`} key={service.number}>
                <div className="service-card-top"><span>{service.number}</span><span className="service-arrow" aria-hidden="true">↗</span></div>
                {service.id === "complete-care" && <span className="campaign-label home-campaign-label">Kampanyalı Paket</span>}
                <h3>{service.name}</h3><p>{service.description}</p>
                <div className="service-price"><span>{service.durationMinutes} DK</span><strong>{formatPrice(service.priceTry)}</strong></div>
              </article>
            ))}
          </div>
          <p className="price-note">Fiyatlar bilgilendirme amaçlıdır.</p>
        </div>
      </section>

      <section className="about-section section-pad" id="hakkimizda">
        <div className="shell about-layout">
          <div className="about-emblem"><div className="emblem-ring"><ScissorsIcon /><span>BARBERBOOK · USTALIK · STİL · BAKIM ·</span></div><span className="emblem-number">01</span></div>
          <div className="about-copy"><p className="eyebrow"><span className="eyebrow-line"></span> HAKKIMIZDA</p><h2>İyi stil,<br /><em>iyi hissetmekle</em><br />başlar.</h2><p>BarberBook, berber deneyimini daha kişisel ve özenli kılma fikriyle doğdu. Her hizmette profesyonel yaklaşımı, dikkatli işçiliği ve kendinize ayırdığınız zamana duyulan saygıyı ön planda tutuyoruz.</p><a className="text-link" href="#hizmetler">Hizmetlerimizi inceleyin <span aria-hidden="true">→</span></a></div>
        </div>
      </section>

      <section className="booking-section" id="randevu">
        <div className="shell booking-inner"><div><p className="eyebrow"><span className="eyebrow-line"></span> RANDEVU ÖNİZLEMESİ</p><h2>Bir sonraki iyi<br /><em>kesiminiz</em> için.</h2><p>Berberinizi ve hizmetinizi seçerek randevu akışını keşfedin. Bu önizleme randevu kaydetmez.</p><a className="button booking-home-cta" href="/randevu">Akışı Görüntüle <span aria-hidden="true">↗</span></a></div><span className="booking-seal">BB<br /><i>✳</i></span></div>
      </section>

      <footer className="site-footer" id="iletisim">
        <div className="shell footer-main">
          <div className="footer-brand"><a className="brand" href="#anasayfa"><span className="brand-mark">B<span>.</span></span><span className="brand-name">BARBER<span>BOOK</span></span></a><p>Özenli ustalık. Zamansız stil.</p></div>
          <div className="footer-column"><h2>KEŞFEDİN</h2><a href="#hizmetler">Hizmetler</a><a href="#hakkimizda">Hakkımızda</a><a href="/randevu">Randevu önizlemesi</a></div>
          <div className="footer-column"><h2>İLETİŞİM</h2><p>İletişim bilgileri yakında paylaşılacaktır.</p><span>Adres ve telefon bilgisi henüz belirlenmedi.</span></div>
          <a className="back-top" href="#anasayfa" aria-label="Sayfanın başına dön">↑</a>
        </div>
        <div className="shell footer-bottom"><span>© 2026 BARBERBOOK</span><span>İYİ BİR GÜN, İYİ BİR KESİMLE BAŞLAR.</span><span>İSTANBUL · TÜRKİYE</span></div>
      </footer>
    </main>
  );
}
