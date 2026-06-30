import os
import time
import json
import requests
from dotenv import load_dotenv
import redis

load_dotenv()
REDIS_URL = os.getenv('REDIS_URL', 'redis://redis:6379/0')
MEILI_URL = os.getenv('MEILI_URL', 'http://meilisearch:7700')
MEILI_KEY = os.getenv('MEILI_MASTER_KEY')
MEILI_INDEX = os.getenv('MEILI_INDEX', 'discord_messages')
OPENAI_KEY = os.getenv('OPENAI_API_KEY')

r = redis.from_url(REDIS_URL)

# ensure index exists
def ensure_index():
    headers = {'X-Meili-API-Key': MEILI_KEY} if MEILI_KEY else {}
    url = f"{MEILI_URL}/indexes/{MEILI_INDEX}"
    resp = requests.get(url, headers=headers)
    if resp.status_code == 404:
        # create index
        create_url = f"{MEILI_URL}/indexes"
        requests.post(create_url, json={"uid": MEILI_INDEX, "primaryKey":"id"}, headers=headers)

# simple helper to index a document into Meilisearch
def index_document(doc):
    # Meilisearch uses a Bearer token in the Authorization header in newer versions
    headers = {'Authorization': f'Bearer {MEILI_KEY}'} if MEILI_KEY else {}
    url = f"{MEILI_URL}/indexes/{MEILI_INDEX}/documents"
    resp = requests.post(url, json=[doc], headers=headers)
    if not resp.ok:
        print('Meili index error', resp.text)

# optional embedding using OpenAI (if provided)
def embed_text(text):
    if not OPENAI_KEY:
        return None
    try:
        resp = requests.post('https://api.openai.com/v1/embeddings',
                             headers={'Authorization': f'Bearer {OPENAI_KEY}', 'Content-Type': 'application/json'},
                             json={'model':'text-embedding-3-small','input':text})
        if resp.ok:
            return resp.json()['data'][0]['embedding']
    except Exception as e:
        print('Embedding error', e)
    return None

print('Worker started, ensuring Meilisearch index...')
ensure_index()
while True:
    try:
        item = r.blpop('messages', timeout=5)
        if not item:
            continue
        _, raw = item
        payload = json.loads(raw)
        doc = {
            'id': payload.get('id'),
            'guild_id': payload.get('guild_id'),
            'channel_id': payload.get('channel_id'),
            'author_id': payload.get('author_id'),
            'author_name': payload.get('author_name'),
            'content': payload.get('content'),
            'timestamp': payload.get('timestamp')
        }
        # compute embedding optionally
        emb = embed_text(doc['content'])
        if emb:
            doc['embedding'] = emb
        index_document(doc)
    except Exception as e:
        print('Worker exception', e)
        time.sleep(1)
