// Test utilities and fixtures for the narrative portal test suite.
// DB factory functions and common test data will go here as the
// database layer is built out.

export function createTestWork(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Test Work',
    medium: 'film',
    year: 2024,
    coverUrl: null,
    primaryScore: 8.0,
    comfortScore: null,
    consumptionMode: 'legitimacy',
    dateConsumed: null,
    notes: null,
    ...overrides,
  }
}

export function createTestDimension(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Test Dimension',
    weight: 4.0,
    isLoadBearing: 0,
    framework: 'primary',
    description: 'A test dimension',
    ...overrides,
  }
}
