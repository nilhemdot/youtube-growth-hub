Worker (worker/worker.py)

Purpose
- Reads messages from Redis (`messages` list), normalizes them, optionally creates embeddings, and indexes into Meilisearch.

Environment
- .env should contain MEILI_URL, MEILI_MASTER_KEY, MEILI_INDEX (defaults shown in .env.example), and optional OPENAI_API_KEY for embeddings.

Run (local)
- python -m venv .venv
- .\.venv\Scripts\Activate.ps1
- pip install -r requirements.txt
- python worker/worker.py

Index initialization
- scripts/init_meili.py will create the index (if missing) and apply settings from meilisearch/index-settings.json.

Notes
- Embeddings are optional. If OPENAI_API_KEY is set, the worker will call OpenAI embeddings and attach them to documents.
- Ensure MEILI_MASTER_KEY is set when running Meilisearch in production mode.
