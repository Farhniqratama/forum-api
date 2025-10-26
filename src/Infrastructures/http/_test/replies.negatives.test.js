// src/Infrastructures/http/_test/replies.negatives.test.js
const createServer = require("../createServer");
const container = require("../../container");

describe("Replies endpoint (negative cases)", () => {
  it("should 401 when no Authorization header on POST /threads/{id}/comments/{id}/replies", async () => {
    const server = await createServer(container);
    const res = await server.inject({
      method: "POST",
      url: "/threads/thread-xyz/comments/comment-xyz/replies",
      payload: { content: "reply" },
    });
    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.statusCode).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("should 404 when comment not found (authorized)", async () => {
    const server = await createServer(container);

    // register + login
    await server.inject({
      method: "POST",
      url: "/users",
      payload: { username: "eve", password: "secret", fullname: "Eve" },
    });
    const loginRes = await server.inject({
      method: "POST",
      url: "/authentications",
      payload: { username: "eve", password: "secret" },
    });
    const {
      data: { accessToken },
    } = JSON.parse(loginRes.payload);

    const res = await server.inject({
      method: "POST",
      url: "/threads/thread-not-found/comments/comment-not-found/replies",
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: { content: "should 404" },
    });
    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.payload);
    expect(body.status).toBe("fail");
    expect(body.message).toBeDefined();
  });

  it("should 400 when missing content", async () => {
    const server = await createServer(container);

    // user
    await server.inject({
      method: "POST",
      url: "/users",
      payload: { username: "ray", password: "secret", fullname: "Ray" },
    });
    const loginRes = await server.inject({
      method: "POST",
      url: "/authentications",
      payload: { username: "ray", password: "secret" },
    });
    const {
      data: { accessToken },
    } = JSON.parse(loginRes.payload);

    // thread + comment siap
    const t = await server.inject({
      method: "POST",
      url: "/threads",
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: { title: "t", body: "b" },
    });
    const threadId = JSON.parse(t.payload).data.addedThread.id;
    const c = await server.inject({
      method: "POST",
      url: `/threads/${threadId}/comments`,
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: { content: "c" },
    });
    const commentId = JSON.parse(c.payload).data.addedComment.id;

    // missing content
    const res = await server.inject({
      method: "POST",
      url: `/threads/${threadId}/comments/${commentId}/replies`,
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: {},
    });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.status).toBe("fail");
    expect(body.message).toBeDefined();
  });
});
