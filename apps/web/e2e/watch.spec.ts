import { test, expect } from '@playwright/test';

test.describe('Watch and Interaction Flow', () => {
  test('should play a video and allow liking', async ({ page }) => {
    await page.goto('/');
    
    // Click the first video card
    const firstVideo = page.locator('.video-card').first();
    await firstVideo.click();

    // Check if on watch page
    await expect(page).toHaveURL(/\/watch\/.+/);
    
    // Check player exists
    await expect(page.locator('.player-container')).toBeVisible();

    // Test like button
    const likeBtn = page.locator('button:has-text("48.2K")');
    await likeBtn.click();
    
    // Check if brand color applied (optimistic UI)
    await expect(likeBtn).toHaveClass(/text-\[var\(--brand\)\]/);
  });

  test('should post a comment', async ({ page }) => {
    await page.goto('/watch/vid-1');
    
    const commentInput = page.placeholder('Add a comment...');
    await commentInput.fill('This is a test comment from Playwright');
    await page.keyboard.press('Enter');

    await expect(page.locator('text=This is a test comment from Playwright')).toBeVisible();
  });
});
