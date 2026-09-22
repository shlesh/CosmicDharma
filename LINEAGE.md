# Cosmic Dharma calculation frame

Default sidereal frame: **Sri Yukteswar / Revati ayanamsa** from *The Holy Science* (1894).

- Epoch 1894 January 1: ayanamsa = 20°54'36"
- Rate: 54" per year (from the 24,000-year dual cycle)
- Fiducial: Revati
- Houses default to whole-sign from Lagna
- Yuga clock: ascending Dwapara 1700–4100 CE, next Treta 4100

Lahiri, Raman, KP and Fagan/Bradley remain selectable on the profile request for comparison.

A natal chart is a portrait of karma and its probable fruit, not a sentence. Will can outwit the stars.

## Deploy checklist

1. Keep working on `feat/yukteswar-lineage` until the product cut.
2. Backend env: `AYANAMSA=yukteswar`, `HOUSE_SYSTEM=whole_sign`, `FRONTEND_URL` = your domain, `CORS_ORIGINS` includes the Netlify / custom domain.
3. Frontend env: `NEXT_PUBLIC_API_BASE_URL` = public FastAPI origin (no trailing slash).
4. GitHub Actions deploy still targets `main`. Merge this branch only after a local `PYTHONPATH=. pytest -q` and `npm test` pass.
5. Point `cosmicdharma.app` at Netlify; keep Hostinger for the API process (`systemctl restart cosmicdharma.service`).
