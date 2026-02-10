import request from 'supertest';
import app from '../../app.js';
import pool from '../../db.js';
import { PoolClient } from 'pg';
import { signupAndLoginUser } from '../testUtils.js';

let client: PoolClient;
let authToken: string; // To store auth token for authenticated tests

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

describe('User Authentication API functionality', () => {
  beforeAll(async () => {
    // Arrange
    // Acquire a client from the pool for potential direct database operations in tests
    client = await pool.connect();
  });

  // beforeEach is handled by testUtils.ts clearDb now. Removed here

  afterAll(async () => {
    // Assert
    // Close the client and release it back to the pool
    if (client) {
      client.release();
    }
    // End the pool to close all connections
    await pool.end();
  });

  describe('POST /api/v1/users/signup endpoint', () => {
    it('should allow a new user to sign up successfully', async () => {
      // Arrange
      // No specific arrangement needed beyond clearDb

      // Act
      const res = await request(app)
        .post('/api/v1/users/signup')
        .send(testUser);

      // Assert
      expect(res.statusCode).toEqual(201);
      expect(res.body.status).toEqual('success');
      expect(res.body.token).toBeDefined();
      expect(res.body.data.user.name).toEqual(testUser.name);
      expect(res.body.data.user.email).toEqual(testUser.email);
    });

    it('should return 400 Bad Request when attempting signup with a duplicate email', async () => {
      // Arrange
      await request(app).post('/api/v1/users/signup').send(testUser); // First signup

      // Act
      const res = await request(app)
        .post('/api/v1/users/signup')
        .send(testUser); // Duplicate signup

      // Assert
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual('fail');
      expect(res.body.message).toContain('duplicate key');
    });

    it('should return 400 Bad Request when attempting signup with invalid data, such as a missing password', async () => {
      // Arrange
      const invalidUser = { ...testUser, password: '' }; // Missing password

      // Act
      const res = await request(app)
        .post('/api/v1/users/signup')
        .send(invalidUser);

      // Assert
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual('fail');
      expect(res.body.message).toContain('Invalid input data');
    });
  });

  describe('POST /api/v1/users/login endpoint', () => {
    beforeEach(async () => {
      // Arrange
      // Ensure a user exists for login tests
      await request(app).post('/api/v1/users/signup').send(testUser);
    });

    it('should allow an existing user to log in successfully', async () => {
      // Arrange
      // User created in beforeEach

      // Act
      const res = await request(app).post('/api/v1/users/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.token).toBeDefined();
      authToken = res.body.token; // Store token for later use
    });

    it('should return 401 Unauthorized for an incorrect password', async () => {
      // Arrange
      // User created in beforeEach

      // Act
      const res = await request(app).post('/api/v1/users/login').send({
        email: testUser.email,
        password: 'wrongpassword',
      });

      // Assert
      expect(res.statusCode).toEqual(401); // Unauthorized
      expect(res.body.status).toEqual('fail');
      expect(res.body.message).toEqual('Incorrect email or password');
    });

    it('should return 401 Unauthorized for a non-existent user email', async () => {
      // Arrange
      // No specific arrangement needed as we are testing a non-existent user

      // Act
      const res = await request(app).post('/api/v1/users/login').send({
        email: anotherTestUser.email, // Non-existent email
        password: anotherTestUser.password,
      });

      // Assert
      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual('fail');
      expect(res.body.message).toEqual('Incorrect email or password');
    });
  });

  describe('Protected User Routes', () => {
    let authenticatedUserToken: string;

    beforeEach(async () => {
      // Arrange: Sign up and log in a user to get an authentication token
      await signupAndLoginUser(anotherTestUser); // Using anotherTestUser to avoid conflicts
      const loginRes = await request(app).post('/api/v1/users/login').send({
        email: anotherTestUser.email,
        password: anotherTestUser.password,
      });
      authenticatedUserToken = loginRes.body.token;
    });

    it('should return 401 Unauthorized when accessing a protected route without a token', async () => {
      // Arrange: No token provided
      const res = await request(app).get('/api/v1/users/me'); // Example protected route

      // Act
      // The request is made without setting the Authorization header

      // Assert
      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual('fail');
      expect(res.body.message).toEqual(
        'You are not logged in! Please log in to get access.',
      );
    });

    it('should return 400 Bad Request when updating user data with invalid input', async () => {
      // Arrange: Prepare invalid data
      const invalidUpdateData = { email: 'not-an-email' };

      // Act: Attempt to update user data with invalid input
      const res = await request(app)
        .patch('/api/v1/users/updateMe') // Example protected update route
        .set('Authorization', `Bearer ${authenticatedUserToken}`)
        .send(invalidUpdateData);

      // Assert
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual('fail');
      expect(res.body.message).toContain('Invalid input data');
    });

    it('should allow an authenticated user to access their own data on a protected route', async () => {
      // Arrange: User is already logged in from beforeEach, and token is available

      // Act
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${authenticatedUserToken}`);

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.data.user.email).toEqual(anotherTestUser.email);
    });
  });
});
