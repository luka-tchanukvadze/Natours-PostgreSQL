import request from 'supertest';
import app from '../../app.js';
import pool from '../../db.js';
import { PoolClient } from 'pg';

let client: PoolClient;

const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  passwordConfirm: 'password123',
};

const anotherTestUser = {
  name: 'Another Test User',
  email: 'another@example.com',
  password: 'password123',
  passwordConfirm: 'password123',
};

describe('User Authentication API', () => {
  beforeAll(async () => {
    // Acquire a client from the pool to run cleanup operations
    client = await pool.connect();
  });

  beforeEach(async () => {
    // Clear users table before each test to ensure a clean state
    await client.query('DELETE FROM users');
  });

  afterAll(async () => {
    // Close the client and release it back to the pool
    if (client) {
      client.release();
    }
    // End the pool to close all connections
    await pool.end();
  });

  describe('POST /api/v1/users/signup', () => {
    it('should allow a new user to sign up', async () => {
      const res = await request(app)
        .post('/api/v1/users/signup')
        .send(testUser);

      expect(res.statusCode).toEqual(201);
      expect(res.body.status).toEqual('success');
      expect(res.body.token).toBeDefined();
      expect(res.body.data.user.name).toEqual(testUser.name);
      expect(res.body.data.user.email).toEqual(testUser.email);
    });

    it('should not allow signup with duplicate email', async () => {
      await request(app).post('/api/v1/users/signup').send(testUser); // First signup

      const res = await request(app)
        .post('/api/v1/users/signup')
        .send(testUser); // Duplicate signup

      expect(res.statusCode).toEqual(400); // Or 409 Conflict, depending on your error handling
      expect(res.body.status).toEqual('fail');
      expect(res.body.message).toContain('duplicate key');
    });

    it('should not allow signup with invalid data (e.g., missing password)', async () => {
      const invalidUser = { ...testUser, password: '' }; // Missing password
      const res = await request(app)
        .post('/api/v1/users/signup')
        .send(invalidUser);

      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual('fail');
      expect(res.body.message).toContain('Invalid input data');
    });
  });

  describe('POST /api/v1/users/login', () => {
    beforeEach(async () => {
      // Ensure a user exists for login tests
      await request(app).post('/api/v1/users/signup').send(testUser);
    });

    it('should allow an existing user to log in', async () => {
      const res = await request(app).post('/api/v1/users/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.token).toBeDefined();
    });

    it('should return an error for incorrect password', async () => {
      const res = await request(app).post('/api/v1/users/login').send({
        email: testUser.email,
        password: 'wrongpassword',
      });

      expect(res.statusCode).toEqual(401); // Unauthorized
      expect(res.body.status).toEqual('fail');
      expect(res.body.message).toEqual('Incorrect email or password');
    });

    it('should return an error for non-existent user', async () => {
      const res = await request(app).post('/api/v1/users/login').send({
        email: anotherTestUser.email, // Non-existent email
        password: anotherTestUser.password,
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual('fail');
      expect(res.body.message).toEqual('Incorrect email or password');
    });
  });
});
