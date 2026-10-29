# FlowGuard Dashboard

React + TypeScript + Tailwind frontend for FlowGuard. It reads the generated, typed data bundle in `src/data/flowguardData.ts` and does not call Gemini or require an API key.

From the project root, refresh its data after the Python pipeline finishes:

```bash
node dashboard/scripts/build_data.js
```

Run or build the frontend:

```bash
cd dashboard
npm install
npm run dev
npm run lint
npm test
npm run build
```

See the root `README.md` for the forecasting pipeline, source provenance, and modeling limitations.
