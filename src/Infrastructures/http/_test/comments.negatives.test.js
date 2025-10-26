const createServer = require("../createServer");
const container = require("../../container");

describe("Comments endpoint (negative cases)", () => {
  it("should 401 when no Authorization header on POST /threads/{id}/comments", async () => {
    const server = await createServer(container);

    const res = await server.inject({
      method: "POST",
      url: "/threads/thread-xyz/comments",
      payload: { content: "hello" },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.statusCode).toBe(401);
    expect(body.error).toBe("Unauthorized");
    expect(body.message).toBeDefined();
  });

  it("should 404 when thread not found (authorized)", async () => {
    const server = await createServer(container);

    await server.inject({
      method: "POST",
      url: "/users",
      payload: { username: "bob", password: "secret", fullname: "Bob" },
    });
    const loginRes = await server.inject({
      method: "POST",
      url: "/authentications",
      payload: { username: "bob", password: "secret" },
    });
    const {
      data: { accessToken },
    } = JSON.parse(loginRes.payload);

    const res = await server.inject({
      method: "POST",
      url: "/threads/not-exists/comments",
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: { content: "should 404" },
    });

    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.payload);
    expect(body.status).toBe("fail");
    expect(body.message).toBeDefined();
  });

  it("should 400 when payload invalid (missing content)", async () => {
    const server = await createServer(container);

    await server.inject({
      method: "POST",
      url: "/users",
      payload: { username: "cindy", password: "secret", fullname: "Cindy" },
    });
    const loginRes = await server.inject({
      method: "POST",
      url: "/authentications",
      payload: { username: "cindy", password: "secret" },
    });
    const {
      data: { accessToken },
    } = JSON.parse(loginRes.payload);

    const addThread = await server.inject({
      method: "POST",
      url: "/threads",
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: { title: "x", body: "y" },
    });
    const threadId = JSON.parse(addThread.payload).data.addedThread.id;

    const res = await server.inject({
      method: "POST",
      url: `/threads/${threadId}/comments`,
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: {
        /* missing content */
      },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.status).toBe("fail");
    expect(body.message).toBeDefined();
  });
});
