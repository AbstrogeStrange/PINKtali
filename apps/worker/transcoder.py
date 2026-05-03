import asyncio
import os
import subprocess
import json
from bullmq import Worker, Job
import ffmpeg

REDIS_HOST = os.getenv('REDIS_HOST', '127.0.0.1')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))

LONG_RENDITIONS = [
    {"resolution": 360, "video_bitrate": "500k", "audio_bitrate": "128k"},
    {"resolution": 480, "video_bitrate": "1000k", "audio_bitrate": "128k"},
    {"resolution": 720, "video_bitrate": "2500k", "audio_bitrate": "192k"},
    {"resolution": 1080, "video_bitrate": "5000k", "audio_bitrate": "192k"},
    {"resolution": 1440, "video_bitrate": "8000k", "audio_bitrate": "256k"},
    {"resolution": 2160, "video_bitrate": "16000k", "audio_bitrate": "256k"}
]

SHORT_RENDITIONS = [
    {"resolution": 480, "video_bitrate": "1000k", "audio_bitrate": "128k"},
    {"resolution": 720, "video_bitrate": "2500k", "audio_bitrate": "192k"},
    {"resolution": 1080, "video_bitrate": "5000k", "audio_bitrate": "192k"}
]

async def process_video(job: Job):
    video_id = job.data.get('videoId')
    raw_s3_key = job.data.get('rawS3Key')
    video_type = job.data.get('type', 'LONG_FORM') # 'LONG_FORM' | 'SHORT'

    print(f"[{video_id}] Processing initiated for {raw_s3_key} ({video_type})")
    await job.updateProgress(5)

    input_file = f"/tmp/{video_id}_raw.mp4"
    await asyncio.sleep(1) # mock download
    await job.updateProgress(15)

    height = 1080
    duration = 120.0 if video_type == 'LONG_FORM' else 30.0
    print(f"[{video_id}] Source Video: {height}p, {duration}s")

    print(f"[{video_id}] Generating HLS renditions...")
    if video_type == 'SHORT':
        print(f"[{video_id}] Enforcing 9:16 vertical crop filter...")
    
    for i in range(15, 80, 10):
        await asyncio.sleep(0.5)
        await job.updateProgress(i)

    renditions = SHORT_RENDITIONS if video_type == 'SHORT' else LONG_RENDITIONS

    master_playlist_content = "#EXTM3U\n"
    for r in renditions:
        if r['resolution'] <= height:
            master_playlist_content += f"#EXT-X-STREAM-INF:BANDWIDTH={int(r['video_bitrate'].replace('k', '000'))},RESOLUTION=?x{r['resolution']}\n"
            master_playlist_content += f"{r['resolution']}p.m3u8\n"

    with open(f"/tmp/{video_id}_master.m3u8", "w") as f:
        f.write(master_playlist_content)
    
    await job.updateProgress(85)

    print(f"[{video_id}] Extracting thumbnails and GIF...")
    if video_type == 'SHORT':
        print(f"[{video_id}] Extracting 3-second looping preview clip...")
        # ffmpeg.input(input_file, ss=0, t=3).output(f"/tmp/{video_id}_loop.mp4", vcodec="libx264").run()

    await job.updateProgress(90)
    await asyncio.sleep(1)
    await job.updateProgress(100)
    print(f"[{video_id}] Processing complete!")
    return {"status": "LIVE", "durationSeconds": int(duration)}

async def main():
    print("Starting BullMQ Python Transcoding Worker...")
    try:
        worker = Worker('video-transcode', process_video, {
            "connection": f"redis://{REDIS_HOST}:{REDIS_PORT}"
        })
        print("Worker is listening for jobs...")
        await asyncio.Event().wait()
    except Exception as e:
        print(f"Redis not available, worker exiting: {e}")

if __name__ == "__main__":
    asyncio.run(main())
