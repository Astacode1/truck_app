import { test, expect } from '@playwright/test';

// Mock data for testing
const MOCK_ADMIN = {
  email: 'admin@test.com',
  password: 'password123'
};

const MOCK_DRIVER = {
  email: 'driver@test.com', 
  password: 'password123'
};

test.describe('Driver Receipt Upload Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Note: These tests assume the frontend is running on localhost:3000
    // In a real implementation, you'd need the actual frontend
    await page.goto('/');
  });

  test('driver can login and access receipt upload', async ({ page }) => {
    // Navigate to login page
    await page.click('[data-testid="login-link"]');
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', MOCK_DRIVER.email);
    await page.fill('[data-testid="password-input"]', MOCK_DRIVER.password);
    await page.click('[data-testid="login-button"]');
    
    // Should redirect to driver dashboard
    await expect(page).toHaveURL('/driver/dashboard');
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome');
    
    // Navigate to receipt upload
    await page.click('[data-testid="upload-receipt-link"]');
    await expect(page).toHaveURL('/driver/receipts/upload');
    
    // Verify upload form is present
    await expect(page.locator('[data-testid="receipt-upload-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="file-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="amount-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-select"]')).toBeVisible();
  });

  test('driver can upload a receipt with details', async ({ page }) => {
    // Login as driver first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', MOCK_DRIVER.email);
    await page.fill('[data-testid="password-input"]', MOCK_DRIVER.password);
    await page.click('[data-testid="login-button"]');
    
    // Navigate to upload page
    await page.goto('/driver/receipts/upload');
    
    // Fill out receipt form
    await page.fill('[data-testid="amount-input"]', '45.67');
    await page.selectOption('[data-testid="category-select"]', 'fuel');
    await page.fill('[data-testid="merchant-input"]', 'Shell Gas Station');
    await page.fill('[data-testid="description-input"]', 'Fuel for delivery route');
    
    // Upload a mock receipt file
    // Note: In a real test, you'd use an actual image file
    const fileInput = page.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles('./tests/fixtures/sample-receipt.jpg');
    
    // Submit the form
    await page.click('[data-testid="submit-button"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Receipt uploaded successfully');
    
    // Should redirect to receipts list
    await expect(page).toHaveURL('/driver/receipts');
    
    // Verify the receipt appears in the list
    await expect(page.locator('[data-testid="receipt-item"]')).toBeVisible();
    await expect(page.locator('[data-testid="receipt-amount"]')).toContainText('$45.67');
    await expect(page.locator('[data-testid="receipt-status"]')).toContainText('Pending');
  });

  test('driver can view receipt status and details', async ({ page }) => {
    // Login and navigate to receipts
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', MOCK_DRIVER.email);
    await page.fill('[data-testid="password-input"]', MOCK_DRIVER.password);
    await page.click('[data-testid="login-button"]');
    
    await page.goto('/driver/receipts');
    
    // Click on a receipt to view details
    await page.click('[data-testid="receipt-item"]:first-child');
    
    // Should show receipt details
    await expect(page.locator('[data-testid="receipt-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="receipt-image"]')).toBeVisible();
    await expect(page.locator('[data-testid="receipt-amount"]')).toBeVisible();
    await expect(page.locator('[data-testid="receipt-category"]')).toBeVisible();
    await expect(page.locator('[data-testid="receipt-status"]')).toBeVisible();
  });
});

test.describe('Admin Receipt Verification Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('admin can login and access pending receipts', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', MOCK_ADMIN.email);
    await page.fill('[data-testid="password-input"]', MOCK_ADMIN.password);
    await page.click('[data-testid="login-button"]');
    
    // Should redirect to admin dashboard
    await expect(page).toHaveURL('/admin/dashboard');
    await expect(page.locator('[data-testid="admin-welcome"]')).toContainText('Admin Dashboard');
    
    // Navigate to pending receipts
    await page.click('[data-testid="pending-receipts-link"]');
    await expect(page).toHaveURL('/admin/receipts/pending');
    
    // Verify pending receipts table
    await expect(page.locator('[data-testid="receipts-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-header-amount"]')).toContainText('Amount');
    await expect(page.locator('[data-testid="table-header-driver"]')).toContainText('Driver');
    await expect(page.locator('[data-testid="table-header-date"]')).toContainText('Date');
    await expect(page.locator('[data-testid="table-header-status"]')).toContainText('Status');
  });

  test('admin can approve a receipt', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', MOCK_ADMIN.email);
    await page.fill('[data-testid="password-input"]', MOCK_ADMIN.password);
    await page.click('[data-testid="login-button"]');
    
    // Navigate to pending receipts
    await page.goto('/admin/receipts/pending');
    
    // Click on a receipt to review
    await page.click('[data-testid="receipt-row"]:first-child [data-testid="review-button"]');
    
    // Should show receipt review modal/page
    await expect(page.locator('[data-testid="receipt-review-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="receipt-image-large"]')).toBeVisible();
    await expect(page.locator('[data-testid="receipt-details-panel"]')).toBeVisible();
    
    // Approve the receipt
    await page.click('[data-testid="approve-button"]');
    
    // Should show confirmation
    await expect(page.locator('[data-testid="approval-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="approval-success"]')).toContainText('Receipt approved');
    
    // Receipt should be removed from pending list
    await page.click('[data-testid="close-modal"]');
    await expect(page.locator('[data-testid="receipt-row"]')).toHaveCount(0);
  });

  test('admin can reject a receipt with reason', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', MOCK_ADMIN.email);
    await page.fill('[data-testid="password-input"]', MOCK_ADMIN.password);
    await page.click('[data-testid="login-button"]');
    
    // Navigate to pending receipts
    await page.goto('/admin/receipts/pending');
    
    // Click on a receipt to review
    await page.click('[data-testid="receipt-row"]:first-child [data-testid="review-button"]');
    
    // Reject the receipt
    await page.click('[data-testid="reject-button"]');
    
    // Should show rejection reason form
    await expect(page.locator('[data-testid="rejection-form"]')).toBeVisible();
    await page.fill('[data-testid="rejection-reason"]', 'Receipt image is unclear and amount cannot be verified');
    await page.click('[data-testid="confirm-rejection"]');
    
    // Should show rejection confirmation
    await expect(page.locator('[data-testid="rejection-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="rejection-success"]')).toContainText('Receipt rejected');
  });

  test('admin can view anomalies and review flagged receipts', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', MOCK_ADMIN.email);
    await page.fill('[data-testid="password-input"]', MOCK_ADMIN.password);
    await page.click('[data-testid="login-button"]');
    
    // Navigate to anomalies page
    await page.click('[data-testid="anomalies-link"]');
    await expect(page).toHaveURL('/admin/anomalies');
    
    // Should show anomalies dashboard
    await expect(page.locator('[data-testid="anomalies-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="anomaly-filters"]')).toBeVisible();
    
    // Filter by high severity
    await page.selectOption('[data-testid="severity-filter"]', 'high');
    await page.click('[data-testid="apply-filter"]');
    
    // Should show filtered results
    await expect(page.locator('[data-testid="anomaly-row"]')).toBeVisible();
    
    // Click on an anomaly to investigate
    await page.click('[data-testid="anomaly-row"]:first-child');
    
    // Should show anomaly details
    await expect(page.locator('[data-testid="anomaly-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="related-receipt"]')).toBeVisible();
    await expect(page.locator('[data-testid="anomaly-explanation"]')).toBeVisible();
  });
});

test.describe('End-to-End Receipt Processing Flow', () => {
  test('complete workflow: driver upload -> admin review -> approval', async ({ page }) => {
    // Step 1: Driver uploads receipt
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', MOCK_DRIVER.email);
    await page.fill('[data-testid="password-input"]', MOCK_DRIVER.password);
    await page.click('[data-testid="login-button"]');
    
    await page.goto('/driver/receipts/upload');
    await page.fill('[data-testid="amount-input"]', '75.50');
    await page.selectOption('[data-testid="category-select"]', 'meals');
    await page.fill('[data-testid="merchant-input"]', 'Restaurant ABC');
    
    const fileInput = page.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles('./tests/fixtures/sample-receipt.jpg');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Logout driver
    await page.click('[data-testid="logout-button"]');
    
    // Step 2: Admin reviews and approves
    await page.fill('[data-testid="email-input"]', MOCK_ADMIN.email);
    await page.fill('[data-testid="password-input"]', MOCK_ADMIN.password);
    await page.click('[data-testid="login-button"]');
    
    await page.goto('/admin/receipts/pending');
    await expect(page.locator('[data-testid="receipt-row"]')).toBeVisible();
    
    // Find the receipt we just created
    const receiptRow = page.locator('[data-testid="receipt-row"]').filter({ hasText: '$75.50' });
    await receiptRow.locator('[data-testid="review-button"]').click();
    
    await page.click('[data-testid="approve-button"]');
    await expect(page.locator('[data-testid="approval-success"]')).toBeVisible();
    
    // Step 3: Verify receipt is approved
    await page.goto('/admin/receipts/approved');
    await expect(page.locator('[data-testid="receipt-row"]').filter({ hasText: '$75.50' })).toBeVisible();
    await expect(page.locator('[data-testid="status-approved"]')).toBeVisible();
  });
});