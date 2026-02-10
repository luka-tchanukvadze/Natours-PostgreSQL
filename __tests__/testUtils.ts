import request from 'supertest';
import app from '../app';
import { PoolClient } from 'pg';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const signupAndLoginUser = async (user: any): Promise<AuthResponse> => {
  // Arrange
  // Ensure user is not already signed up
  await request(app).post('/api/v1/users/signup').send(user);

  // Act
  const loginRes = await request(app).post('/api/v1/users/login').send({
    email: user.email,
    password: user.password,
  });

  // Assert
  if (loginRes.statusCode !== 200) {
    throw new Error(`Failed to login user: ${loginRes.body.message}`);
  }

  return {
    token: loginRes.body.token,
    user: loginRes.body.data.user,
  };
};
