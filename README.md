# 🛡️ Cyphix Auditor — AI Multi-Agent 7-Dimensional Codebase & Cybersecurity Auditor

<div align="center">

![Cyphix Banner](https://img.shields.io/badge/Security-SOC_2_%26_HIPAA_Air--Gapped-emerald?style=for-the-badge&logo=shield)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black?style=for-the-badge&logo=next.js&logoColor=white)
![Multi-Agent](https://img.shields.io/badge/Architecture-7--Dimensional_Multi--Agent-violet?style=for-the-badge)
![Languages](https://img.shields.io/badge/Languages-Kurdish_%7C_English_%7C_Arabic_%7C_Persian-blue?style=for-the-badge)

<p align="center">
  <strong>100% In-Memory (RAM) Private Codebase Evaluation with Zero Server Storage</strong><br>
  Powered by Cloud Intelligence (Gemini 2.5, Claude 3.5, DeepSeek) & Local Offline GGUF Models (DeepSeek-R1, Qwen2.5-Coder, Llama-3.2).
</p>

[Quickstart](#-quickstart) • [Architecture](#-7-dimensional-security-matrix) • [Local Models](#-local-offline-models-gguf) • [Documentation](#-official-documentation)

</div>

---

## 🌟 Key Highlights

- **🔒 Zero Disk Storage (Privacy by Design):** Evaluates files 100% in transient browser memory (RAM). Code never persists on any database.
- **🤖 7-Dimensional Multi-Agent Engine:** Concurrently audits Backend Logic, UI/UX, OWASP Top 10, SEO, QA, Performance, and Documentation.
- **💻 Offline Air-Gapped Inference:** Run local GGUF 4-bit quantized models completely offline with zero network requests via CPU multi-threading.
- **⚡ Fast AST Static Pre-Scanner:** Hunts secrets, hardcoded API keys, SQL injections, and empty catch blocks instantaneously before LLM invocation.
- **🌍 Native 5-Language Support:** Kurdish Sorani, Kurdish Badini, English, Arabic, and Persian with full RTL/LTR layout mirroring.

---

## 🏛️ 7-Dimensional Security Matrix

| # | Specialized Domain | Evaluation Scope |
| :---: | :--- | :--- |
| **1** | **Backend, Database Logic & Architecture** | SQL/NoSQL injection, ORM calls, race conditions, auth middleware, and error handling. |
| **2** | **UI, UX & Mobile Responsiveness** | Viewport responsiveness, WCAG 2.2 accessibility, loading states, and RTL consistency. |
| **3** | **Critical Security (OWASP Top 10)** | Injection attacks, XSS, CSRF, broken access control, and credential leaks. |
| **4** | **SEO, Metadata & Routing** | Open Graph tags, canonical links, hreflang alternates, and App Router hygiene. |
| **5** | **QA, Edge Cases & Resilience** | Null safety, unhandled network timeouts, state sync, and exception recovery. |
| **6** | **Performance & Core Web Vitals** | Memory leaks, bundle optimization, render blockers, and serverless cold starts. |
| **7** | **Documentation & Type Safety** | Strict TypeScript typings, modular structure, and clear observability logs. |

---

## 💻 Local Offline Models (GGUF via CPU)

Cyphix supports 100% private, offline inference running on regular CPU and System RAM (no dedicated GPU required):

1. **DeepSeek-R1-Distill-Qwen-7B (`model.gguf` - 4.36 GB):** Deep reasoning & vulnerability discovery. *(Recommended: 16GB+ RAM, 8-core CPU)*.
2. **Qwen2.5-Coder-7B-Instruct (`qwen-coder-7b.gguf` - 4.36 GB):** High-speed code architecture, TypeScript types, and refactoring. *(Recommended: 16GB RAM)*.
3. **Llama-3.2-3B-Instruct (`llama-3.2-3b.gguf` - 1.88 GB):** Ultra-lightweight model ideal for standard laptops with 8GB RAM.

---

## 🚀 Quickstart

### 1. Clone & Install
```bash
git clone https://github.com/zrngngharib/Cyphix-Auditor.git
cd Cyphix-Auditor
npm install
```

### 2. Configure Environment (Optional)
```bash
cp .env.example .env.local
```
*(You can also input your API keys directly into the web application interface).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Automated CI/CD (GitHub Actions)

Cyphix includes a built-in GitHub Actions workflow (`.github/workflows/cyphix-audit.yml`) to automatically audit your codebase and prevent security regressions on every Pull Request.

---

## 📜 License

MIT License. Designed with excellence by **Cyphix Core Team**.
