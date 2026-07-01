# Viral Trend Scraper - MCP Server for YouTube, TikTok, Instagram, Reddit & X

A Model Context Protocol (MCP) server that aggregates and analyzes viral content trends across major social media platforms.

## Features

### Supported Platforms
- ✅ **YouTube** — Trending videos, channel data, engagement metrics
- ⚠️ **TikTok** — Requires browser automation (Playwright/Selenium)
- ⚠️ **Instagram** — Requires Instagrapi or Meta Graph API
- ✅ **Reddit** — Hot posts, subreddit trends, engagement
- ✅ **X (Twitter)** — Trending topics, tweet volume

### Core Tools

1. **get_trending_content** — Fetch trending content from any platform
   ```bash
   platforms: ["youtube", "reddit", "x"]
   region: "US"
   limit: 25
   ```

2. **analyze_viral_patterns** — Identify viral trends and patterns
   ```bash
   platforms: ["youtube", "tiktok", "instagram"]
   lookback_hours: 24
   ```

3. **search_trend_keyword** — Search for specific keywords in trending
   ```bash
   keyword: "AI video generation"
   platforms: ["youtube", "reddit"]
   ```

4. **get_creator_insights** — Analyze top creators and their patterns
   ```bash
   platform: "youtube"
   top_n: 10
   ```

5. **export_trending_report** — Export data as JSON, CSV, or Markdown
   ```bash
   platforms: ["youtube", "reddit", "x"]
   format: "markdown"
   ```

## Installation

### Prerequisites
- Python 3.10+
- yt-dlp (for YouTube)
- Playwright or Selenium (for dynamic scraping)
- API credentials (Reddit, X, Instagram)

### Setup

```bash
# Clone or navigate to this directory
cd tools/mcp-viral-scraper

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env

# Edit .env with your API credentials:
# - REDDIT_CLIENT_ID
# - REDDIT_CLIENT_SECRET
# - REDDIT_USER_AGENT
# - X_BEARER_TOKEN
# - INSTAGRAM_USERNAME
# - INSTAGRAM_PASSWORD
```

## Usage

### Start the MCP Server

```bash
python server.py
```

The server will listen for MCP client connections.

### Configure in MCP Client

Add to your `claude_desktop_config.json` or equivalent:

```json
{
  "mcpServers": {
    "viral-scraper": {
      "command": "python",
      "args": ["/path/to/mcp-viral-scraper/server.py"],
      "env": {
        "REDDIT_CLIENT_ID": "your-client-id",
        "REDDIT_CLIENT_SECRET": "your-secret",
        "X_BEARER_TOKEN": "your-token"
      }
    }
  }
}
```

### Example Queries

**Get YouTube and Reddit trending:**
```
Use the viral scraper to fetch trending content from youtube and reddit for the US region, 
limit to 30 results
```

**Find AI-related viral trends:**
```
Search for the keyword "artificial intelligence" in trending content across youtube, reddit, and x
```

**Analyze viral patterns:**
```
Analyze viral patterns from youtube and tiktok over the last 24 hours
```

## Data Structures

### TrendingContent
```python
{
  "platform": "youtube",
  "title": "I Tested 10 AI Tools...",
  "url": "https://youtube.com/watch?v=...",
  "creator": "CreatorName",
  "views": 1500000,
  "engagement": 0.087,  # (likes + comments) / views
  "posted_at": "2026-07-01T12:00:00",
  "tags": ["AI", "tools", "review"],
  "viral_score": 87.5,  # 0-100
  "sentiment": "positive"
}
```

### TrendAnalysis
```python
{
  "platform": "youtube",
  "trending_topics": ["AI Video Tools", "AI Tutorials", "AI Reviews"],
  "top_creators": ["Creator1", "Creator2", ...],
  "content_formats": ["Tutorial", "Review", "Comparison"],
  "peak_posting_times": ["9:00 AM UTC", "5:00 PM UTC"],
  "engagement_rates": {"reviews": 0.12, "tutorials": 0.08},
  "viral_patterns": {...},
  "timestamp": "2026-07-01T12:00:00"
}
```

## Architecture

```
mcp-viral-scraper/
├── server.py              # MCP server main
├── requirements.txt       # Python dependencies
├── .env.example          # Environment template
├── scrapers/
│   ├── youtube.py        # YouTube trending via yt-dlp
│   ├── tiktok.py         # TikTok via Playwright
│   ├── instagram.py      # Instagram via Instagrapi
│   ├── reddit.py         # Reddit via PRAW
│   └── x.py              # X via Tweepy
├── analysis/
│   ├── viral_patterns.py # Pattern detection
│   ├── sentiment.py      # Sentiment analysis
│   └── forecasting.py    # Trend forecasting
├── storage/
│   ├── database.py       # SQLAlchemy models
│   └── cache.py          # Redis caching
└── tests/
    ├── test_scrapers.py
    └── test_tools.py
```

## API Credentials Setup

### Reddit
1. Create app at https://www.reddit.com/prefs/apps
2. Get `client_id`, `client_secret`, `user_agent`
3. Add to `.env`

### X (Twitter)
1. Apply for API access at https://developer.twitter.com
2. Get Bearer Token
3. Add to `.env`

### Instagram
1. Use Instagrapi (requires Instagram credentials)
2. Or use Meta Graph API for business accounts
3. Add to `.env`

### YouTube
- Uses public API via yt-dlp (no credentials required for trending)
- Optional: YouTube Data API for detailed analytics

## Roadmap

- [ ] TikTok scraper (Playwright implementation)
- [ ] Instagram scraper (Meta Graph API)
- [ ] Persistent database storage (SQLite/PostgreSQL)
- [ ] Sentiment analysis (transformers)
- [ ] Trend forecasting (Prophet/ARIMA)
- [ ] Real-time webhooks
- [ ] Dashboard UI
- [ ] Scheduled batch runs
- [ ] Integration with Higgsfield for content generation

## Performance Tips

1. **Parallel scraping** — Run multiple platforms concurrently
2. **Caching** — Cache results for 1-3 hours
3. **Rate limiting** — Respect API rate limits
4. **Batch operations** — Collect then analyze

## Troubleshooting

**yt-dlp errors:**
```bash
# Update yt-dlp
pip install --upgrade yt-dlp
```

**PRAW authentication fails:**
```bash
# Check Reddit credentials in .env
# Verify app is registered at reddit.com/prefs/apps
```

**Playwright browser issues:**
```bash
# Install browser binaries
playwright install
```

## Future: Integration with Your Pipeline

This MCP server is designed to feed into your Higgsfield content generation pipeline:

1. **Scrape trends** → Identify viral angles
2. **Analyze patterns** → Understand what works
3. **Generate content** → Use Higgsfield to create optimized videos
4. **Track performance** → Update analytics
5. **Iterate** → Refine based on real data

## License

MIT

## Contributing

Contributions welcome! Please submit PRs to improve scrapers or add new platforms.
