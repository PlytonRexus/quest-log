import { test, expect } from '@playwright/test'

test.describe('View navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Narrative Portal')).toBeVisible({ timeout: 15000 })
  })

  test('clicking Table tab switches to table view', async ({ page }) => {
    await page.getByRole('button', { name: /Table/i }).click()
    await expect(page.getByTestId('import-zone')).toBeVisible({ timeout: 5000 })
  })

  test('clicking Canvas tab switches to canvas view', async ({ page }) => {
    await page.getByRole('button', { name: /Canvas/i }).click()
    await expect(page.getByTestId('canvas-view')).toBeVisible({ timeout: 5000 })
  })

  test('clicking Galaxy tab returns to galaxy view', async ({ page }) => {
    // Switch away first
    await page.getByRole('button', { name: /Table/i }).click()
    await expect(page.getByTestId('import-zone')).toBeVisible({ timeout: 5000 })
    // Switch back
    await page.getByRole('button', { name: /Galaxy/i }).click()
    await expect(page.getByTestId('galaxy-scene')).toBeVisible({ timeout: 5000 })
  })

  test('keyboard shortcut 4 switches to Table view', async ({ page }) => {
    await page.keyboard.press('4')
    await expect(page.getByTestId('import-zone')).toBeVisible({ timeout: 5000 })
  })

  test('keyboard shortcut 3 switches to Canvas view', async ({ page }) => {
    await page.keyboard.press('3')
    await expect(page.getByTestId('canvas-view')).toBeVisible({ timeout: 5000 })
  })

  test('keyboard shortcut 1 switches back to Galaxy view', async ({ page }) => {
    await page.keyboard.press('4')
    await expect(page.getByTestId('import-zone')).toBeVisible({ timeout: 5000 })
    await page.keyboard.press('1')
    await expect(page.getByTestId('galaxy-scene')).toBeVisible({ timeout: 5000 })
  })
})
