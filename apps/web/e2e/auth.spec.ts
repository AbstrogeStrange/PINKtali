import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should allow a user to register and login', async ({ page }) => {
    await page.goto('/auth/register');
    
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="displayName"]', 'Test User');
    await page.click('button[type="submit"]');

    // Should redirect to home or show success
    await expect(page).toHaveURL('/');
    await expect(page.locator('header')).toContainText('SV');
  });

  test('should show error on invalid login', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error-message')).toBeVisible();
  });
});
