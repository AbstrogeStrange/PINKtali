import asyncio
import os
import json
from bullmq import Worker, Job

REDIS_HOST = os.getenv('REDIS_HOST', '127.0.0.1')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))

# We'd import the Prisma Python client or make DB calls via an HTTP micro-API in prod.
# For this scaffold we mock the DB query and cache write.

async def compute_trending(job: Job):
    print("[Trending Worker] Computing trending scores...")

    # In production, we'd call: SELECT videos + views + likes + comments from DB
    mock_videos = [
        {"id": "v1", "title": "Epic React Tutorial", "viewsLast24h": 120_000, "likeCount": 5000, "commentCount": 800, "type": "LONG_FORM"},
        {"id": "v2", "title": "AWS S3 Explained", "viewsLast24h": 80_000, "likeCount": 3200, "commentCount": 400, "type": "LONG_FORM"},
        {"id": "v3", "title": "CSS Tricks #shorts", "viewsLast24h": 500_000, "likeCount": 25_000, "commentCount": 1200, "type": "SHORT"},
    ]

    def score(v):
        return v["viewsLast24h"] + (v["likeCount"] * 5) + (v["commentCount"] * 3)

    long_form = sorted([v for v in mock_videos if v["type"] == "LONG_FORM"], key=score, reverse=True)
    shorts = sorted([v for v in mock_videos if v["type"] == "SHORT"], key=score, reverse=True)

    print(f"[Trending Worker] Top long-form: {long_form[0]['title'] if long_form else 'N/A'}")
    print(f"[Trending Worker] Top short: {shorts[0]['title'] if shorts else 'N/A'}")

    # In production:
    # await redis.setex("trending:global:LONG_FORM", 900, json.dumps(long_form))
    # await redis.setex("trending:global:SHORT", 900, json.dumps(shorts))

    return {"computed": True, "longFormCount": len(long_form), "shortsCount": len(shorts)}


async def main():
    print("Starting BullMQ Trending Worker...")
    worker = Worker('trending-calculator', compute_trending, {
        "connection": f"redis://{REDIS_HOST}:{REDIS_PORT}"
    })
    print("Worker listening for trending jobs...")
    await asyncio.Event().wait()


if __name__ == "__main__":
    asyncio.run(main())
