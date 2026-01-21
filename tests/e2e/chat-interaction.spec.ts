import { test, expect } from '@playwright/test';
import { registerUser, sendMessage } from './test-utils';

test('users can see each others messages', async ({ browser }) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();

  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  const timestamp = Date.now();
  const userA = `Albert_${timestamp}`;
  const userB = `Bertta_${timestamp}`;

  await test.step('Register user A', async () => {
    await registerUser(pageA, userA);
  });

  await test.step('Register user B', async () => {
    await registerUser(pageB, userB);
  });

  // User A sends a message and can see it
  const messageFromA = `Hello from Albert, ${timestamp}`;
  await test.step('User A sends message', async () => {
    await sendMessage(pageA, messageFromA);
  });

  // User B can also see the message from A
  await test.step('User B receives message from A', async () => {
    await expect(pageB.getByText(messageFromA)).toBeVisible();
  });

  // User B replies back
  const messageFromB = `Hello back from Bertta ${timestamp}`;
  await test.step('User B sends reply', async () => {
    await sendMessage(pageB, messageFromB);
  });

  // User A can see the reply from B
  await test.step('User A receives reply from B', async () => {
    await expect(pageA.getByText(messageFromB)).toBeVisible();
  });

  await contextA.close();
  await contextB.close();
});
