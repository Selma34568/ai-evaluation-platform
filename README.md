# EvalAI — AI Evaluation Platform

EvalAI is a reusable platform designed to evaluate, monitor, and compare the performance of AI-powered applications.

The platform combines automated evaluation methods, LLM-based assessment, and Langfuse observability.

## Features

- Dataset creation and management
- Automated AI system evaluation
- Multiple evaluation methods
- Evaluation history and detailed results
- Performance monitoring dashboard
- Langfuse tracing and score integration

## Technology Stack

**Backend:** Python, FastAPI

**Frontend:** Next.js, TypeScript

**Evaluation:** Deterministic evaluators and LLM Judge (Ollama)

**Observability:** Langfuse

## Evaluation Methods

1. Contains Answer — checks whether the expected answer appears in the actual response.
2. Required Fields — verifies the presence of required output fields.
3. LLM Judge — evaluates answer quality using a configured Ollama model.

## Initial Evaluation Results

### ATA RAG

- Test cases: 10
- Passed: 10
- Failed: 0
- Average score: 90%

Evaluation traces and scores were successfully recorded in Langfuse.

### Agentic Internship Coordinator

Integration and evaluation are in progress.

## Project Structure

- `backend/` — API, evaluation engine, evaluators, and system integrations.
- `frontend/` — User interface, dashboard, datasets, and evaluation history.

## Security

Environment variables and API credentials are excluded from version control using `.gitignore`.

Never commit actual API keys, passwords, or other credentials.

## Development Status

The core evaluation platform and ATA RAG evaluation have been implemented and tested.

Further work includes Internship Coordinator evaluation, documentation, and CI/CD integration.