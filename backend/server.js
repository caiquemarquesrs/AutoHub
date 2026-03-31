const app = require('./app');
const env = require('./src/config/env');

app.listen(env.PORT, () => {
  console.log(`AutoHub server running at http://localhost:${env.PORT}`);
});
