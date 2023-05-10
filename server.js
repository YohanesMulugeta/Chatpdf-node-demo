const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/config.env` });

const mongoose = require('mongoose');
const app = require('./app');

app.on('uncaughtException', (err) => {
  console.log('ERRROR UNCAUGHT EXCEPTION', err);
  // process.exit();
});

const db = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD);

(async () => {
  try {
    await mongoose.connect(db);

    console.log('Database connection successfull');

    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log(`App Listning to port: ${port}`);
    });
  } catch (err) {
    console.log(err);
  }
})();

app.on('unhandledRejection', (err) => {
  console.log('ERROR UNHANDLED REJECTION! SHUTING DOWN...');
  console.log(err.name);

  // server.close(() => {
  //   process.exit();
  // });
});
