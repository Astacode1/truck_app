// Test environment setup
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/truck_monitoring_test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.PORT = '3001';
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.OCR_API_KEY = 'test-ocr-key';
process.env.ADMIN_EMAIL = 'admin@test.com';
process.env.EMAIL_SMTP_HOST = 'localhost';
process.env.EMAIL_SMTP_PORT = '587';
process.env.EMAIL_USER = 'test@test.com';
process.env.EMAIL_PASS = 'test-password';