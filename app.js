require('dotenv').config();
require('module-alias/register');
require('@initializer/apartment/apartmentSeed.js');
require('./config/database');
const {
  CONFIG,
  QUEUES
}=require('@helpers/constants')

const {
  Worker,
  Job,
  Queue,
} = require('bullmq');

const Redis = require('ioredis')
const DaVinciQueue = new Worker('DaVinciQueue', `${__dirname}/handlers/DaVinciHandler/index`, {
  connection: new Redis(CONFIG.REDIS_URI),
  concurrency: 10
})

DaVinciQueue.on('completed', async (job) => {
  console.log(`${QUEUES.DA_VINCI_QUEUE}: Job ${job.id} has been completed`)
});
// require('./config/database');
const queues = require('@config/queues')({});
const express = require('express');
const bodyParser = require('body-parser');
// const socketio = require('socket.io');
// const compression = require('compression');

const cors = require('cors');



const http = require('http');
const useragent = require('express-useragent');
const AirbrakeProvider = require('@provider/airbrake/index.js')
const morgan = require('morgan');

const app = express();
const airbrake_provider = new AirbrakeProvider();
app.use(airbrake_provider.getMiddleware());
// app.use('/webhook/stripe', bodyParser.raw({
//   type: "*/*"
// }))
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('trust proxy', true);



app.use(cors({
  origin: '*',
  optionsSuccessStatus: 200 // For legacy browser support
}));

app.use(useragent.express());

app.get('/Ping', async (req, res) => {
  res.status(200).send('ok');
});

app.use(
  morgan('dev', {
    skip(req, res) {
      // eslint-disable-next-line no-empty
      if (res) {}
      if (req.originalUrl.indexOf('path') >= 0) {
        return true;
      }
      return false;
    },
  }),
);

app.get('/', async (req, res) => {
  res.redirect('/console');
});

const server = http.createServer(app);

const router = express.Router();

router.use(
  express.urlencoded({
    limit: '100mb',
    extended: true,
  }),
);
router.use(
  express.json({
    limit: '100mb',
    extended: false,
  }),
);


const api = express.Router();
const webhook = express.Router();
api.use(
  express.urlencoded({
    limit: '100mb',
    extended: true,
  }),
);
api.use(
  express.json({
    limit: '100mb',
    extended: true,
  }),
);

webhook.use(
  express.urlencoded({
    limit: '100mb',
    extended: true,
  }),
);
webhook.use(
  express.json({
    limit: '100mb',
    extended: true,
  }),
);


const growthbook = require('./provider/growthbook')
app.use('/api', api);
const apiParams = {
  api,
  growthbook,
  queues
};
require('./api/api')(apiParams);
// require('./api/webhook')({
//   webhook,
//   growthbook,
//   queues
// });


app.use(airbrake_provider.getErrorware());
app.use('/', router);

router.all('/*', (req, res) => {
  res.status(404).send('Not Found');
});
// const redisBatch = require('@provider/redis/redis')
//const t = (new redisBatch()).batchDeletionKeysByPattern(`user_*_prompt_daily_count`);

// require('./worker')

process.on('unhandledRejection', (reason, promise) => {
  console.log('UnhandledRejection: ', reason);
});

const port = CONFIG.PORT || 3000;
setTimeout(() => {
  server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}, 2000);