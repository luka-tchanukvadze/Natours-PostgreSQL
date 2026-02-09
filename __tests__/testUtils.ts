import request from 'supertest';
import app from '../app.js';
import { PoolClient } from 'pg';
import pool from '../db.js';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const signupAndLoginUser = async (user: any): Promise<AuthResponse> => {
  // Ensure user is not already signed up
  await request(app).post('/api/v1/users/signup').send(user);

  const loginRes = await request(app).post('/api/v1/users/login').send({
    email: user.email,
    password: user.password,
  });

  if (loginRes.statusCode !== 200) {
    throw new Error(`Failed to login user: ${loginRes.body.message}`);
  }

  return {
    token: loginRes.body.token,
    user: loginRes.body.data.user,
  };
};

// Helper to clean tours data
export const cleanTours = async (client: PoolClient) => {
  await client.query('DELETE FROM tours');
};

// Helper to clean users data
export const cleanUsers = async (client: PoolClient) => {
  await client.query('DELETE FROM users');
};
