require('dotenv').config();
const config = require('./utils/config.js');
const path = require('path');
const favicon = require('serve-favicon');
const bodyParser = require("body-parser");
const urlparser = require('url');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const MongoDBStore = require('connect-mongodb-session')(session);
const { ensureAdmin, ensureAuthenticated, ensureBlogData, ensureBlogDocument } = require('./utils/middleware.js');
const mongoose = require('mongoose');
const promise = require('bluebird');
const csrf = require('csurf'); 
const upload = require('multer')(); 
const csrfProtection = csrf({ cookie: true });
const parseForm = bodyParser.urlencoded({ extended: false });
const parseJSONBody = bodyParser.json();
const parseBody = [parseJSONBody, parseForm];
const cookieParser = require("cookie-parser");
const { User, Blog } = require('./server/models/index.js');
const staticPath = path.join(__dirname, '.', 'client', 'public');
const publicPath = path.join(__dirname, '.', 'server', 'public');
// const sass = require('node-sass');
mongoose.Promise = promise;
const app = express();
const store = new MongoDBStore(
	{
		mongooseConnection: mongoose.connection,
		uri: config.mongourl,
		// keeping as 'shopSession' even though it's the whole app's session
		collection: 'shopSession'
	}
);
store.on('error', function(error){
	console.log(error);
});

passport.serializeUser(function(user, cb) {
  cb(null, user._id);
});
passport.deserializeUser(function(id, cb) {
  User.findById(id, function(err, user) {
		cb(err, user);
  });
});
passport.use(new LocalStrategy(User.authenticate()));

const sess = {
	secret: config.secret,
	name: 'nodecookie',
	resave: true,
	saveUninitialized: true,
	store: store,
	cookie: { maxAge: 180 * 60 * 1000 }
}
const htmlpath = path.join(__dirname, './client/public/index.html');
app.get('/', (req, res) => res.sendFile(htmlpath));

app
.set('views', './server/views')
.set('view engine', 'pug')
.use(favicon(path.join(__dirname, 'client/src/images', 'logo.jpg')))
.use('/', express.static(staticPath))
.use(express.static(publicPath))
.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
})

app.use((request, response, next) => {
  response.header('Access-Control-Allow-Origin', '*');
  response.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  response.header('Access-Control-Allow-Methods', 'GET, POST');
  response.header('Accept', '*/*');
  next();
});

// app.use((req, res, next) => {
//   const writePath = path.join(__dirname, './server/public/css/style.css');
//   sass.render({
//     file: path.join(__dirname, './utils/assets/scss/main.scss'),
//     outFile: writePath,
//   }, function(error, result) { // node-style callback from v3.0.0 onwards
//     if(!error){
//       // No errors during the compilation, write this result on the disk
//       fs.writeFile(writePath, result.css, function(err){
//         if(!err){
//           return next()
//         } else {
//           return next(err)
//         }
//       });
//     }
//   });
// });


app.get('/blog', ensureBlogData, (req, res, next) => {
  return res.render('server/views/blogs', {
		data: req.featuredblogs
    // ,
		// vData: JSON.stringify(req.featuredblogs)
  })
})

app.get('/blog/:id', (req, res, next) => {
  Blog.findById(req.params.id).lean().exec((err, doc) => {
		if (err) {
			return next(err)
		}
		if (doc && doc.author) {
			User.findById(doc.author).lean().exec((err, author) => {
				if (err) {
					console.log(err)
				} else {
					return res.render('server/views/partials/blog', {
						user: (!req.user ? req.session.user : req.user),
						doc: doc,
						// vDoc: JSON.stringify(doc),
						author: author
				  });
				}
			})
		} else {
			// console.log(doc)
			return res.render('server/views/partials/blog', {
				user: (!req.user ? req.session.user : req.user),
				// vDoc: JSON.stringify(doc),
				doc: doc//JSON.parse(JSON.stringify(doc))//JSON.stringify(doc)
			});
		}
	})
})
app.all('/api', ensureAdmin)

app.post('/api/newstory', upload.array(), parseBody
// , csrfProtection
, async (req, res, next) => {
  const body = req.body;
  console.log(body);
  const content = new Blog(body);
  await content.save((err)=>next(err));
  return res.sendFile(htmlpath);
})

app.get('/api/editstory/:type/:id', async (req, res, next) => {
  const doc = await Blog.findOne({_id: req.params.id}).lean().then((doc) => doc).catch((err) => next(err));
  // let author;
  // if (doc) author = await User.findById(doc.author).lean().then((author) => author).catch((err) => next(err));
  res.render('edit', {
    doc: doc,
    vDoc: JSON.stringify(doc),
    // csrfToken: req.csrfToken(),
    user: req.user,
    // author: author,
    edit: true
  });

})

app.post('/api/editstory/:type/:id', upload.array(), parseBody, (req, res, next) => {
  var media = req.body.media || []
  const set = {$set: req.body}
  Blog.findOneAndUpdate({_id: req.params.id}, set, {new:true}, (err, doc) => {
    if (err) {
      return next(err)
    }
    return res.redirect('/blog/'+doc._id);
  
  })
  // const post = new Blog({
  //   author: req.user._id,
  //   lede: req.body.lede,
  //   type: req.body.type,
  //   title: req.body.title,
  //   category: req.body.category,
  //   description: req.body.description,
  //   date: new Date(),
  //   media: media,
  //   tags: req.body.tags
  // });
  // post.save((err) => {
  //   if (err) return next(err)
  // });

})

app
.use(function (req, res, next) {
	if (req.url) console.log(require('url').parse(req.url).pathname)
	var err = new Error('Not Found');
	err.status = 404;
	return res.render('error', {
		message: err.message,
		error: {}
	});
})
.use(function (err, req, res, next) {
	console.log("!!!ERROR!!!")
	console.log(err)
	console.log("!!!ERROR!!!")
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


if (mongoose.connection.readyState === 0) {
  // connect to mongo db
  const mongoUri = config.fullMongoUrl;

  const promise = mongoose.connect(
    mongoUri, { useNewUrlParser: true }
  );
  promise
    .then(() => {
      console.log('MongoDB is connected');
    })
    .catch(err => {
      console.log(err);
      console.log('MongoDB connection unsuccessful');
    });
}

app
.listen(config.port, function () {
	console.log('Using Node Version: ' + process.version);
	(process.version == 'v10.15.3') ? console.log('..up-to-date') : console.log('expecting v10.15.3');
	console.log('Web server listening on port: ' + config.port);
});