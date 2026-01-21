import { type Page, expect } from '@playwright/test';

export async function registerUser(page: Page, username: string, password = 'testpassword') {
  await page.goto('/chat');

  const loginToRegisterSwitch = page.getByRole('button', {
    name: "Don't have an account? Register",
  });
  await expect(loginToRegisterSwitch).toBeVisible();
  await loginToRegisterSwitch.click();

  const registerButton = page.getByRole('button', { name: 'Register', exact: true });
  await expect(registerButton).toBeVisible();

  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Password').fill(password);
  await registerButton.click();

  // Verify registration and auto-login to chat
  await expect(page.getByText('Chatting as: ' + username)).toBeVisible({ timeout: 10000 });
}

export async function sendMessage(page: Page, message: string) {
  await page.getByPlaceholder('Type a message...').fill(message);
  const sendButton = page.getByRole('button', { name: 'Send' });
  await expect(sendButton).toBeEnabled({ timeout: 5000 });
  await sendButton.click();

  // Verify the sent message appears in chat
  await expect(page.getByText(message)).toBeVisible();
}
