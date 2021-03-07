const app = require('express')();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
var upload = multer({
  limits: { fieldSize: 25 * 1024 * 1024 }
});

const { port, appUrl, databaseUrl } = require('./config');

mongoose
  .connect(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to db!');
  })
  .catch(error => {
      console.error(error);
  });

//Import Routes
const authRoute = require('./routes/auth');
const postsRoute = require('./routes/posts');
const tokenRoute = require('./routes/token');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array('allfile', 12));

//Route Middlewares
app.use('/api/user', authRoute);
app.use('/api/posts', postsRoute);
app.use('/api/token', tokenRoute);

app.get('/', (req, res) => {
    res.send('Server is up and running!');
  });

app.listen(port, () => {
    console.log(`Server listening on ${appUrl}`);
});