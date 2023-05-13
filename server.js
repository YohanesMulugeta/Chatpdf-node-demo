const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/config.env` });

const app = require('./app');

const { pineconeClient, loadPdf } = require('./util/ReadAndFormatPdf');

app.on('uncaughtException', (err) => {
  console.log('ERRROR UNCAUGHT EXCEPTION', err);
  // process.exit();
});

(async () => {
  try {
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
