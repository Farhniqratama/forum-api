/* istanbul ignore file */

const pool = require('../src/Infrastructures/database/postgres/pool');

/**
 * RepliesTableTestHelper is a helper utility for the replies resource. It
 * simplifies inserting, finding and cleaning reply records in the database
 * during integration tests. The helper directly interacts with the
 * application's PostgreSQL pool, so inserted data is visible to the
 * repository under test.
 */
const RepliesTableTestHelper = {
  /**
   * Insert a reply record into the replies table. Accepts optional
   * overrides for each column. Missing values will be filled with
   * sensible defaults.
   *
   * @param {Object} params
   * @param {string} params.id - reply id (default: 'reply-123')
   * @param {string} params.commentId - id of the associated comment (default: 'comment-123')
   * @param {string} params.content - reply content (default: 'reply content')
   * @param {string} params.owner - user id of reply owner (default: 'user-123')
   * @param {Date} params.date - timestamp of the reply (default: new Date())
   * @param {boolean} params.isDelete - whether the reply is soft deleted (default: false)
   */
  async addReply({
    id = 'reply-123',
    commentId = 'comment-123',
    content = 'reply content',
    owner = 'user-123',
    date = new Date(),
    isDelete = false,
  } = {}) {
    const query = {
      text: 'INSERT INTO replies (id, comment_id, content, owner, date, is_delete) VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, commentId, content, owner, date.toISOString(), isDelete],
    };
    await pool.query(query);
  },

  /**
   * Find a reply by its id. Returns the raw database rows.
   *
   * @param {string} id - id of the reply to search for
   * @returns {Promise<Array>} - array of rows matching the id
   */
  async findReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  /**
   * Delete all records from the replies table. Useful for cleaning up state
   * between tests.
   */
  async cleanTable() {
    await pool.query('DELETE FROM replies');
  },
};

module.exports = RepliesTableTestHelper;