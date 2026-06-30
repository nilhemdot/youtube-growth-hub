Bot (bot/bot.py)

Purpose
- Connects to Discord with a bot token and collects messages the bot can see.
- Pushes messages into Redis list `messages` for downstream processing.

Environment
- Copy ../.env.example to ../.env and set DISCORD_TOKEN and REDIS_URL.
- Ensure your bot has the `Message Content Intent` enabled if indexing message content.

Run (local)
- python -m venv .venv
- .\.venv\Scripts\Activate.ps1  # Windows PowerShell
- pip install -r requirements.txt
- python bot/bot.py

Notes
- Invite bot with `bot` scope and `messages.read`/`applications.commands` as needed. Only invite to servers where you have permission to index public content.
- The bot ignores other bots and pushes raw message fields to Redis for the worker.
