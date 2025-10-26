module.exports = {
  apps: [{
    name: 'forum-api',
    script: 'src/app.js',
    instances: 1,
    exec_mode: 'fork',
    env: { NODE_ENV: 'production' }
  }]
}
