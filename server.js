import mongoose from 'mongoose';
import dotenv from 'dotenv';

process.on('uncaughtException', (error) => {
  console.log(error.name, error.message);
  console.log('UNCAUGHT EXCEPTON, shutting down server...');
  process.exit(1);
});

dotenv.config({ path: './.env' });
import app from './app.js';

const dbString = process.env.DATABASE_CONNECTION_STRING;

mongoose
  .connect(dbString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Database connection successful');
  });

const server = app.listen(
  process.env.PORT,
  console.log(`Server is running on port ${process.env.PORT}`)
);

process.on('unhandledRejection', (error) => {
  console.log(error.name, error.message);
  console.log('UNHANDLED REJECTION, shutting down server...');
  server.close(() => {
    process.exit(1);
  });
});
