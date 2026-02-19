import express, { Application } from 'express';
import dotenv from 'dotenv'
import { apiMiddleware } from './middleware/gateway-middleware';


dotenv.config()
const app: Application = express();
app.use(express.json());

app.use(apiMiddleware);

app.listen(process.env.PORT, () => {
    console.log(`server is running on ${process.env.PORT}`)
})


