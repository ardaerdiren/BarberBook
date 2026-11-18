"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { barbers, formatDuration, formatPrice, services } from "../lib/booking/catalog";

const stepNames = ["Berber", "Hizmet", "Tarih", "Saat", "Bilgiler", "Özet"];
const stepHints = [
  "Bir berber seçin.",
  "Size uygun hizmeti belirleyin.",
  "Randevu için bir tarih seçin.",
  "Uygun olduğunu düşündüğünüz bir başlangıç saati seçin.",
  "Önizleme için iletişim bilgilerinizi girin.",
  "Seçimlerinizi gözden geçirin.",
];

type BookingDraft = {
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
  name: string;
  phone: string;
};

const initialDraft: BookingDraft = { barberId: "", serviceId: "", date: "", time: "", name: "", phone: "" };

function localDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createTimeSlots(durationMinutes: number) {
  const startOfDay = 8 * 60;
  const endOfDay = 20 * 60;
  const slots: string[] = [];

  for (let minutes = startOfDay; minutes + durationMinutes <= endOfDay; minutes += 10) {
    slots.push(`${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`);
  }

  return slots;
}

function getPhoneError(phone: string) {
  const trimmed = phone.trim();
  if (!trimmed) return "Telefon numarası zorunludur.";
  if (!/^\+?[\d\s()-]+$/.test(trimmed)) return "Telefon numarasında yalnızca rakam, boşluk, +, parantez ve tire kullanın.";
  const digitCount = trimmed.replace(/\D/g, "").length;
  if (digitCount < 10 || digitCount > 15) return "Telefon numarası 10–15 rakam arasında olmalıdır.";
  return "";
}

export default function BookingFlow() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<BookingDraft>(initialDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const selectedBarber = barbers.find((barber) => barber.id === draft.barberId);
  const selectedService = services.find((service) => service.id === draft.serviceId);
  const timeSlots = useMemo(
    () => selectedService ? createTimeSlots(selectedService.durationMinutes) : [],
    [selectedService],
  );

  function select<K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) {
    setDraft((current) => ({
      ...current,
      [key]: value,
      ...(key === "barberId" || key === "serviceId" || key === "date" ? { time: "" } : {}),
    }));
    setErrors((current) => ({ ...current, [key]: "", time: "" }));
  }

  function validateCurrentStep() {
    const nextErrors: Record<string, string> = {};
    if (step === 0 && !draft.barberId) nextErrors.barberId = "Devam etmek için bir berber seçin.";
    if (step === 1 && !draft.serviceId) nextErrors.serviceId = "Devam etmek için bir hizmet seçin.";
    if (step === 2) {
      if (!draft.date) nextErrors.date = "Lütfen bir tarih seçin.";
      else if (draft.date < localDateValue(new Date())) nextErrors.date = "Geçmiş bir tarih seçilemez.";
    }
    if (step === 3 && !draft.time) nextErrors.time = "Devam etmek için bir saat seçin.";
    if (step === 4) {
      if (!draft.name.trim()) nextErrors.name = "Ad alanı zorunludur.";
      const phoneError = getPhoneError(draft.phone);
      if (phoneError) nextErrors.phone = phoneError;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function goForward(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!validateCurrentStep()) return;
    setStep((current) => Math.min(current + 1, stepNames.length - 1));
  }

  function goBack() {
    setErrors({});
    setStep((current) => Math.max(current - 1, 0));
  }

  function changeDate(value: string) {
    if (value && value < localDateValue(new Date())) {
      select("date", "");
      setErrors((current) => ({ ...current, date: "Geçmiş bir tarih seçilemez." }));
      return;
    }
    select("date", value);
  }

  return (
    <main className="booking-page">
      <header className="site-header">
        <div className="shell header-inner">
          <Link className="brand" href="/" aria-label="BarberBook ana sayfa">
            <span className="brand-mark">B<span>.</span></span>
            <span className="brand-name">BARBER<span>BOOK</span></span>
          </Link>
          <Link className="booking-back-home" href="/">← Ana sayfaya dön</Link>
        </div>
      </header>

      <div className="booking-shell">
        <div className="booking-heading">
          <p className="eyebrow"><span className="eyebrow-line"></span> BARBERBOOK · RANDEVU</p>
          <h1>Size göre bir <em>zaman.</em></h1>
          <p>Berberinizi ve hizmetinizi seçerek randevu önizlemesi oluşturun.</p>
        </div>

        <aside className="booking-preview-notice" aria-label="Önizleme hakkında bilgi">
          <span aria-hidden="true">✳</span>
          <p><strong>Önizleme modu</strong> · Gösterilen saatler örnek amaçlıdır; kayıtlı randevu verisiyle doğrulanmaz. Bu akış randevu kaydetmez veya rezervasyon onayı oluşturmaz.</p>
        </aside>

        <section className="booking-panel" aria-label="Randevu önizleme adımları">
          <ol className="booking-steps" aria-label="Randevu adımları">
            {stepNames.map((name, index) => (
              <li className={index === step ? "active" : index < step ? "complete" : ""} key={name} aria-current={index === step ? "step" : undefined}>
                <span className="step-number">{index < step ? "✓" : `0${index + 1}`}</span>
                <span className="step-name">{name}</span>
              </li>
            ))}
          </ol>

          <form className="booking-content" onSubmit={goForward} noValidate>
            <div className="booking-step-heading">
              <div><span className="booking-step-count">ADIM 0{step + 1} / 06</span><h2>{step === 5 ? "Seçimlerinizi kontrol edin" : stepNames[step]}</h2></div>
              <p>{stepHints[step]}</p>
            </div>

            {step === 0 && <fieldset className="choice-grid barber-grid"><legend className="visually-hidden">Berber seçin</legend>
              {barbers.map((barber, index) => <button type="button" role="radio" aria-checked={draft.barberId === barber.id} className={`choice-card barber-choice ${draft.barberId === barber.id ? "selected" : ""}`} key={barber.id} onClick={() => select("barberId", barber.id)}><span className="choice-index">BERBER · 0{index + 1}</span><span className="barber-avatar" aria-hidden="true">{barber.name.slice(-1)}</span><strong>{barber.name}</strong><span className="choice-detail">Usta berber</span></button>)}
            </fieldset>}

            {step === 1 && <fieldset className="choice-grid service-choice-grid"><legend className="visually-hidden">Hizmet seçin</legend>
              {services.map((service) => <button type="button" role="radio" aria-checked={draft.serviceId === service.id} className={`choice-card service-choice ${draft.serviceId === service.id ? "selected" : ""}`} key={service.id} onClick={() => select("serviceId", service.id)}><span className="choice-index">HİZMET · {service.number}</span><strong>{service.name}</strong><span className="choice-detail">{formatDuration(service.durationMinutes)}</span><span className="choice-price">{formatPrice(service.priceTry)}</span></button>)}
            </fieldset>}

            {step === 2 && <div className="date-step"><label htmlFor="booking-date">Randevu tarihi</label><input id="booking-date" type="date" value={draft.date} aria-invalid={Boolean(errors.date)} aria-describedby={errors.date ? "date-error" : "date-help"} onChange={(event) => changeDate(event.target.value)} /><p id={errors.date ? "date-error" : "date-help"} className={errors.date ? "field-error" : "field-help"}>{errors.date || "Geçmiş günler seçilemez. Tarihler yerel takvim gününe göredir."}</p></div>}

            {step === 3 && <div className="time-step"><div className="preview-day"><span>{draft.date}</span><span>{selectedBarber?.name} · {selectedService ? formatDuration(selectedService.durationMinutes) : ""}</span></div><p className="field-help">08:00–20:00 çalışma aralığı · 10 dakikalık başlangıç aralıkları</p><div className="time-grid" role="radiogroup" aria-label="Örnek başlangıç saati">
              {timeSlots.map((slot) => <button type="button" role="radio" aria-checked={draft.time === slot} className={`time-option ${draft.time === slot ? "selected" : ""}`} key={slot} onClick={() => select("time", slot)}>{slot}</button>)}
            </div>{errors.time && <p className="field-error" role="alert">{errors.time}</p>}<p className="time-disclaimer">Saatler yalnızca süre ve çalışma saati kurallarıyla oluşturulan örnek seçeneklerdir; berberin gerçek takvimi kontrol edilmez.</p></div>}

            {step === 4 && <div className="customer-fields"><div className="field-group"><label htmlFor="customer-name">Ad soyad</label><input id="customer-name" name="name" type="text" autoComplete="name" maxLength={100} value={draft.name} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} onChange={(event) => select("name", event.target.value)} placeholder="Adınızı yazın" />{errors.name && <p id="name-error" className="field-error" role="alert">{errors.name}</p>}</div><div className="field-group"><label htmlFor="customer-phone">Telefon numarası</label><input id="customer-phone" name="tel" type="tel" inputMode="tel" autoComplete="tel" maxLength={24} value={draft.phone} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : "phone-help"} onChange={(event) => select("phone", event.target.value)} placeholder="+90 5__ ___ __ __" /><p id={errors.phone ? "phone-error" : "phone-help"} className={errors.phone ? "field-error" : "field-help"}>{errors.phone || "Önizleme için girilir; bilgiler kaydedilmez."}</p></div></div>}

            {step === 5 && <div className="summary-card"><div className="summary-notice">Bu, kaydedilmeyen bir randevu önizlemesidir.</div><dl><div><dt>Berber</dt><dd>{selectedBarber?.name}</dd></div><div><dt>Hizmet</dt><dd>{selectedService?.name}</dd></div><div><dt>Süre</dt><dd>{selectedService ? formatDuration(selectedService.durationMinutes) : ""}</dd></div><div><dt>Fiyat</dt><dd className="summary-price">{selectedService ? formatPrice(selectedService.priceTry) : ""}</dd></div><div><dt>Tarih</dt><dd>{draft.date}</dd></div><div><dt>Saat</dt><dd>{draft.time}–{selectedService ? (() => { const [hours, minutes] = draft.time.split(":").map(Number); const end = hours * 60 + minutes + selectedService.durationMinutes; return `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`; })() : ""}</dd></div><div><dt>Müşteri</dt><dd>{draft.name}</dd></div><div><dt>Telefon</dt><dd>{draft.phone}</dd></div></dl></div>}

            <div className="booking-controls">{step > 0 ? <button type="button" className="booking-previous" onClick={goBack}>← <span>Geri</span></button> : <span></span>}{step < stepNames.length - 1 && <button type="submit" className="button booking-next">{step === 4 ? "Özeti Görüntüle" : "Devam Et"} <span aria-hidden="true">→</span></button>}</div>
          </form>
        </section>
        <p className="booking-footer-note">Bu önizleme randevu oluşturmaz. Gerçek randevu kaydı bu aşamanın kapsamında değildir.</p>
      </div>
    </main>
  );
}
