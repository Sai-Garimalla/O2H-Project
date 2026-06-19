const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Task = require('../models/Task');

let token;
let userId;

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/o2h_tasks_test');
    
    const userRes = await request(app).post('/api/auth/register').send({
        name: 'Test User', email: 'test@test.com', password: 'password123'
    });
    token = userRes.body.token;
    userId = userRes.body._id;
});

afterAll(async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await mongoose.connection.close();
});

describe('Task API', () => {
    it('should create a new task', async () => {
        const res = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Test Task', description: 'This is a test description with 20 chars', status: 'Pending' });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
    });

    it('should not allow unauthorized access to tasks', async () => {
        const res = await request(app).get('/tasks');
        expect(res.statusCode).toEqual(401);
    });
});