#!/usr/bin/env python3
"""Generate a dependency-free SVG telemetry card for the profile README."""

from __future__ import annotations

import json
import os
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from xml.sax.saxutils import escape


API = "https://api.github.com"
GRAPHQL = f"{API}/graphql"
TOKEN = os.environ.get("GITHUB_TOKEN", "")
USERNAME = os.environ.get("PROFILE_USER", "Herberth7777")


def request_json(url: str, *, data: dict | None = None) -> dict:
    payload = None if data is None else json.dumps(data).encode("utf-8")
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "Herberth7777-profile-metrics",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"
    request = urllib.request.Request(url, data=payload, headers=headers)
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def contribution_data() -> tuple[int, list[list[dict]]]:
    query = """
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks { contributionDays { contributionCount date } }
          }
        }
      }
    }
    """
    response = request_json(
        GRAPHQL,
        data={"query": query, "variables": {"login": USERNAME}},
    )
    if response.get("errors"):
        raise RuntimeError(response["errors"][0].get("message", "GraphQL error"))
    calendar = response["data"]["user"]["contributionsCollection"]["contributionCalendar"]
    return calendar["totalContributions"], calendar["weeks"]


def streaks(weeks: list[list[dict]] | dict) -> tuple[int, int]:
    if weeks and isinstance(weeks[0], dict) and "contributionDays" in weeks[0]:
        days = [day for week in weeks for day in week["contributionDays"]]
    else:
        days = [day for week in weeks for day in week]
    counts = {date.fromisoformat(day["date"]): day["contributionCount"] for day in days}

    longest = 0
    running = 0
    for day in sorted(counts):
        if counts[day] > 0:
            running += 1
            longest = max(longest, running)
        else:
            running = 0

    cursor = datetime.now(timezone.utc).date()
    if counts.get(cursor, 0) == 0:
        cursor -= timedelta(days=1)
    current = 0
    while counts.get(cursor, 0) > 0:
        current += 1
        cursor -= timedelta(days=1)
    return current, longest


def build_svg(total: int, current: int, longest: int, public_repos: int, weeks: list[dict]) -> str:
    week_totals = [sum(day["contributionCount"] for day in week["contributionDays"]) for week in weeks[-40:]]
    peak = max(week_totals, default=1) or 1
    bars = []
    for index, value in enumerate(week_totals):
        height = 6 if value == 0 else 8 + round(38 * value / peak)
        x = 39 + index * 30
        y = 246 - height
        color = "#263459" if value == 0 else ("#7CF7E8" if value == peak else "#6D5EF7")
        bars.append(
            f'<rect x="{x}" y="{y}" width="18" height="{height}" rx="4" fill="{color}" opacity="0.92" />'
        )

    updated = datetime.now(timezone.utc).strftime("%d %b %Y · %H:%M UTC").upper()
    cards = [
        ("CONTRIBUIÇÕES · 12 MESES", total, "#7CF7E8"),
        ("SEQUÊNCIA ATUAL", f"{current}D", "#C65CFF"),
        ("MAIOR SEQUÊNCIA", f"{longest}D", "#7CF7E8"),
        ("REPOSITÓRIOS PÚBLICOS", public_repos, "#C65CFF"),
    ]
    card_markup = []
    for index, (label, value, color) in enumerate(cards):
        x = 32 + index * 306
        card_markup.append(
            f'''<g transform="translate({x},42)">
  <rect width="286" height="126" rx="16" fill="#090E20" stroke="#263459" />
  <text x="20" y="34" fill="#7B8BAD" font-size="12" letter-spacing="1.5">{escape(str(label))}</text>
  <text x="20" y="89" fill="{color}" font-size="40" font-weight="700">{escape(str(value))}</text>
  <path d="M20 106H266" stroke="#18213D" stroke-width="4" stroke-linecap="round" />
  <path d="M20 106H{126 + index * 26}" stroke="{color}" stroke-width="4" stroke-linecap="round" />
</g>'''
        )

    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="290" viewBox="0 0 1280 290" role="img" aria-labelledby="title desc">
  <title id="title">Métricas ao vivo de {escape(USERNAME)}</title>
  <desc id="desc">Contribuições, sequências e repositórios públicos atualizados automaticamente.</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#050816" /><stop offset="1" stop-color="#0B0820" />
    </linearGradient>
    <linearGradient id="line"><stop stop-color="#7CF7E8" /><stop offset="0.5" stop-color="#6D5EF7" /><stop offset="1" stop-color="#C65CFF" /></linearGradient>
    <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#6D5EF7" stroke-width="0.5" opacity="0.10" /></pattern>
  </defs>
  <rect width="1280" height="290" rx="22" fill="url(#bg)" />
  <rect x="1" y="1" width="1278" height="288" rx="21" fill="url(#grid)" stroke="#263459" stroke-width="2" />
  <path d="M28 22H420" stroke="url(#line)" stroke-width="2" />
  <text x="32" y="27" fill="#7CF7E8" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="11" letter-spacing="2">LIVE.SIGNAL / GITHUB TELEMETRY</text>
  <text x="1248" y="27" text-anchor="end" fill="#7B8BAD" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="10">UPDATED {updated}</text>
  <g font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">{''.join(card_markup)}</g>
  <text x="32" y="196" fill="#7B8BAD" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="10" letter-spacing="2">WEEKLY ACTIVITY / LAST 40 WEEKS</text>
  {''.join(bars)}
  <circle cx="1244" cy="262" r="4" fill="#7CF7E8"><animate attributeName="opacity" values="1;.2;1" dur="1.8s" repeatCount="indefinite" /></circle>
  <text x="1230" y="266" text-anchor="end" fill="#7CF7E8" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="10">SYNCED</text>
</svg>'''


def main() -> None:
    profile = request_json(f"{API}/users/{USERNAME}")
    total, weeks = contribution_data()
    current, longest = streaks(weeks)
    svg = build_svg(total, current, longest, profile["public_repos"], weeks)
    output = Path("dist/profile-metrics.svg")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(svg, encoding="utf-8")
    print(f"Generated {output} for {USERNAME}")


if __name__ == "__main__":
    main()
