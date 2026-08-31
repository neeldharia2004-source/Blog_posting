# AutoBlog.AI — Context-Aware AI Blog Generation & Multi-Platform Syndication Platform

> A production-grade, full-stack Next.js and PostgreSQL platform that ingests organizational context (brand rules, technical whitepapers, and product specs) to autonomously generate high-authority, hallucination-free blog posts using Google Gemini AI, and syndicate them to Google Blogger and WordPress with live permalink tracking.

---

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [Key Capabilities & Innovations](#key-capabilities--innovations)
3. [Architecture & Data Flow](#architecture--data-flow)
4. [Database Schema & ER Model](#database-schema--er-model)
5. [Tech Stack](#tech-stack)
6. [Getting Started (Local Setup)](#getting-started-local-setup)
7. [API Integrations Setup](#api-integrations-setup)
   - [Google Gemini API](#1-google-gemini-ai-setup)
   - [Google Blogger REST API](#2-google-blogger-v3-setup)
   - [WordPress REST API](#3-wordpress-setup)
8. [REST API Directory](#rest-api-directory)
9. [Automated Verification & Test Suites](#automated-verification--test-suites)
10. [Development Phases & Milestones](#development-phases--milestones)

---

## Platform Overview

Modern content marketing often suffers from two fundamental problems:
1. **Generic AI Hallucinations**: Standard LLMs invent fictional product specifications, incorrect metrics, and ungrounded claims when generating marketing articles.
2. **Manual Publishing Overhead**: Editorial teams waste hours copying, reformatting, and publishing markdown to multiple fragmented platforms.

**AutoBlog.AI** solves both challenges by combining:
* **Strict Contextual Grounding**: Ingests PDF research papers, Markdown guidelines, and technical specs, compiling a structured knowledge base across `Company ➔ Section ➔ Product ➔ Project ➔ Context Files`.
* **Zero-Hallucination AI Generation**: Enforces Google Gemini to write naturally structured articles strictly anchored in your verified technical context.
* **Multi-Platform Syndication**: Dispatches approved articles to **Google Blogger** and **WordPress** with automated Markdown-to-HTML compilation and live URL capture.

---

## Key Capabilities & Innovations

- 🏢 **Multi-Tenant Enterprise Hierarchy**: Full CRUD for Companies, Business Sections, Nested Products, and Campaign Projects.
- 📄 **Multi-Format Context Ingestion**: High-throughput parser for `.pdf` (via server-side `pdf-parse`), `.md`, and `.txt` files with 10MB size enforcement.
- 🔒 **Strict Project Context Isolation**: Verified boundary enforcement ensuring Project A's uploaded documents never bleed into Project B.
- 🤖 **Extensible AI Provider Abstraction**: Modular `AIProvider` interface with official Google `@google/genai` integration and server-side secret protection.
- 📝 **Split-View Markdown Editor**: Live side-by-side editing, word count, reading time calculator, and GitHub-flavored markdown rendering (`**bold**`, syntax highlighting, tables).
- 🔄 **Strict Editorial Lifecycle**: Enforces `DRAFT` ➔ `GENERATING` ➔ `GENERATED` ➔ `APPROVED` ➔ `PUBLISHED` states.
- 🌐 **Omnichannel Syndication**: Modular `Publisher` abstraction supporting Google Blogger v3 REST API (with 1-click OAuth2 refresh) and WordPress REST API v2.

---

## Architecture & Data Flow

```mermaid
graph TD
    User([👤 User]) -->|Upload PDF, MD, TXT| Ingest[Context Extractor]
    Ingest --> Storage[(PostgreSQL & Local File Storage)]

    User -->|Select Scope & Generate| Wizard[Blog Generator Wizard]
    Wizard --> ContextBuilder[Hierarchical Context Builder]
    
    subgraph "Context Aggregation Hierarchy"
        Company[Company Info] --> ContextBuilder
        Section[Section Details] --> ContextBuilder
        Product[Product Capabilities] --> ContextBuilder
        Project[Campaign Mission] --> ContextBuilder
        Files[Project Context Documents] --> ContextBuilder
    end

    ContextBuilder --> GeminiAPI[Google Gemini 2.5 Flash / Pro]
    GeminiAPI --> BlogEditor[Interactive Blog Editor /blogs/id]
    
    BlogEditor -->|Review & Approve| Approved[Status: APPROVED]
    Approved --> PublisherFactory[Publisher Factory]
    
    PublisherFactory -->|Blogger v3 API| Blogger[Google Blogger]
    PublisherFactory -->|WordPress REST API| WordPress[WordPress Site]
    
    Blogger -->|Return Live URL| PublishedPost[(PublishedPost Record)]
    WordPress -->|Return Live URL| PublishedPost
```

---

## Database Schema & ER Model

Implemented strictly with **7 approved core entities** in Prisma ORM and PostgreSQL 16:

```mermaid
erDiagram
    Company ||--o{ Section : "has"
    Section ||--o{ Product : "contains"
    Company ||--o{ Project : "owns"
    Project ||--o{ ContextFile : "ingests"
    Project ||--o{ Blog : "produces"
    Blog ||--o{ PublishedPost : "syndicates to"

    Company {
        string id PK
        string name
        string description
        datetime createdAt
        datetime updatedAt
    }

    Section {
        string id PK
        string companyId FK
        string name
        string description
    }

    Product {
        string id PK
        string sectionId FK
        string name
        string description
    }

    Project {
        string id PK
        string companyId FK
        string name
        string description
    }

    ContextFile {
        string id PK
        string projectId FK
        string fileName
        string fileType
        string filePath
        string storageReference
        string extractedContent
    }

    Blog {
        string id PK
        string projectId FK
        string title
        string topic
        string content
        BlogStatus status
    }

    PublishedPost {
        string id PK
        string blogId FK
        PublishingPlatform platform
        PublishingStatus status
        string url
        string externalPostId
        datetime publishedAt
    }
```

---

## Tech Stack

* **Framework**: Next.js 16 (App Router, Server Actions, Route Handlers, React 19)
* **Language**: TypeScript 5
* **Styling**: Tailwind CSS 4, Lucide React Icons
* **Database & ORM**: PostgreSQL 16, Prisma ORM 6
* **AI Engine**: Google Gemini API (`@google/genai` SDK)
* **Text Extraction**: `pdf-parse`, UTF-8 Streams
* **Markdown**: `react-markdown`, `remark-gfm`
* **Containerization**: Docker & Docker Compose

---

## Getting Started (Local Setup)

### 1. Prerequisites
* Node.js 20+ (Node 22/24 recommended)
* Docker & Docker Compose

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/neeldharia2004-source/Blog_posting.git
cd Blog_posting
npm install
```

### 3. Start PostgreSQL with Docker
```bash
docker compose up -d
```

### 4. Configure Environment Variables
Create your local `.env` file:
```bash
cp .env.example .env
```
Ensure your `DATABASE_URL` is set:
```env
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/blog_posting_db?schema=public"
```

### 5. Run Migrations & Seed Database
```bash
npx prisma migrate dev --name init
npm run seed
```

### 6. Start the Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## API Integrations Setup

### 1. Google Gemini AI Setup
1. Get a free API Key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Add it to `.env`:
   ```env
   GEMINI_API_KEY="AIzaSy..."
   ```

### 2. Google Blogger v3 Setup
1. Create a free blog at [Blogger.com](https://www.blogger.com).
2. Copy your numeric Blog ID from the dashboard URL (`https://www.blogger.com/blog/posts/<BLOG_ID>`).
3. Add it to `.env`:
   ```env
   BLOGGER_BLOG_ID="5123631523879063335"
   BLOGGER_CLIENT_ID="your_client_id.apps.googleusercontent.com"
   BLOGGER_CLIENT_SECRET="your_client_secret"
   ```
4. Open `http://localhost:3000/publishing` and click **"Authorize Google Blogger (1-Click)"** to automatically link your account.

### 3. WordPress Setup
1. Open your WordPress dashboard ➔ **Users** ➔ **Profile** ➔ **Application Passwords**.
2. Create a password named `AutoBlog AI` and copy the 24-character token.
3. Add to `.env`:
   ```env
   WORDPRESS_SITE_URL="https://yourwordpresssite.com"
   WORDPRESS_USERNAME="admin"
   WORDPRESS_APPLICATION_PASSWORD="abcd efgh ijkl mnop qrst uvwx"
   ```

---

## REST API Directory

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stats` | Global dashboard counters and metrics |
| `GET`, `POST` | `/api/companies` | List all companies or create new company |
| `GET`, `PUT`, `DELETE` | `/api/companies/[id]` | Get, update, or cascade-delete company |
| `GET`, `POST` | `/api/projects` | List projects or create new campaign project |
| `GET`, `POST` | `/api/projects/[id]/context-files` | List context files or upload PDF/MD/TXT |
| `GET`, `DELETE` | `/api/context-files/[id]` | Preview extracted text or delete context document |
| `POST` | `/api/projects/[id]/blogs/generate` | Trigger context-aware AI blog generation |
| `GET`, `PUT`, `DELETE` | `/api/blogs/[id]` | Fetch blog details, save draft edits, or approve |
| `POST` | `/api/blogs/[id]/publish` | Publish approved blog to Blogger or WordPress |
| `GET` | `/api/publishing/status` | Check platform credential readiness |
| `POST` | `/api/published-posts/[id]/retry` | Re-trigger failed syndication attempt |

---

## Automated Verification & Test Suites

Run individual automated test suites with TypeScript execution:

```bash
# Phase 2 CRUD & Hierarchy Tests
npx tsx scripts/test-phase2.ts

# Phase 3 PDF/MD Ingestion & Context Isolation Tests
npx tsx scripts/test-phase3.ts

# Phase 4 AI Generation & Editorial Approval Tests
npx tsx scripts/test-phase4.ts

# Phase 5 Multi-Platform Publishing & Live Link Tests
npx tsx scripts/test-phase5.ts

# Production Build Verification
npm run build
```

---

## Development Phases & Milestones

- ✅ **Phase 1: Database Layer & Docker**: PostgreSQL 16, Prisma schema with 7 entities, migrations, and seed script.
- ✅ **Phase 2: Management Dashboards**: Company, Section, Product, and Project CRUD interfaces with Zod validation.
- ✅ **Phase 3: Context Ingestion**: PDF and Markdown text extraction engine, storage layer, and strict project isolation.
- ✅ **Phase 4: AI Generation & Editor**: Google Gemini API provider, context builder, prompt engineering, and Markdown Blog Editor.
- ✅ **Phase 5: Multi-Platform Publishing**: Blogger API v3 (OAuth2 refresh) and WordPress REST API publishers with live permalink tracking.
- ✅ **Phase 6: Polish, Security & Documentation**: File upload hardening (10MB limit), production README, and GitHub repository synchronization.

---

## License
MIT License. Open source and built for high-performance content teams.
