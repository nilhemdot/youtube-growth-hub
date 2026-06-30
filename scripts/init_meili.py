import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()
MEILI_URL = os.getenv('MEILI_URL', 'http://meilisearch:7700')
MEILI_KEY = os.getenv('MEILI_MASTER_KEY')
MEILI_INDEX = os.getenv('MEILI_INDEX', 'discord_messages')

settings_path = os.path.join(os.path.dirname(__file__), '..', 'meilisearch', 'index-settings.json')
with open(settings_path, 'r', encoding='utf-8') as f:
    settings = json.load(f)

headers = {'X-Meili-API-Key': MEILI_KEY} if MEILI_KEY else {}

# create index if missing
r = requests.get(f"{MEILI_URL}/indexes/{MEILI_INDEX}", headers=headers)
if r.status_code == 404:
    print('Creating index', MEILI_INDEX)
    requests.post(f"{MEILI_URL}/indexes", json={"uid":MEILI_INDEX, "primaryKey":"id"}, headers=headers)

# apply settings
resp = requests.post(f"{MEILI_URL}/indexes/{MEILI_INDEX}/settings", json=settings, headers=headers)
if resp.ok:
    print('Settings applied')
else:
    print('Failed to apply settings', resp.status_code, resp.text)
