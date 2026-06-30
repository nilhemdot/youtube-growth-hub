import os
import json
import discord
import asyncio
from dotenv import load_dotenv
import redis.asyncio as aioredis

load_dotenv()
TOKEN = os.getenv('DISCORD_TOKEN')
REDIS_URL = os.getenv('REDIS_URL', 'redis://redis:6379/0')

intents = discord.Intents.default()
# Message Content Intent is privileged; enable it in Discord Developer Portal if needed.
ENABLE_MESSAGE_CONTENT = os.getenv('ENABLE_MESSAGE_CONTENT', 'false').lower() in ('1', 'true', 'yes')
intents.message_content = ENABLE_MESSAGE_CONTENT
intents.guilds = True
intents.messages = True

client = discord.Client(intents=intents)

async def get_redis():
    return aioredis.from_url(REDIS_URL)

@client.event
async def on_ready():
    print(f'Bot logged in as {client.user}')

@client.event
async def on_message(message):
    # ignore bots
    if message.author.bot:
        return
    payload = {
        'id': str(message.id),
        'guild_id': str(message.guild.id) if message.guild else None,
        'channel_id': str(message.channel.id),
        'author_id': str(message.author.id),
        'author_name': str(message.author),
        'content': message.content,
        'timestamp': message.created_at.isoformat(),
        'raw': {
            'attachments': [a.url for a in message.attachments]
        }
    }
    r = await get_redis()
    await r.rpush('messages', json.dumps(payload))

if __name__ == '__main__':
    client.run(TOKEN)
