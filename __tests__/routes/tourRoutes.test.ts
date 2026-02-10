import request from 'supertest';
import app from '../../app.js';
import pool from '../../db.js';
import { PoolClient } from 'pg';
import { signupAndLoginUser } from '../testUtils.js';

let client: PoolClient;
let authToken: string;
let userId: string;

const testUser = {
  name: 'Tour Test User',
  email: 'tourtest@example.com',
  password: 'password123',
  passwordConfirm: 'password123',
  role: 'admin', // Assuming admin/lead-guide can create tours
};

const newTour = {
  name: 'The Forest Hiker',
  duration: 5,
  max_group_size: 10,
  difficulty: 'easy',
  ratings_average: 4.7,
  ratings_quantity: 30,
  price: 500,
  summary: 'Breathtaking hike through the forest',
  description: 'A wonderful journey for nature lovers',
  image_cover: 'tour-1-cover.jpg',
  images: ['tour-1-1.jpg', 'tour-1-2.jpg'],
  start_dates: ['2024-07-01', '2024-08-01'],
};

describe('Tour API functionality', () => {
  beforeAll(async () => {
    // Arrange
    client = await pool.connect();
    // Ensure the test user exists and get an auth token
    const auth = await signupAndLoginUser(testUser);
    authToken = auth.token;
    userId = auth.user.id;
  });

  afterAll(async () => {
    // Assert
    // No need to clean users/tours here, clearDb handles it
    if (client) {
      client.release();
    }
    await pool.end();
  });

  describe('POST /api/v1/tours endpoint', () => {
    it('should allow a logged-in admin/lead-guide to create a new tour', async () => {
      // Arrange
      const tourToCreate = { ...newTour };

      // Act
      const res = await request(app)
        .post('/api/v1/tours')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tourToCreate);

      // Assert
      expect(res.statusCode).toEqual(201);
      expect(res.body.status).toEqual('success');
      expect(res.body.data.tour).toBeDefined();
      expect(res.body.data.tour.name).toEqual(tourToCreate.name);
      // I should add more assertions for other tour properties
    });

    it('should return 401 Unauthorized when attempting to create a tour without authentication', async () => {
      // Arrange
      const tourToCreate = { ...newTour };

      // Act
      const res = await request(app).post('/api/v1/tours').send(tourToCreate);

      // Assert
      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual('fail');
      expect(res.body.message).toEqual(
        'You are not logged in! Please log in to get access.',
      );
    });

    it('should return 400 Bad Request when attempting to create a tour with invalid data', async () => {
      // Arrange
      const invalidTour = { ...newTour, name: '' }; // Missing name

      // Act
      const res = await request(app)
        .post('/api/v1/tours')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTour);

      // Assert
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual('fail');
      expect(res.body.message).toContain('Invalid input data');
    });
  });

  describe('PATCH /api/v1/tours/:id endpoint', () => {
    let createdTourId: string;

    beforeEach(async () => {
      // Arrange
      // Create a tour to update
      const createRes = await request(app)
        .post('/api/v1/tours')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTour);
      createdTourId = createRes.body.data.tour.id;
    });

    it('should allow a logged-in admin/lead-guide to update an existing tour', async () => {
      // Arrange
      const updatedData = { price: 600, difficulty: 'medium' };

      // Act
      const res = await request(app)
        .patch(`/api/v1/tours/${createdTourId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.data.tour).toBeDefined();
      expect(res.body.data.tour.price).toEqual(updatedData.price);
      expect(res.body.data.tour.difficulty).toEqual(updatedData.difficulty);
    });

    it('should return 401 Unauthorized when attempting to update a tour without authentication', async () => {
      // Arrange
      const updatedData = { price: 700 };

      // Act
      const res = await request(app)
        .patch(`/api/v1/tours/${createdTourId}`)
        .send(updatedData);

      // Assert
      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual('fail');
      expect(res.body.message).toEqual(
        'You are not logged in! Please log in to get access.',
      );
    });

    it('should return 404 Not Found when attempting to update a non-existent tour', async () => {
      // Arrange
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000'; // Example UUID
      const updatedData = { price: 800 };

      // Act
      const res = await request(app)
        .patch(`/api/v1/tours/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);

      // Assert
      expect(res.statusCode).toEqual(404);
      expect(res.body.status).toEqual('fail');
      expect(res.body.message).toContain('No tour found with that ID');
    });
  });
});
