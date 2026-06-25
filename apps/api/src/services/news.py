"""
On-demand Google News RSS fetcher with in-memory TTL cache.

Fetches news articles for a given operator/project name from Google News RSS.
Results are cached in memory for 6 hours to avoid hammering Google.
"""

import re
import time
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from html import unescape
from urllib.parse import quote_plus
from urllib.request import urlopen, Request
from urllib.error import URLError

_CACHE: dict[str, tuple[float, list[dict]]] = {}
_CACHE_TTL = 6 * 60 * 60  # 6 hours

_CORP_SUFFIXES = re.compile(
    r"\b(inc|incorporated|corp|corporation|ltd|limited|pty|llc|co|company|s\.?a\.?)\b\.?",
    re.IGNORECASE,
)


def _clean_query(name: str) -> str:
    """Strip corporate suffixes to build a better search query."""
    name = _CORP_SUFFIXES.sub("", name)
    name = re.sub(r"[.,\-()']", " ", name)
    return " ".join(name.split()).strip()


def _parse_rss(xml_bytes: bytes) -> list[dict]:
    """Parse Google News RSS XML into a list of article dicts."""
    articles = []
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError:
        return articles

    for item in root.iter("item"):
        title_el = item.find("title")
        link_el = item.find("link")
        pub_date_el = item.find("pubDate")
        source_el = item.find("source")

        if title_el is None or link_el is None:
            continue

        articles.append({
            "title": unescape(title_el.text or ""),
            "url": link_el.text or "",
            "published": pub_date_el.text if pub_date_el is not None else None,
            "source": source_el.text if source_el is not None else None,
        })

    return articles


def fetch_news(operator: str, project_name: str | None = None, limit: int = 5) -> list[dict]:
    """
    Fetch recent news for an operator (and optionally a project name).
    Returns cached results if available and fresh.
    """
    clean_operator = _clean_query(operator)
    if not clean_operator:
        return []

    cache_key = f"{clean_operator}|{project_name or ''}"

    now = time.time()
    if cache_key in _CACHE:
        cached_time, cached_articles = _CACHE[cache_key]
        if now - cached_time < _CACHE_TTL:
            return cached_articles[:limit]

    query = f'"{clean_operator}" mining'
    if project_name and project_name.lower() != clean_operator.lower():
        clean_project = _clean_query(project_name)
        if clean_project:
            query = f'"{clean_operator}" OR "{clean_project}" mining mineral'

    url = f"https://news.google.com/rss/search?q={quote_plus(query)}&hl=en-CA&gl=CA&ceid=CA:en"
    req = Request(url, headers={
        "User-Agent": "Mozilla/5.0 (compatible; CriticalMineralsTracker/1.0)",
    })

    try:
        with urlopen(req, timeout=8) as resp:
            xml_bytes = resp.read()
    except (URLError, TimeoutError):
        return _CACHE.get(cache_key, (0, []))[1][:limit]

    articles = _parse_rss(xml_bytes)
    articles.sort(key=_parse_pub_date, reverse=True)
    _CACHE[cache_key] = (now, articles)

    return articles[:limit]


def _parse_pub_date(article: dict) -> float:
    """Parse RFC 2822 date string to a timestamp for sorting. Returns 0 on failure."""
    pub = article.get("published")
    if not pub:
        return 0
    try:
        return parsedate_to_datetime(pub).timestamp()
    except Exception:
        return 0
