import createError from 'http-errors';
import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import  cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';
import setupSwagger from './utils/swagger.js';

// Import your local route modules (adjust file extensions if needed)
import indexRouter from './routes/index.js';
import authRouter from './src/user/index.js' 
import agentRouter from './src/Agent/index.js';
import karigarRouter from './src/Karigar/index.js';
import manufacturerRouter from './src/Manufacturer/index.js';
import pipeMakerRouter from './src/PipeMaker/index.js';
import GeneralRoutes from "./src/General/index.js"
import {responseHandler} from './utils/apiResponse.js'
import helperRouter from './src/helper/index.js'
import custommethod from "./middleware/validator/customMethods.js";

// ---------------------------------------------------------------------
// Recreate __dirname in ESM
// ---------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------------------------------------------------------------------
// Create Express App
// ---------------------------------------------------------------------
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// middleware
app.use(morgan('dev'));

app.use(express.json({ type: "application/json", limit: "50mb" }));

app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(responseHandler);

app.use(cookieParser());

const corsOptions = {
  origin: [
    'http://localhost:8081', // React Native dev server
    'http://192.168.1.5:8081', // Your local IP
    'exp://192.168.1.5:19000', // Expo dev client
    'your-app://' // Production app bundle ID
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'authToken'],
  credentials: true
};

app.use(cors(corsOptions)); 

// static folder
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------

app.use(custommethod);
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/agent', agentRouter);
app.use('/karigar', karigarRouter);
app.use('/manufacturer', manufacturerRouter);
app.use('/pipeMaker', pipeMakerRouter);
app.use('/general', GeneralRoutes);
app.use('/api/helper',helperRouter)





setupSwagger(app); 


// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error =
    req.app.get('env') === 'development' ? err : {};

  // render the error page
  console.log(err)
  res.status(err.status || 500);
  res.render('error');
});


// ---------------------------------------------------------------------
// Export the app (ESM style)
// ---------------------------------------------------------------------
export default app;
