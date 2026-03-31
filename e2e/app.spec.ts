import { test, expect } from '@playwright/test'

test.describe('App initialization', () => {
  test('loads and shows the Narrative Portal header', async ({ page }) => {
    await page.goto('/')
    // Wait for initialization to complete
    await expect(page.getByText('Narrative Portal')).toBeVisible({ timeout: 15000 })
  })

  test('defaults to Galaxy view', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Narrative Portal')).toBeVisible({ timeout: 15000 })
    // Galaxy view should be selected by default
    await expect(page.getByTestId('galaxy-scene')).toBeVisible({ timeout: 10000 })
  })

  test('StatsBar renders with seed data', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Narrative Portal')).toBeVisible({ timeout: 15000 })
    // StatsBar should show works count from seed data
    const statsBar = page.getByTestId('stats-bar')
    await expect(statsBar).toBeVisible()
    await expect(statsBar.getByText('Works:')).toBeVisible()
    await expect(statsBar.getByText('XP:')).toBeVisible()
    await expect(statsBar.getByText('Fog:')).toBeVisible()
  })

  test('all 5 view tabs are visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Narrative Portal')).toBeVisible({ timeout: 15000 })
    // Tab labels
    await expect(page.getByRole('button', { name: /Galaxy/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Skill Tree/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Canvas/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Table/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Chat/i })).toBeVisible()
  })
})
