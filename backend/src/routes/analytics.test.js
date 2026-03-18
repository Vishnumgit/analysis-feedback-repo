'use strict';

const request = require('supertest');

describe('Analytics routes (mock data)', () => {
  let app;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    delete process.env.DATABASE_URL;
    jest.resetModules();
    // eslint-disable-next-line global-require
    app = require('../server');
  });

  test('POST /api/analytics/session logs a session for a valid product', async () => {
    const res = await request(app)
      .post('/api/analytics/session')
      .send({ product_id: 1, platform: 'web', duration: 30 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      product_id: 1,
      platform: 'web',
      duration: 30,
    });
    expect(res.body.session_id).toContain('session_');
    expect(res.body.logged_at).toBeTruthy();
  });

  test('POST /api/analytics/session returns 404 for unknown product', async () => {
    const res = await request(app)
      .post('/api/analytics/session')
      .send({ product_id: 9999, platform: 'web' });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('GET /api/analytics/product/:productId returns aggregate metrics', async () => {
    const res = await request(app).get('/api/analytics/product/1');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      product_id: 1,
      total_views: expect.any(Number),
      total_qr_scans: expect.any(Number),
      period_days: expect.any(Number),
    });
  });

  test('GET /api/analytics/product/:productId returns 404 for missing product', async () => {
    const res = await request(app).get('/api/analytics/product/12345');

    expect(res.status).toBe(404);
  });
});

