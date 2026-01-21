import { test, expect } from '@playwright/test';
import { registerUser, sendMessage } from './test-utils';

test('chat registration and message flow', async ({ page }) => {
  const timestamp = Date.now();
  const username = `Jarkko_${timestamp}`;
  const password = 'salasana123';

  await registerUser(page, username, password);
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible({ timeout: 5000 });

  const testMessage = `What a great teast message, ${timestamp}`;
  await sendMessage(page, testMessage);
});
