import request from 'supertest';
import app from '../../app.js';
import pool from '../../db.js';
import { PoolClient } from 'pg';
import { signupAndLoginUser, cleanTours, cleanUsers } from '../testUtils.js';

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

describe('Tour API', () => {
  beforeAll(async () => {
    client = await pool.connect();
    // Ensure the test user exists and get an auth token
    const auth = await signupAndLoginUser(testUser);
    authToken = auth.token;
    userId = auth.user.id;
  });

  beforeEach(async () => {
    // Clean tours table before each test
    await cleanTours(client);
  });

  afterAll(async () => {
    // Clean up users created for testing after all tests are done
    await cleanUsers(client);
    if (client) {
      client.release();
    }
    await pool.end();
  });

  describe('POST /api/v1/tours', () => {
    it('should allow a logged-in admin/lead-guide to create a new tour', async () => {
      const res = await request(app)
        .post('/api/v1/tours')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTour);

      expect(res.statusCode).toEqual(201);
      expect(res.body.status).toEqual('success');
      expect(res.body.data.tour).toBeDefined();
      expect(res.body.data.tour.name).toEqual(newTour.name);
      // Add more assertions for other tour properties
    });

    it('should not allow creating a tour without authentication', async () => {
      const res = await request(app).post('/api/v1/tours').send(newTour);

      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual('fail');
      expect(res.body.message).toEqual(
        'You are not logged in! Please log in to get access.',
      );
    });

    it('should not allow creating a tour with invalid data', async () => {
      const invalidTour = { ...newTour, name: '' }; // Missing name
      const res = await request(app)
        .post('/api/v1/tours')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTour);

      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual('fail');
      expect(res.body.message).toContain('Invalid input data');
    });
  });

  describe('PATCH /api/v1/tours/:id', () => {
    let createdTourId: string;

    beforeEach(async () => {
      // Create a tour to update
      const createRes = await request(app)
        .post('/api/v1/tours')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTour);
      createdTourId = createRes.body.data.tour.id;
    });

    it('should allow a logged-in admin/lead-guide to update a tour', async () => {
      const updatedData = { price: 600, difficulty: 'medium' };
      const res = await request(app)
        .patch(`/api/v1/tours/${createdTourId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.data.tour).toBeDefined();
      expect(res.body.data.tour.price).toEqual(updatedData.price);
      expect(res.body.data.tour.difficulty).toEqual(updatedData.difficulty);
    });

    it('should not allow updating a tour without authentication', async () => {
      const updatedData = { price: 700 };
      const res = await request(app)
        .patch(`/api/v1/tours/${createdTourId}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual('fail');
      expect(res.body.message).toEqual(
        'You are not logged in! Please log in to get access.',
      );
    });

    it('should return an error for updating a non-existent tour', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000'; // Example UUID
      const updatedData = { price: 800 };
      const res = await request(app)
        .patch(`/api/v1/tours/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(404);
      expect(res.body.status).toEqual('fail');
      expect(res.body.message).toContain('No tour found with that ID');
    });
  });
});
