# Quick Start: Viral Content Trend Scraper MCP Server

## 5-Minute Setup

### 1. Install Dependencies
```bash
cd tools/mcp-viral-scraper
pip install -r requirements.txt
```

### 2. Set Up Credentials (Optional)
```bash
cp .env.example .env
# Edit .env with your API credentials (Reddit, X, Instagram)
# For MVP: YouTube and Reddit work without credentials
```

### 3. Start the Server
```bash
python server.py
```

You should see:
```
INFO:root:Starting Viral Trend Scraper MCP Server...
INFO:root:Server running. Listening for requests...
```

## Integration with Copilot

### Add to Claude Desktop Config
Edit `~/AppData/Roaming/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "viral-scraper": {
      "command": "python",
      "args": ["/path/to/mcp-viral-scraper/server.py"]
    }
  }
}
```

Restart Claude Desktop → You'll see **Viral Scraper** in the tools menu.

## Example Use Cases

### 1. Daily Trend Report
```
"Use the viral scraper to get trending content from youtube, reddit, and x.
Generate a markdown report with the top 5 trending topics and why they're viral."
```

### 2. AI Content Research
```
"Search for 'AI video generation' trends across youtube, reddit, and x.
Show me which platforms have the highest engagement."
```

### 3. Creator Benchmarking
```
"Get insights on top YouTube creators in trending. What are their common 
characteristics? Title length? Upload frequency patterns?"
```

### 4. Format Analysis
```
"Analyze viral patterns from YouTube shorts (9:16 aspect ratio).
What title patterns and hook types get the most engagement?"
```

### 5. Competitor Research
```
"Find trending content about 'AI tools' on YouTube and Reddit.
Extract title patterns, hook language, and engagement metrics."
```

## What Each Tool Does

### get_trending_content
Fetches raw trending data from platforms.

**Input:**
```json
{
  "platforms": ["youtube", "reddit", "x"],
  "region": "US",
  "limit": 25
}
```

**Output:**
```json
{
  "youtube": [
    {
      "title": "I Tested 10 AI Video Tools...",
      "creator": "CreatorName",
      "views": 1500000,
      "engagement": 0.087,
      "viral_score": 87.5
    }
  ],
  "reddit": [...],
  "x": [...]
}
```

### analyze_viral_patterns
Identifies patterns in what's trending.

**Input:**
```json
{
  "platforms": ["youtube", "tiktok"],
  "lookback_hours": 24
}
```

**Output:**
```json
{
  "trending_topics": ["AI Video", "AI Tools", "Machine Learning"],
  "content_formats": ["Tutorial", "Review", "Comparison"],
  "peak_posting_times": ["9:00 AM UTC", "5:00 PM UTC"],
  "engagement_rates": {"reviews": 0.12, "tutorials": 0.08},
  "viral_patterns": {
    "title_hooks": ["I tested", "Only", "Shocking"],
    "video_length_sweet_spot": "6-12 minutes"
  }
}
```

### search_trend_keyword
Find specific topics across platforms.

**Input:**
```json
{
  "keyword": "AI video generation",
  "platforms": ["youtube", "reddit"]
}
```

### get_creator_insights
Analyze top creators.

**Input:**
```json
{
  "platform": "youtube",
  "top_n": 10
}
```

### export_trending_report
Export data in different formats.

**Input:**
```json
{
  "platforms": ["youtube", "reddit"],
  "format": "markdown"
}
```

## Command-Line Usage (Direct)

If you prefer testing directly:

```bash
# Test the server
python test_server.py

# Import and use manually
python -c "
from server import YouTubeScraper
import asyncio

async def test():
    scraper = YouTubeScraper()
    await scraper.init_session()
    trends = await scraper.fetch_trending('US', 10)
    for t in trends:
        print(f'{t.title} - {t.views} views - {t.viral_score}% viral')
    await scraper.close_session()

asyncio.run(test())
"
```

## Platform-Specific Setup

### YouTube ✅ (Works out of box)
- Uses yt-dlp public scraping
- No credentials required

### Reddit ✅ (Needs setup)
1. Go to https://www.reddit.com/prefs/apps
2. Create an app → Get `client_id` and `client_secret`
3. Add to `.env`

### X 🔑 (Needs API access)
1. Apply at https://developer.twitter.com
2. Get Bearer Token
3. Add to `.env`

### TikTok & Instagram ⚠️ (Advanced)
- TikTok: Requires Playwright browser automation
- Instagram: Requires Instagrapi or Meta Graph API
- See `scrapers_advanced.py` for implementations

## Next Steps

### Phase 1: Get Trending Data
```python
from server import YouTubeScraper
import asyncio

async def get_youtube_trends():
    scraper = YouTubeScraper()
    await scraper.init_session()
    trends = await scraper.fetch_trending()
    print(f"Found {len(trends)} trending videos")
    await scraper.close_session()

asyncio.run(get_youtube_trends())
```

### Phase 2: Analyze Patterns
```python
# Identify: Common title patterns, posting times, engagement trends
# Output: Structured insights for your Higgsfield content generation
```

### Phase 3: Integration with Higgsfield
```python
# Use viral trends to:
# 1. Identify trending angles
# 2. Generate optimized thumbnails
# 3. Create scripts matching successful patterns
# 4. Generate videos with Higgsfield
# 5. Track performance metrics
```

## Troubleshooting

### yt-dlp not found
```bash
pip install --upgrade yt-dlp
```

### Import errors
```bash
# Reinstall all dependencies
pip install -r requirements.txt --force-reinstall
```

### Playwright browser issues
```bash
playwright install chromium
```

### PRAW authentication fails
```bash
# Verify Reddit app exists: https://www.reddit.com/prefs/apps
# Check .env has correct client_id and client_secret
```

## Performance Tips

1. **Parallel scraping**: The server scrapes multiple platforms simultaneously
2. **Caching**: Results are cached for 3 hours by default
3. **Rate limiting**: Respects API rate limits automatically
4. **Batch operations**: Combine requests to reduce overhead

## Architecture Overview

```
Copilot CLI
    ↓
MCP Server (this tool)
    ↓
    ├─→ YouTube (yt-dlp) → TrendingContent
    ├─→ Reddit (PRAW)    → TrendingContent
    ├─→ X (Tweepy)       → TrendingContent
    ├─→ TikTok (Advanced) → TrendingContent
    └─→ Instagram (Advanced) → TrendingContent
         ↓
    Analysis Engine
         ↓
    Viral Patterns
         ↓
    Export (JSON/CSV/MD)
         ↓
    Feed to Higgsfield
```

## Next: Connect to Your YouTube Growth Pipeline

Once trending data is flowing:

1. **Research Phase**: Use viral trends to identify angles
2. **Content Generation**: Feed trends to Higgsfield for video creation
3. **Tracking**: Store analytics of your videos vs. trending benchmarks
4. **Iteration**: Refine based on performance

See `/docs/verified-youtube-higgsfield-growth-pipeline.md` for full pipeline context.
