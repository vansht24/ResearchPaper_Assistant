# ResearchPaper_Assistant

An AI-powered web application that allows users to upload research papers (PDFs) and interact with them using natural language queries.

The system uses **local Large Language Models via Ollama** along with a **Retrieval-Augmented Generation (RAG)** pipeline to generate accurate, context-aware answers from the uploaded documents.

---

## 🚀 Features

* Upload and process research papers (PDF)
* Ask questions about documents in natural language
* Context-aware answers using RAG
* Runs **locally using Ollama** (no external API dependency)
* Interactive and clean frontend interface

---

## 🧠 How It Works (RAG + Ollama)

1. PDF is uploaded and parsed
2. Text is split into smaller chunks
3. Chunks are converted into embeddings
4. Stored for efficient retrieval
5. User query retrieves relevant chunks
6. Context is passed to a local LLM via Ollama
7. LLM generates grounded answers

---

## 🛠 Tech Stack

* **Frontend:**  React
* **Backend:** Python (Flask / FastAPI)
* **LLM Runtime:** Ollama (local models like LLaMA / Mistral)
* **RAG Pipeline:** Embeddings + vector retrieval



---



