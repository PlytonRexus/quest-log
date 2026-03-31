import { test, expect } from '@playwright/test'

test.describe('Canvas view', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Narrative Portal')).toBeVisible({ timeout: 15000 })
    // Switch to canvas view
    await page.getByRole('button', { name: /Canvas/i }).click()
    await expect(page.getByTestId('canvas-view')).toBeVisible({ timeout: 5000 })
  })

  test('shows toolbar and grid', async ({ page }) => {
    await expect(page.getByTestId('canvas-toolbar')).toBeVisible()
    await expect(page.getByTestId('canvas-grid')).toBeVisible()
  })

  test('sticky note tool creates a note on click', async ({ page }) => {
    // Click Sticky Note tool
    await page.getByRole('button', { name: /Sticky Note/i }).click()
    // Click on the canvas area
    const canvas = page.getByTestId('canvas-click-area')
    await canvas.click({ position: { x: 300, y: 300 } })
    // A canvas element should appear
    await expect(page.getByTestId('sticky-note').first()).toBeVisible({ timeout: 3000 })
  })

  test('clear button removes all elements', async ({ page }) => {
    // Create a sticky note
    await page.getByRole('button', { name: /Sticky Note/i }).click()
    const canvas = page.getByTestId('canvas-click-area')
    await canvas.click({ position: { x: 300, y: 300 } })
    await expect(page.getByTestId('sticky-note').first()).toBeVisible({ timeout: 3000 })
    // Clear
    await page.getByRole('button', { name: /Clear/i }).click()
    await expect(page.getByTestId('sticky-note')).toHaveCount(0, { timeout: 3000 })
  })
})
