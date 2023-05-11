const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/config.env` });

const mongoose = require('mongoose');
const app = require('./app');

const { pineconeClient, loadPdf } = require('./util/ReadAndFormatPdf');

app.on('uncaughtException', (err) => {
  console.log('ERRROR UNCAUGHT EXCEPTION', err);
  // process.exit();
});

const db = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD);

(async () => {
  try {
    await mongoose.connect(db);

    console.log('Database connection successfull');
    // (async () => {
    //   const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX_NAME);
    //   const response = await pineconeIndex.delete1({
    //     deleteAll: true,
    //     namespace: 'pine-1683727478811',
    //   });

    //   console.log(response);
    // })();

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
