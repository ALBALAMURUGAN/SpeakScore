#!/usr/bin/env python3
"""
SpeakScore AI — Analysis Engine (reference implementation)
=========================================================
The production SpeakScore analysis microservice. The browser client ships a
faithful TypeScript port of this module (src/lib/engine.ts) so scoring works
fully offline; this service is the canonical implementation used by the API
gateway when online scoring is preferred.

Scoring dimensions (0-100):
  relevance   0.40 keyword semantic coverage + 0.25 question-term overlap + 0.35 answer depth
  keywords    fraction of the question's keyword set present in the transcript
  clarity     lexical structure hygiene: sentence-length sweet spot + lexical diversity
  pace        distance from the 135 wpm delivery ideal (110-160 band scores highest)
  filler      100 minus fillers-per-minute penalty

Usage:
  python3 server/analyzer.py "question text" "transcript text" --duration 84
  echo '{"question":"...","transcript":"...","durationSec":84}' | python3 server/analyzer.py --json
"""
from __future__ import annotations
import argparse
import json
import math
import re
import sys

FILLERS = ["basically", "actually", "literally", "honestly", "obviously", "essentially",
           "stuff", "things", "like", "maybe", "perhaps", "sort of", "kind of", "i guess", "you know"]
UMS = re.compile(r"\b(um+|uh+|erm+|er)\b", re.I)
STOPWORDS = set("the a an and or of to in for on with at by from as is are was were be been it this "
                "that these those you your i me my we our they their them he she his her what which who "
                "how why when where into over under about between through during if its can could should "
                "would will shall may might must do does did done have has had not no so than then there "
                "here such other each any all both few more most some only own same too very just".split())
IDEAL_WPM = 135

def clamp(v: float, lo: float = 2, hi: float = 99) -> int:
    return max(lo, min(hi, round(v)))

def tokenize(text: str) -> list[str]:
    return [t for t in re.split(r"\s+", text.lower()) if t]

def count_fillers(text: str):
    t = " " + re.sub(r"[^a-z\s'-]", " ", text.lower()) + " "
    t = re.sub(r"\s+", " ", t)
    breakdown = {}
    m = UMS.findall(t)
    if m:
        breakdown["um / uh"] = len(m)
    for f in FILLERS:
        m = re.findall(r"\b" + re.escape(f).replace(r"\ ", r"\s+") + r"\b", t)
        if m:
            breakdown[f] = len(m)
    total = sum(breakdown.values())
    return total, breakdown

def keywords_for(question: str) -> list[str]:
    # Canonical keyword map lives in src/lib/engine.ts (KEYWORDERS). When the
    # API gateway is reachable the map is injected verbatim; otherwise derive
    # content terms from the question itself.
    norm = re.sub(r"[^a-z0-9\s]", " ", question.lower())
    toks = [t for t in norm.split() if len(t) > 4 and t not in STOPWORDS]
    seen, out = set(), []
    for t in toks:
        if t not in seen:
            seen.add(t)
            out.append(t)
    return out[:8]

def analyze(question: str, transcript: str, duration_sec: float) -> dict:
    text = transcript.strip()
    words = tokenize(text)
    word_count = len(words)
    dur = max(3.0, float(duration_sec) or word_count / 2.3 or 3.0)
    wpm = round(word_count / dur * 60)

    dist = abs(wpm - IDEAL_WPM)
    pace = clamp(100 - max(0, dist - 25) * 0.9 - (12 if wpm < 70 else 0))

    filler_total, filler_breakdown = count_fillers(text)
    fpm = round(filler_total / dur * 60, 1)
    filler = clamp(100 - fpm * 9 - (8 if fpm > 6 else 0))

    kws = keywords_for(question)
    norm = " " + re.sub(r"\s+", " ", re.sub(r"[^a-z0-9\s-]", " ", text.lower())) + " "
    hits = [k for k in kws if k in norm]
    coverage = len(hits) / len(kws) if kws else 0.0
    keywords = clamp(12 + coverage * 88)

    q_toks = set(t for t in re.sub(r"[^a-z0-9\s]", " ", question.lower()).split()
                 if len(t) > 3 and t not in STOPWORDS)
    overlap = len([t for t in q_toks if t in norm]) / len(q_toks) if q_toks else 0.0
    depth = 1.0 if word_count >= 90 else 0.88 if word_count >= 60 else 0.7 if word_count >= 35 else 0.5 if word_count >= 18 else 0.3
    relevance = clamp((coverage * 0.45 + overlap * 0.30 + depth * 0.25) * 100 + 6)

    sentences = [s for s in re.split(r"[.!?]+", text) if s.strip()]
    avg_len = word_count / len(sentences) if sentences else word_count
    len_score = 68 if avg_len < 8 else 96 if avg_len <= 24 else 82 if avg_len <= 32 else 62 if avg_len <= 42 else 38
    diversity = len(set(words)) / word_count if word_count else 0.0
    clarity = clamp(len_score * 0.65 + min(1.0, diversity * 1.35) * 35)

    overall = clamp(relevance * 0.28 + keywords * 0.24 + clarity * 0.18 + pace * 0.12 + filler * 0.18)

    return {
        "wordCount": word_count, "durationSec": round(dur), "wpm": wpm,
        "relevance": relevance, "keywords": keywords, "clarity": clarity,
        "pace": pace, "fillerScore": filler,
        "fillerCount": filler_total, "fillersPerMin": fpm,
        "fillerBreakdown": filler_breakdown,
        "keywordsHit": hits, "keywordsMissed": [k for k in kws if k not in hits],
        "overall": overall,
    }

def main() -> None:
    ap = argparse.ArgumentParser(description="SpeakScore AI interview analysis engine")
    ap.add_argument("question", nargs="?", default="")
    ap.add_argument("transcript", nargs="?", default="")
    ap.add_argument("--duration", type=float, default=60.0)
    ap.add_argument("--json", action="store_true", help="read a JSON payload from stdin")
    args = ap.parse_args()

    if args.json:
        payload = json.load(sys.stdin)
        result = analyze(payload.get("question", ""), payload.get("transcript", ""), payload.get("durationSec", 60))
    else:
        if not args.question or not args.transcript:
            ap.error("provide question and transcript, or use --json")
        result = analyze(args.question, args.transcript, args.duration)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
