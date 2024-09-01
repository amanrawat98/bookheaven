import express from 'express';
import dotenv from 'dotenv';
import  {config} from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import { dbConnection } from './database/dbconnection.js';
import messageRouter from './router/messageRouter.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import userRouter from './router/userRouter.js';
import favouriteRouter from './router/favouriteRouter.js';
import bookRouter from './router/bookRouter.js';
import cartRouter from './router/cartRouter.js';
import orderRouter from './router/orderRouter.js';

import path from 'path';
import { fileURLToPath } from 'url';


const app = express();

config({path:'./config/config.env'});

dotenv.config();


app.use(cors())


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(fileUpload({
  useTempFiles:true,
  tempFileDir:"/temp/",
})
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/static', express.static(path.join(__dirname, '../static')));

app.use('/api/v1/message',messageRouter);
app.use('/api/v1',userRouter);
app.use('/api/v1',bookRouter);
app.use('/api/v1',favouriteRouter);
app.use('/api/v1',cartRouter);
app.use('/api/v1',orderRouter);







dbConnection();


app.use(errorMiddleware);
export default app;
