// src/Infrastructures/http/_test/threads.negatives.test.js
const createServer = require("../createServer");
const container = require("../../container");

describe("Threads endpoint (negative cases)", () => {
  it("should respond 401 when no Authorization header", async () => {
    const server = await createServer(container);

    const res = await server.inject({
      method: "POST",
      url: "/threads",
      payload: {
        title: "sebuah judul",
        body: "sebuah body",
      },
      // tidak ada headers Authorization
    });

    expect(res.statusCode).toBe(401);

    const body = JSON.parse(res.payload);
    // Bentuk default error dari Hapi
    expect(body.statusCode).toBe(401);
    expect(body.error).toBe("Unauthorized");
    expect(body.message).toBeDefined(); // biasanya "Missing authentication"
  });
});
