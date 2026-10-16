# Sach Ya Scam?

HACKCOM 2026 project (CF-14). Paste a suspicious SMS, WhatsApp message, call transcript or link and get an instant verdict — **Scam / Suspicious / Looks safe** — with the red flags explained and what to do next.

Built for the scams Indians actually receive: "digital arrest" and CBI/ED/court impersonation, KYC/OTP fraud, fake parcels, part-time job/task scams, investment groups, lottery prizes, loan apps, sextortion and electricity-bill threats. Works with English, Hindi and Hinglish.

## Features

- Rule-based detection engine (`src/engine`) with weighted red flags, negation handling ("never share your OTP" is not a red flag) and combo patterns (authority threat + money demand).
- Link analysis: URL shorteners, raw IPs, punycode, cheap TLDs, brand look-alikes (e.g. `sbi-kyc-update.xyz`), fake government domains, APK downloads.
- Highlights exactly which phrases triggered each flag.
- Category-specific advice and reporting shortcuts: 1930 helpline, cybercrime.gov.in, Chakshu (Sanchar Saathi).
- Runs fully in the browser — no data leaves the device, no API keys needed.

## Development

```bash
npm install
npm run dev     # start dev server
npm test        # run engine tests (vitest)
npm run lint
npm run build
```
