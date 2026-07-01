# Viral Content Trend Scraper - MCP Setup & Installation Complete ✓

All dependencies have been successfully installed! Here's what was set up:

## ✓ Installation Status

### Python Dependencies (14 packages)
```
✓ requests (HTTP client)
✓ beautifulsoup4 (HTML parsing)
✓ selenium (Web automation)
✓ playwright (Headless browser - TikTok scraping)
✓ yt-dlp (YouTube scraper)
✓ instagrapi (Instagram client)
✓ praw (Reddit API)
✓ tweepy (X/Twitter API)
✓ aiohttp (Async HTTP)
✓ sqlalchemy (Database ORM)
✓ pydantic (Data validation)
✓ python-dotenv (Environment config)
✓ httpx (HTTP client)
✓ lxml (XML/HTML parsing)
```

### Browser Runtime
- ✓ Playwright Chromium (for TikTok dynamic scraping)
- ✓ FFmpeg (for video processing)

### MCP Framework
- ✓ Python MCP SDK (message protocol server)

## 📋 Next Steps

### 1. Configure API Credentials

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp tools/mcp-viral-scraper/.env.example tools/mcp-viral-scraper/.env
```

**Required for immediate use:**
- None (YouTube & Reddit work without auth in basic mode)

**Optional but recommended:**
- **Reddit**: Get free credentials at https://www.reddit.com/prefs/apps
- **X/Twitter**: Bearer token from https://developer.twitter.com/
- **Instagram**: Username/password (use app-specific password for 2FA)
- **YouTube**: API key for authenticated requests (avoid quota limits)

### 2. Start the MCP Server

```bash
cd tools/mcp-viral-scraper
python server.py
```

Expected output:
```
INFO:root:Starting Viral Content Trend Scraper MCP Server
Server running on stdio
```

### 3. Configure in Copilot

Add to your Copilot config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "viral-scraper": {
      "command": "python",
      "args": ["/full/path/to/tools/mcp-viral-scraper/server.py"]
    }
  }
}
```

### 4. Test the Tools

Once running in Copilot, test these prompts:

```
"Find trending tech content from YouTube, Reddit, and X right now"
"What viral patterns are trending in short-form video on TikTok?"
"Search for AI trends on Instagram and analyze viral potential"
"Export a trending report for gaming content this week"
"Give me creator insights on viral YouTubers in the AI space"
```

## 🔧 MCP Tools Available

1. **get_trending_content** (Platform + time window)
   - Returns trending videos/posts with metadata
   - Output: [title, views, engagement, viral_score, url, creator]

2. **analyze_viral_patterns** (Keywords + platforms)
   - Identifies what makes content viral
   - Output: [trends, engagement_type, sentiment, audience]

3. **search_trend_keyword** (Keyword + platform)
   - Searches specific trends across platforms
   - Output: Search results with relevance scores

4. **get_creator_insights** (Creator name + platform)
   - Analyzes creator content performance
   - Output: [avg_views, content_themes, upload_frequency, growth]

5. **export_trending_report** (Platforms + format)
   - Generates CSV/JSON report of trending data
   - Output: Downloadable file with analyzed trends

## 📊 Platform-Specific Details

### YouTube (Ready)
- Method: `yt-dlp` CLI (no API key needed for basic trending)
- Limit: 50-100 trending videos
- Latency: 2-5 seconds
- Auth: Optional (API key removes quota limits)

### Reddit (Ready)
- Method: PRAW API
- Limit: 100 top posts per subreddit
- Subreddits monitored: r/Futurology, r/technology, r/videos, r/news
- Auth: Free (get at /prefs/apps)

### X/Twitter (Ready with auth)
- Method: Tweepy API
- Limit: 100 tweets per search
- Auth: Required (free developer tier)
- Bearer Token: Set in .env

### TikTok (Basic & Advanced)
- Basic: Mock data (rate-limited by official API)
- Advanced: Playwright browser automation (in `scrapers_advanced.py`)
- Requires: Playwright Chromium (already installed)
- Auth: Optional (login for better results)

### Instagram (Basic & Advanced)
- Basic: Mock data
- Advanced: Instagrapi client library (in `scrapers_advanced.py`)
- Auth: Instagram credentials required

## 🚀 Integration with Higgsfield Pipeline

To connect trends → content generation:

1. Run scraper daily to collect trending data
2. Pass trending keywords to Higgsfield content generation
3. Track generated video performance against scraped trends
4. Use viral patterns in Soul ID analysis
5. Feed feedback into Virality Predictor

```bash
# Example: Collect trends, generate content
python tools/mcp-viral-scraper/server.py &
# Then in Higgsfield:
# 1. Use get_trending_content() for title ideas
# 2. Use analyze_viral_patterns() for thumbnail/hook analysis
# 3. Use export_trending_report() for campaign planning
```

## 🛠️ Troubleshooting

**Server won't start**
- Check Python version: `python --version` (need 3.8+)
- Check imports: `python -c "from mcp.server import Server"`
- Check dependencies: `pip list | grep -E "mcp|praw|tweepy|yt-dlp"`

**Playwright timeout on TikTok**
- First run might be slow (browser downloading)
- Try with VPN if geo-blocked
- Check internet: `curl -I https://www.tiktok.com`

**Reddit 404 errors**
- Verify subreddit spelling (case-sensitive)
- Check if subreddit is public/searchable
- Try default subreddits: Futurology, technology, videos, news

**No Instagram/TikTok results**
- These return mock data in basic mode
- To enable real scraping: use `scrapers_advanced.py`
- Requires: Instagram login + Playwright setup

**Rate limiting / 429 errors**
- Reduce request frequency
- Add delays between tools in Copilot
- Use Reddit/YouTube (no rate limits) first
- Implement caching (see `scrapers_advanced.py` Redis example)

## 📚 Documentation

- **README.md**: Full architecture & data structures
- **QUICKSTART.md**: 5-minute setup guide with examples
- **.env.example**: Template for all credentials
- **server.py**: Main MCP server (18 KB, well-commented)
- **scrapers_advanced.py**: Advanced scrapers for TikTok/Instagram/YouTube analytics

## ✨ What's Next?

Phase 2 enhancements (optional):
- [ ] Add database storage (SQLite) for trend history
- [ ] Implement sentiment analysis (transformers)
- [ ] Create visualization dashboard (Plotly)
- [ ] Schedule batch jobs (APScheduler)
- [ ] Real-time webhook support for alerts
- [ ] Machine learning viral score predictor
- [ ] Integration with video generation APIs (Replicate, Higgsfield)

---

**Status**: ✓ Ready to use  
**Last updated**: Today  
**Server version**: v1.0  
**Maintained by**: GitHub Copilot
