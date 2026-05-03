import asyncio
import os
import json
from bullmq import Worker, Job

REDIS_HOST = os.getenv('REDIS_HOST', '127.0.0.1')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
CREATOR_SHARE = 0.55

async def compute_monthly_revenue(job: Job):
    """
    Monthly Revenue Calculation Worker
    Runs on the 1st of every month at 2 AM UTC via BullMQ repeatable job.
    """
    print("[Revenue Worker] Starting monthly revenue calculation...")

    # In production, we'd query the DB directly via psycopg2 or a DB client.
    # Mock: simulate 3 monetized channels
    channels = [
        {"id": "ch1", "name": "TechBro", "stripeConnectId": "acct_mock1", "adRevenue": 185.40, "membershipRevenue": 120.00, "superThanksRevenue": 25.00},
        {"id": "ch2", "name": "DesignPro", "stripeConnectId": "acct_mock2", "adRevenue": 440.20, "membershipRevenue": 350.00, "superThanksRevenue": 100.00},
        {"id": "ch3", "name": "DailyVlog",  "stripeConnectId": None,          "adRevenue": 62.10,  "membershipRevenue": 0,      "superThanksRevenue": 5.00},
    ]

    for ch in channels:
        total = ch["adRevenue"] + ch["membershipRevenue"] + ch["superThanksRevenue"]
        creator_share = round(total * CREATOR_SHARE, 2)
        platform_fee = round(total - creator_share, 2)

        print(f"[Revenue] Channel: {ch['name']}, Total: ${total:.2f}, Creator: ${creator_share:.2f}, Fee: ${platform_fee:.2f}")

        # In production:
        # await prisma.creatorRevenue.create({...})
        # if creator_share >= 100 and ch["stripeConnectId"]:
        #     stripe.payouts.create(amount=int(creator_share * 100), currency="usd",
        #                           stripe_account=ch["stripeConnectId"])

    print("[Revenue Worker] Monthly revenue calculation complete.")
    return {"channelsProcessed": len(channels)}


async def main():
    print("Starting BullMQ Monthly Revenue Worker...")
    worker = Worker('monthly-revenue-calc', compute_monthly_revenue, {
        "connection": f"redis://{REDIS_HOST}:{REDIS_PORT}"
    })
    print("Worker listening...")
    await asyncio.Event().wait()


if __name__ == "__main__":
    asyncio.run(main())
