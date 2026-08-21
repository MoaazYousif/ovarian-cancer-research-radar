# 🎗️ Ovarian Cancer Research Radar

A personalized research-intelligence platform that continuously monitors, classifies, ranks, and summarizes newly published scientific literature on ovarian cancer — with a specialized focus on **High-Grade Serous Ovarian Carcinoma (HGSOC)**.

Built to help researchers and clinicians keep up with a fast-moving field without manually scanning PubMed every day.

> ⚠️ **Disclaimer:** This project is a research/portfolio tool built for literature monitoring and exploration. It is **not** a medical device and should not be used for clinical decision-making.

---

## ✨ Key Features

- **Multi-source literature ingestion** — pulls new papers from **PubMed**, **Europe PMC**, **OpenAlex**, and **Crossref**, then deduplicates results across sources.
- **Disease & subtype classification** — automatically determines whether a paper is directly about ovarian cancer (vs. related/incidental mentions) and classifies it by molecular subtype.
- **Multi-dimensional ranking engine** — scores every paper on five independent axes (relevance, clinical/biological importance, personalization to the user's research interests, novelty, and HGSOC-specificity) and combines them into a weighted final score.
- **AI-powered summarization** — uses the Gemini API to generate concise, structured summaries of papers on demand.
- **Emerging entities radar** — detects genes, pathways, drugs, and biomarkers that are trending in the recent literature, with week-over-week momentum tracking.
- **Research gaps & trends tabs** — surfaces under-studied areas and visualizes topic trends over time.
- **Semantic search** — search the paper corpus by meaning, not just keywords.
- **Personalized daily digest** — a generated summary of what's new and relevant based on a user profile.
- **Social post generator** — turns a paper into a shareable summary post.
- **Live NCBI/PubMed integration** — on-demand fetching of the latest matching publications.

## 🏗️ Architecture

The codebase is organized around a clear service-layer separation:

```
src/
├── components/       # React UI (tabs, modals, dashboards)
├── services/
│   ├── ingestion/     # PubMed / Europe PMC / OpenAlex / Crossref clients + dedup + pipeline
│   ├── classification/# Disease & subtype classifiers
│   ├── ranking/        # Relevance, importance, personalization, novelty & final scorers
│   ├── entities/       # Named-entity extraction & trend engine
│   ├── embeddings/     # Semantic search engine
│   ├── ai/              # Gemini-based summarization & post generation
│   └── storage/        # In-memory paper store & initial seed dataset
├── types/             # Shared TypeScript types
└── server.ts           # Express server (serves the API used by the AI features)
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS 4 |
| Charts | Recharts |
| Build tool | Vite 6 |
| Backend | Express + tsx |
| AI | Google Gemini API (`@google/genai`) |
| Data sources | PubMed (NCBI E-utilities), Europe PMC, OpenAlex, Crossref |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Gemini API key](https://aistudio.google.com/apikey) (free tier available)

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/ovarian-cancer-research-radar.git
cd ovarian-cancer-research-radar
npm install
```

### Configuration

Copy the example environment file and add your key:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```
GEMINI_API_KEY="your-gemini-api-key-here"
```

### Run locally

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## 📂 Project Structure Highlights

- **Ranking system** (`src/services/ranking/`) — each paper gets 5 independent scores (relevance, importance, personalization, novelty, HGSOC-relevance) which are normalized and combined into a single `finalScore` used for sorting the feed.
- **Trend engine** (`src/services/entities/trendEngine.ts`) — tracks entity mention counts in rolling 7-day windows to flag genes/drugs/pathways with rising momentum.
- **Classification** (`src/services/classification/`) — lightweight, explainable heuristic classifiers that return a confidence score and a human-readable evidence reason for every decision.

## 🗺️ Roadmap Ideas

- [ ] Persistent database storage instead of in-memory store
- [ ] Automated tests for the classification/ranking services
- [ ] Scheduled background ingestion (cron job)
- [ ] User authentication for multi-user deployments

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 🙋 About

Built as an exploration of applying structured NLP pipelines (classification, multi-factor ranking, trend detection, and LLM summarization) to a real-world biomedical literature monitoring problem.
