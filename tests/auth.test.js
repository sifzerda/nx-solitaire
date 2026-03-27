import request from "supertest";

const BASE_URL = "http://localhost:3000";

describe("Auth API (App Router)", () => {
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: "password123",
  };

  it("should sign up a new user", async () => {
    const res = await request(BASE_URL)
      .post("/api/signup")
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty("userId");
  });

  it("should reject duplicate signup", async () => {
    const res = await request(BASE_URL)
      .post("/api/signup")
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.error).toBeDefined();
  });
});