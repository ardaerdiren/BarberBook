"use client";

import Link from "next/link";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
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
type CalendarMonth = { year: number; month: number };

const initialDraft: BookingDraft = { barberId: "", serviceId: "", date: "", time: "", name: "", phone: "" };
const sampleAppointment = {
  barberId: "barber-1",
  date: "2026-12-10",
  start: "15:20",
  end: "15:50",
  serviceId: "haircut",
};
const weekdays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

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
  if (!phone) return "Telefon numarası zorunludur.";
  if (!/^5\d{9}$/.test(phone)) return "+90'dan sonra 5 ile başlayan 10 rakam girin.";
  return "";
}

function formatNationalPhone(digits: string) {
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
}

function caretAfterDigitCount(formatted: string, digitCount: number) {
  if (digitCount === 0) return 0;
  let seen = 0;
  for (let index = 0; index < formatted.length; index += 1) {
    if (/\d/.test(formatted[index])) seen += 1;
    if (seen === digitCount) return index + 1;
  }
  return formatted.length;
}

function capitalizeName(value: string) {
  return value.replace(/^\s+/, "").replace(/(^|\s)(\S)/gu, (_, spacing: string, letter: string) => `${spacing}${letter.toLocaleUpperCase("tr-TR")}`);
}

function displayDate(dateValue: string) {
  if (!dateValue) return "";
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(year, month - 1, day));
}

export default function BookingFlow() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<BookingDraft>(initialDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [today, setToday] = useState("");
  const [calendarMonth, setCalendarMonth] = useState<CalendarMonth>({ year: 2000, month: 0 });
  const selectedBarber = barbers.find((barber) => barber.id === draft.barberId);
  const selectedService = services.find((service) => service.id === draft.serviceId);
  const timeSlots = useMemo(
    () => selectedService ? createTimeSlots(selectedService.durationMinutes) : [],
    [selectedService],
  );
  const calendarCells = useMemo(() => {
    const { year, month } = calendarMonth;
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return [...Array<number | null>(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  }, [calendarMonth]);

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
      else if (today && draft.date < today) nextErrors.date = "Geçmiş bir tarih seçilemez.";
    }
    if (step === 3 && !draft.time) nextErrors.time = "Devam etmek için bir saat seçin.";
    if (step === 4) {
      const nameParts = draft.name.trim().split(/\s+/).filter(Boolean);
      if (nameParts.length === 0) nextErrors.name = "Ad ve soyad alanı zorunludur.";
      else if (nameParts.length < 2) nextErrors.name = "Lütfen soyadınızı da girin.";
      const phoneError = getPhoneError(draft.phone);
      if (phoneError) nextErrors.phone = phoneError;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function goForward(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!validateCurrentStep()) return;
    if (step === 1) {
      const now = new Date();
      const todayValue = localDateValue(now);
      setToday(todayValue);
      if (!draft.date) setCalendarMonth({ year: now.getFullYear(), month: now.getMonth() });
    }
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
    if (value) {
      const [year, month] = value.split("-").map(Number);
      setCalendarMonth({ year, month: month - 1 });
    }
  }

  function changeName(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    const formatted = capitalizeName(input.value);
    const formattedStart = capitalizeName(input.value.slice(0, start)).length;
    const formattedEnd = capitalizeName(input.value.slice(0, end)).length;
    select("name", formatted);
    requestAnimationFrame(() => {
      input.setSelectionRange(formattedStart, formattedEnd);
    });
  }

  function finishName() {
    select("name", draft.name.trim());
  }

  function changePhone(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const caret = input.selectionStart ?? input.value.length;
    const digitsBeforeCaret = input.value.slice(0, caret).replace(/\D/g, "").length;
    const digits = input.value.replace(/\D/g, "").slice(0, 10);
    const formatted = formatNationalPhone(digits);
    select("phone", digits);
    requestAnimationFrame(() => {
      input.setSelectionRange(caretAfterDigitCount(formatted, Math.min(digitsBeforeCaret, digits.length)), caretAfterDigitCount(formatted, Math.min(digitsBeforeCaret, digits.length)));
    });
  }

  function isOccupied(slot: string) {
    if (draft.barberId !== sampleAppointment.barberId || draft.date !== sampleAppointment.date || !selectedService) return false;
    const toMinutes = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };
    const candidateStart = toMinutes(slot);
    const candidateEnd = candidateStart + selectedService.durationMinutes;
    return candidateStart < toMinutes(sampleAppointment.end) && candidateEnd > toMinutes(sampleAppointment.start);
  }

  function chooseCalendarDate(day: number) {
    const value = `${calendarMonth.year}-${String(calendarMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    changeDate(value);
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

            {step === 0 && <fieldset role="radiogroup" className="choice-grid barber-grid"><legend className="visually-hidden">Berber seçin</legend>
              {barbers.map((barber, index) => <button type="button" role="radio" aria-checked={draft.barberId === barber.id} className={`choice-card barber-choice ${draft.barberId === barber.id ? "selected" : ""}`} key={barber.id} onClick={() => select("barberId", barber.id)}><span className="choice-index">BERBER · 0{index + 1}</span><span className="barber-avatar" aria-hidden="true">{barber.name.slice(-1)}</span><strong>{barber.name}</strong><span className="choice-detail">Usta berber</span></button>)}
            </fieldset>}

            {step === 1 && <fieldset role="radiogroup" className="choice-grid service-choice-grid"><legend className="visually-hidden">Hizmet seçin</legend>
              {services.map((service) => <button type="button" role="radio" aria-checked={draft.serviceId === service.id} className={`choice-card service-choice ${draft.serviceId === service.id ? "selected" : ""} ${service.id === "complete-care" ? "campaign-choice" : ""}`} key={service.id} onClick={() => select("serviceId", service.id)}><span className="choice-index">HİZMET · {service.number}</span>{service.id === "complete-care" && <span className="campaign-label">Kampanyalı Paket</span>}<strong>{service.name}</strong><span className="choice-detail">{formatDuration(service.durationMinutes)}</span><span className="choice-price">{formatPrice(service.priceTry)}</span></button>)}
            </fieldset>}

            {step === 2 && <div className="calendar-step"><div className="calendar-head"><button type="button" aria-label="Önceki ay" disabled={Boolean(today && calendarMonth.year === Number(today.slice(0, 4)) && calendarMonth.month === Number(today.slice(5, 7)) - 1)} onClick={() => setCalendarMonth((month) => { const previous = new Date(month.year, month.month - 1, 1); return { year: previous.getFullYear(), month: previous.getMonth() }; })}>←</button><h3>{new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(new Date(calendarMonth.year, calendarMonth.month, 1))}</h3><button type="button" aria-label="Sonraki ay" onClick={() => setCalendarMonth((month) => { const next = new Date(month.year, month.month + 1, 1); return { year: next.getFullYear(), month: next.getMonth() }; })}>→</button></div><div className="calendar-grid" role="group" aria-label="Tarih seçimi">{weekdays.map((day) => <span className="calendar-weekday" key={day}>{day}</span>)}{calendarCells.map((day, index) => day === null ? <span className="calendar-empty" key={`empty-${index}`} aria-hidden="true"></span> : (() => { const dateValue = `${calendarMonth.year}-${String(calendarMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`; const isPast = Boolean(today && dateValue < today); const isSelected = draft.date === dateValue; const isToday = Boolean(today && dateValue === today); return <button type="button" aria-pressed={isSelected} aria-label={displayDate(dateValue)} disabled={isPast} className={`calendar-day ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`} key={dateValue} onClick={() => chooseCalendarDate(day)}>{day}</button>; })())}</div><p id={errors.date ? "date-error" : "date-help"} className={errors.date ? "field-error" : "field-help"}>{errors.date || (draft.date ? `Seçilen tarih: ${displayDate(draft.date)}` : "Geçmiş günler seçilemez. Takvimden bir gün seçin.")}</p></div>}

            {step === 3 && <div className="time-step"><div className="preview-day"><span>{displayDate(draft.date)}</span><span>{selectedBarber?.name} · {selectedService ? formatDuration(selectedService.durationMinutes) : ""}</span></div><p className="field-help">08:00–20:00 çalışma aralığı · 10 dakikalık başlangıç aralıkları</p><div className="availability-test-note"><strong>Test / önizleme doluluğu</strong><span>Berber 1 · 10 Aralık 2026 · Saç Kesimi · 15:20–15:50</span><span>Yalnızca bu berber ve tarihte örnek olarak uygulanır; gerçek rezervasyon değildir.</span></div><div className="time-grid" role="radiogroup" aria-label="Örnek başlangıç saati">
              {timeSlots.map((slot) => { const occupied = isOccupied(slot); const hourStart = slot.endsWith(":00"); return <button type="button" role="radio" aria-checked={draft.time === slot} aria-disabled={occupied} disabled={occupied} title={occupied ? "Test verisindeki randevuyla çakışıyor" : undefined} className={`time-option ${hourStart ? "hour-start" : ""} ${occupied ? "occupied" : ""} ${draft.time === slot ? "selected" : ""}`} key={slot} onClick={() => select("time", slot)}>{slot}</button>; })}
            </div><div className="time-legend"><span><i className="legend-hour"></i> Tam saat</span><span><i className="legend-occupied"></i> Test verisinde dolu</span></div>{errors.time && <p className="field-error" role="alert">{errors.time}</p>}<p className="time-disclaimer">Diğer saatler yalnızca süre ve çalışma saati kurallarıyla oluşturulan örnek seçeneklerdir; gerçek takvim kontrol edilmez.</p></div>}

            {step === 4 && <div className="customer-fields"><div className="field-group"><label htmlFor="customer-name">Ad ve soyad</label><input id="customer-name" name="name" type="text" autoComplete="name" maxLength={100} value={draft.name} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} onChange={changeName} onBlur={finishName} placeholder="Adınızı ve soyadınızı yazın" />{errors.name && <p id="name-error" className="field-error" role="alert">{errors.name}</p>}</div><div className="field-group"><label htmlFor="customer-phone">Telefon numarası</label><div className="phone-input-wrap"><span className="phone-prefix" aria-hidden="true">+90</span><input id="customer-phone" name="tel-national" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={12} value={formatNationalPhone(draft.phone)} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : "phone-help"} onChange={changePhone} onKeyDown={(event) => { if (event.ctrlKey || event.metaKey || event.altKey || ["Backspace", "Delete", "Tab", "Enter", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key) || /^\d$/.test(event.key)) return; event.preventDefault(); }} placeholder="5__ ___ ____" /><span className="visually-hidden">Ülke kodu +90 sabittir. 5 ile başlayan 10 rakam girin.</span></div><p id={errors.phone ? "phone-error" : "phone-help"} className={errors.phone ? "field-error" : "field-help"}>{errors.phone || "+90 sabit ülke kodudur; 5 ile başlayan 10 rakam girin. Bilgiler kaydedilmez."}</p></div></div>}

            {step === 5 && <div className="summary-card"><div className="summary-notice">Bu, kaydedilmeyen bir randevu önizlemesidir.</div><dl><div><dt>Berber</dt><dd>{selectedBarber?.name}</dd></div><div><dt>Hizmet</dt><dd>{selectedService?.name}{selectedService?.id === "complete-care" && <span className="summary-campaign">Kampanyalı Paket</span>}</dd></div><div><dt>Süre</dt><dd>{selectedService ? formatDuration(selectedService.durationMinutes) : ""}</dd></div><div><dt>Fiyat</dt><dd className="summary-price">{selectedService ? formatPrice(selectedService.priceTry) : ""}</dd></div><div><dt>Tarih</dt><dd>{displayDate(draft.date)}</dd></div><div><dt>Saat</dt><dd>{draft.time}–{selectedService ? (() => { const [hours, minutes] = draft.time.split(":").map(Number); const end = hours * 60 + minutes + selectedService.durationMinutes; return `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`; })() : ""}</dd></div><div><dt>Müşteri</dt><dd>{draft.name}</dd></div><div><dt>Telefon</dt><dd>+90 {formatNationalPhone(draft.phone)}</dd></div></dl></div>}

            <div className="booking-controls">{step > 0 ? <button type="button" className="booking-previous" onClick={goBack}>← <span>Geri</span></button> : <span></span>}{step < stepNames.length - 1 && <button type="submit" className="button booking-next">{step === 4 ? "Özeti Görüntüle" : "Devam Et"} <span aria-hidden="true">→</span></button>}</div>
          </form>
        </section>
        <p className="booking-footer-note">Bu önizleme randevu oluşturmaz. Gerçek randevu kaydı bu aşamanın kapsamında değildir.</p>
      </div>
    </main>
  );
}
