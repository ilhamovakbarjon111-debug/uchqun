import supertest from 'supertest';
import { sequelize, User, createTestApp } from '../helpers/testApp.js';

let app;
let request;
let accessToken;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  app = createTestApp();
  request = supertest(app);
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  await sequelize.sync({ force: true });
  await User.create({
    email: 'parent@example.com',
    password: 'password123',
    firstName: 'Parent',
    lastName: 'User',
    role: 'parent',
  });

  const loginRes = await request
    .post('/api/auth/login')
    .send({ email: 'parent@example.com', password: 'password123' });

  accessToken = loginRes.body.accessToken;
});

describe('Child CRUD Integration', () => {
  describe('POST /api/child', () => {
    it('should create a child', async () => {
      const res = await request
        .post('/api/child')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ firstName: 'Ali', lastName: 'User', dateOfBirth: '2020-01-15' });

      expect(res.status).toBe(201);
      expect(res.body.data.firstName).toBe('Ali');
    });
  });

  describe('GET /api/child', () => {
    it('should list children for authenticated parent', async () => {
      await request
        .post('/api/child')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ firstName: 'Ali', lastName: 'User' });

      const res = await request
        .get('/api/child')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('PUT /api/child/:id', () => {
    it('should update a child', async () => {
      const createRes = await request
        .post('/api/child')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ firstName: 'Ali', lastName: 'User' });

      const childId = createRes.body.data.id;

      const res = await request
        .put(`/api/child/${childId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ firstName: 'Vali' });

      expect(res.status).toBe(200);
      expect(res.body.data.firstName).toBe('Vali');
    });
  });

  describe('DELETE /api/child/:id', () => {
    it('should delete a child', async () => {
      const createRes = await request
        .post('/api/child')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ firstName: 'Ali', lastName: 'User' });

      const childId = createRes.body.data.id;

      const res = await request
        .delete(`/api/child/${childId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);

      const listRes = await request
        .get('/api/child')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(listRes.body.data).toHaveLength(0);
    });
  });

  describe('Unauthorized access', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request.get('/api/child');
      expect(res.status).toBe(401);
    });
  });
});
