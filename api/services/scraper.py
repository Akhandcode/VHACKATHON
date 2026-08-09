import httpx
import xml.etree.ElementTree as ET
from typing import List
import logging

logger = logging.getLogger("api.scraper")

class RawTopic:
    def __init__(self, title: str, summary: str, source_url: str):
        self.title = title
        self.summary = summary
        self.source_url = source_url

    def to_dict(self):
        return {
            "title": self.title,
            "summary": self.summary,
            "sourceUrl": self.source_url
        }

async def fetch_arxiv_topics(query: str = "cat:cs.AI OR cat:cs.CR", max_results: int = 5) -> List[RawTopic]:
    """
    Fetches recent computer science AI and security papers from ArXiv API.
    """
    url = f"http://export.arxiv.org/api/query?search_query={query}&sortBy=submittedDate&sortOrder=descending&max_results={max_results}"
    topics = []
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            if response.status_code == 200:
                root = ET.fromstring(response.text)
                namespace = {'atom': 'http://www.w3.org/2005/Atom'}
                for entry in root.findall('atom:entry', namespace):
                    title_elem = entry.find('atom:title', namespace)
                    summary_elem = entry.find('atom:summary', namespace)
                    id_elem = entry.find('atom:id', namespace)
                    
                    title = title_elem.text.strip().replace('\n', ' ') if title_elem is not None else ""
                    summary = summary_elem.text.strip().replace('\n', ' ') if summary_elem is not None else ""
                    source_url = id_elem.text.strip() if id_elem is not None else "https://arxiv.org"
                    
                    if title:
                        topics.append(RawTopic(title=title, summary=summary[:300], source_url=source_url))
    except Exception as e:
        logger.error(f"ArXiv scraping error: {str(e)}")
    return topics

async def fetch_hackernews_topics(limit: int = 5) -> List[RawTopic]:
    """
    Fetches top tech stories from HackerNews API.
    """
    topics = []
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            top_ids_resp = await client.get("https://hacker-news.firebaseio.com/v0/topstories.json")
            if top_ids_resp.status_code == 200:
                item_ids = top_ids_resp.json()[:limit]
                for item_id in item_ids:
                    item_resp = await client.get(f"https://hacker-news.firebaseio.com/v0/item/{item_id}.json")
                    if item_resp.status_code == 200:
                        data = item_resp.json()
                        title = data.get("title", "")
                        source_url = data.get("url", f"https://news.ycombinator.com/item?id={item_id}")
                        if title:
                            topics.append(RawTopic(
                                title=title,
                                summary=f"HackerNews discussion topic regarding {title}.",
                                source_url=source_url
                            ))
    except Exception as e:
        logger.error(f"HackerNews scraping error: {str(e)}")
    return topics

async def ingest_live_candidate_topics(domain: str) -> List[RawTopic]:
    """
    Orchestrates multi-source async scraping across ArXiv and HackerNews.
    """
    arxiv_topics = await fetch_arxiv_topics(max_results=4)
    hn_topics = await fetch_hackernews_topics(limit=4)
    combined = arxiv_topics + hn_topics
    
    # Baseline fallback topic if live endpoints are rate limited or offline
    if not combined:
        combined.append(RawTopic(
            title=f"Disclosures and Memory Safety Analysis in {domain} Runtimes",
            summary=f"Automated evaluation of sandboxing techniques and zero-trust verification in modern {domain} deployment frameworks.",
            source_url="https://arxiv.org/abs/2608.01234"
        ))
    return combined
