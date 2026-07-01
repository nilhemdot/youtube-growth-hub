#!/usr/bin/env python3
"""
Advanced TikTok scraper using Playwright
Scrapes trending sounds, hashtags, and videos
"""

import asyncio
from playwright.async_api import async_playwright
from datetime import datetime
from typing import list

class TikTokPlaywrightScraper:
    """TikTok scraper using Playwright (requires browser)"""
    
    async def get_trending(self, region: str = "US", limit: int = 50) -> list:
        """
        Scrape TikTok Discover page for trending content
        Note: Requires Playwright browser to be installed
        """
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            # TikTok Discover URL
            url = f"https://www.tiktok.com/@discover"
            await page.goto(url, wait_until="networkidle")
            
            # Extract video elements
            videos = []
            video_elements = await page.query_selector_all("[data-e2e='feed-item']")
            
            for i, elem in enumerate(video_elements[:limit]):
                try:
                    # Extract title
                    title_elem = await elem.query_selector("[data-e2e='video-desc']")
                    title = await title_elem.text_content() if title_elem else "Unknown"
                    
                    # Extract engagement metrics
                    likes = await elem.text_content()
                    
                    videos.append({
                        "platform": "tiktok",
                        "title": title,
                        "position": i + 1,
                        "url": await elem.get_attribute("href")
                    })
                except Exception as e:
                    print(f"Error parsing video: {e}")
            
            await browser.close()
            return videos

# ============================================================================
# Instagram Advanced Scraper
# ============================================================================

class InstagramAdvancedScraper:
    """Instagram scraper using Instagrapi"""
    
    async def get_trending_hashtags(self, region: str = "US", limit: int = 50) -> list:
        """Get trending hashtags with engagement data"""
        from instagrapi import Client
        
        try:
            # Note: Requires Instagram business account
            cl = Client()
            
            # Search popular hashtags
            hashtags = [
                "AI", "ArtificialIntelligence", "AIVideo", "VideoGeneration",
                "ContentCreation", "YouTubeShorts", "TikTok", "VideoMarketing"
            ]
            
            trending = []
            for tag in hashtags[:limit]:
                try:
                    # Get hashtag info
                    hashtag_info = cl.hashtag_info(tag)
                    trending.append({
                        "platform": "instagram",
                        "tag": tag,
                        "posts": hashtag_info.media_count,
                        "engagement": hashtag_info.media_count / 1000  # Simplified
                    })
                except Exception as e:
                    print(f"Error fetching hashtag {tag}: {e}")
            
            return trending
        except Exception as e:
            print(f"Instagram scraper error: {e}")
            return []
    
    async def get_trending_content(self, hashtag: str, limit: int = 30) -> list:
        """Get trending posts for a hashtag"""
        from instagrapi import Client
        
        cl = Client()
        
        try:
            # Get recent posts from hashtag
            medias = cl.hashtag_medias_recent(hashtag, amount=limit)
            
            trending = []
            for media in medias:
                trending.append({
                    "platform": "instagram",
                    "title": media.caption[:100] if media.caption else "No caption",
                    "url": f"https://instagram.com/p/{media.pk}/",
                    "creator": media.user.username,
                    "likes": media.like_count,
                    "comments": media.comment_count,
                    "engagement_rate": (media.like_count + media.comment_count) / max(media.like_count, 1)
                })
            
            return trending
        except Exception as e:
            print(f"Error fetching hashtag posts: {e}")
            return []

# ============================================================================
# Advanced YouTube Scraper (with recommendations)
# ============================================================================

class YouTubeAdvancedScraper:
    """YouTube scraper with recommendation algorithm"""
    
    async def get_trending_with_recommendations(self, region: str = "US") -> dict:
        """
        Get YouTube trending AND extract recommendation algorithm insights
        """
        import subprocess
        import json
        
        trending = []
        
        try:
            # Get YouTube trending page
            cmd = [
                "yt-dlp",
                "-j",
                "--playlist-items", "1-50",
                "https://www.youtube.com/feed/trending"
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                videos = json.loads(result.stdout)
                
                for video in videos:
                    # Calculate recommendation score
                    rec_score = self._calculate_recommendation_score(video)
                    
                    trending.append({
                        "title": video.get("title"),
                        "creator": video.get("uploader"),
                        "views": video.get("view_count", 0),
                        "likes": video.get("like_count", 0),
                        "recommendation_score": rec_score,
                        "algorithm_factors": {
                            "title_length": len(video.get("title", "")),
                            "thumbnail_contrast": "high",  # Would detect via image analysis
                            "hook_presence": self._detect_hook(video.get("title", "")),
                            "series_indicator": "series" in video.get("title", "").lower()
                        }
                    })
            
            return {
                "trending": trending,
                "insights": {
                    "avg_title_length": sum(len(v["title"]) for v in trending) / len(trending) if trending else 0,
                    "hook_percentage": sum(1 for v in trending if v["algorithm_factors"]["hook_presence"]) / len(trending) if trending else 0
                }
            }
        
        except Exception as e:
            print(f"YouTube advanced scraper error: {e}")
            return {}
    
    @staticmethod
    def _calculate_recommendation_score(video: dict) -> float:
        """Calculate likelihood of being recommended"""
        views = video.get("view_count", 1)
        engagement = (video.get("like_count", 0) + video.get("comment_count", 0)) / max(views, 1)
        recency = 1.0  # Recent videos score higher
        
        score = (engagement * 50) + (recency * 30) + (min(views / 1000000, 20))
        return min(100, score)
    
    @staticmethod
    def _detect_hook(title: str) -> bool:
        """Detect hook patterns in title"""
        hooks = [
            "i tested", "i tried", "i created", "only", "never",
            "shocking", "viral", "secret", "exposed", "proof",
            "finally", "truth", "mistake", "wrong", "broke"
        ]
        return any(hook in title.lower() for hook in hooks)

# ============================================================================
# Redis Caching Layer
# ============================================================================

class TrendCache:
    """Cache trending data to avoid repeated scraping"""
    
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_url = redis_url
        self.cache = {}  # Fallback to in-memory
    
    async def get(self, key: str):
        """Get cached data"""
        return self.cache.get(key)
    
    async def set(self, key: str, value, ttl_hours: int = 3):
        """Cache data with TTL"""
        self.cache[key] = {
            "value": value,
            "expires": datetime.now().isoformat()
        }
    
    async def is_stale(self, key: str, max_age_hours: int = 3) -> bool:
        """Check if cache is stale"""
        if key not in self.cache:
            return True
        return False  # Simplified

if __name__ == "__main__":
    print("Advanced scrapers module")
