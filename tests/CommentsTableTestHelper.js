/* istanbul ignore file */

const pool = require('../src/Infrastructures/database/postgres/pool');

/**
 * CommentsTableTestHelper is a helper utility to assist integration testing
 * for the comments resource. It provides convenience methods to insert,
 * find and clean the comments table. The helper directly uses the
 * application's database pool so that any data inserted will be available
 * during the test run. This file is intentionally excluded from the
 * coverage report via istanbul ignore directive above.
 */
const CommentsTableTestHelper = {
  /**
   * Insert a comment record into the comments table. The caller can
   * optionally specify any field; sensible defaults are provided otherwise.
   *
   * @param {Object} params
   * @param {string} params.id - comment id (default: 'comment-123')
   * @param {string} params.content - comment content (default: 'comment content')
   * @param {string} params.threadId - id of associated thread (default: 'thread-123')
   * @param {string} params.owner - user id of comment owner (default: 'user-123')
   * @param {Date} params.date - timestamp of the comment (default: new Date())
   * @param {boolean} params.isDelete - whether the comment is soft deleted (default: false)
   */
  async addComment({
    id = 'comment-123',
    content = 'comment content',
    threadId = 'thread-123',
    owner = 'user-123',
    date = new Date(),
    isDelete = false,
  } = {}) {
    const query = {
      text: 'INSERT INTO comments (id, content, thread_id, owner, date, is_delete) VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, content, threadId, owner, date.toISOString(), isDelete],
    };
    await pool.query(query);
  },

  /**
   * Find a comment by its id. Returns raw rows from the database.
   *
   * @param {string} id - id of the comment to find
   * @returns {Promise<Array>} - list of rows (empty array if not found)
   */
  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  /**
   * Remove all records from the comments table. Useful to reset state
   * between integration tests.
   */
  async cleanTable() {
    await pool.query('DELETE FROM comments');
  },
};

module.exports = CommentsTableTestHelper;