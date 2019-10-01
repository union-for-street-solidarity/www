require('dotenv').config();
const config = require('./utils/config.js');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const multer = require('multer');
const favicon = require('serve-favicon');
const bodyParser = require("body-parser");
const urlparser = require('url');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// const OAuth2Strategy = require('passport-oauth2').Strategy;
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
const sharp = require('sharp');
const { User, Blog } = require('./models/index.js');
// const staticPath = path.join(__dirname, '.', 'client', 'public');
const publicPath = path.join(__dirname, '.', 'public');
const uploadedImages = '../uploads/img/';
const url = require('url')

mongoose.Promise = promise;
const app = express();
const store = new MongoDBStore(
	{
		mongooseConnection: mongoose.connection,
		uri: config.fullMongoUrl,
		collection: 'session'
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
// passport.use(new OAuth2Strategy({
//		 authorizationURL: 'https://www.example.com/oauth2/authorize',
//		 tokenURL: 'https://www.example.com/oauth2/token',
//		 clientID: EXAMPLE_CLIENT_ID,
//		 clientSecret: EXAMPLE_CLIENT_SECRET,
//		 callbackURL: "http://localhost:3000/auth/example/callback"
//	 },
//	 function(accessToken, refreshToken, profile, cb) {
//		 User.findOrCreate({ exampleId: profile.id }, function (err, user) {
//			 return cb(err, user);
//		 });
//	 }
// ));

const sess = {
	secret: config.secret,
	name: 'nodecookie',
	resave: true,
	saveUninitialized: true,
	store: store,
	cookie: { maxAge: 180 * 60 * 1000 }
}
var storage = multer.diskStorage({
	destination: async (req, file, cb) => {
		var p = (path.join(__dirname, uploadedImages) + req.params.id);
		var exists = await fs.existsSync(p);//.catch((err) => console.log(err));
		if (!exists) {
			mkdirp(p, (err) => {
				if (err) {
					cb(err)
				} else {
					cb(null, p)
				}
			})
		} else {
			cb(null, p)
		}
	},
	filename: (req, file, cb) => {
		var newPath = file.originalname.replace(/\.(tiff|jpg|jpeg)$/, '.png');
		cb(null, newPath) //Appending extension
	}
})

var uploadmedia = multer({ storage: storage });

// const htmlpath = path.join(__dirname, './client/public/index.html');
// app.get('/', (req, res) => res.sendFile(htmlpath));

// todo move these middleware to the middleware utils file
function autoIndexMedia(req, res, next) {
	Blog.find({}).lean().exec(async (err, data) => {
		if (err) {
			return next(err)
		}
		await data.forEach(async(doc, i) => {
			doc.media.forEach((item, j) => {
				item.index = j
			})
			await Blog.findOneAndUpdate({_id: req.params.id}, {$set: {media: JSON.parse(JSON.stringify(doc.media))}}, {new: true}, (err, doc) => {
				if (err) {
					return next(err)
				}
				return next()
			})
		})
	})
}

function grantAdmins(req, res, next) {
	User.find({}).lean().exec(async (err, users) => {
		if (err) {
			return next(err)
		}
		await users.forEach((user) => {
			if (config.admin.split(',').indexOf(user.username) !== -1 && !user.admin) {
				User.findOneAndUpdate({_id: user._id}, {$set: {admin: true}}, {upsert: false}, (err, user) => {
					if (err) {
						console.log(err)
					}
					
				})
			} 
		})
		return next()
	})
}

app
.set('views', './views')
.set('view engine', 'pug')
.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')))
// .use('/', express.static(staticPath))
.use('/uploadedImages',express.static(path.join(__dirname, uploadedImages)))
.use(express.static(publicPath))
.use(session(sess),
	passport.initialize(),
	passport.session(),
	// handle bodyParser separately to ensure it comes before csrfProtection
	cookieParser(sess.secret),
)
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

app.get('/', (req, res, next) => {
	return res.render('main', {
		
	})
});

app.post('/auth/check/:username', async (req, res, next) => {
	var username = req.params.username;
	const user = await User.findOne({username: username}).then((user) => user).catch((err) => next(err));
	if (!user) {
		return res.status(200).send('')
	} else {
		return res.status(200).send(user.username)
	}
})

app.get('/register', csrfProtection, function(req, res, next){
	return res.render('login', { csrfToken: req.csrfToken(), menu: 'register' } );
})

app.post('/register', upload.array(), parseBody, csrfProtection, function(req, res, next) {
	User.find({}, function(err, data){
		if (err) {
			return next(err)
		}
		var admin;
		if (config.admin.split(',').indexOf(req.body.username) !== -1) {
			admin = true;
		} else {
			admin = false;
		}
		User.register(new User(
			{ username : req.body.username, 
				email: req.body.email, 
				admin: admin,
				date: new Date()
			}
		), req.body.password, function(err, user) {
			if (err) {
				return res.render('login', {info: "Sorry. That Name already exists. Try again.", languages: langs});
			}
			req.session.username = req.body.username;
			passport.authenticate('local')(req, res, function () {
				User.findOne({username: req.body.username}, function(error, doc){
					if (error) {
						return next(error)
					}
					req.session.userId = doc._id;
					req.session.loggedin = doc.username;
					
					return res.redirect('/blog/api/streetstories')
				})
			});
		});
	})

});

app.get('/login', csrfProtection, (req, res, next) => {
	return res.render('login', {
		csrfToken: req.csrfToken(),
		menu: 'login'
	})
})

app.post('/login', upload.array(), parseBody, csrfProtection, passport.authenticate('local', {
	failureRedirect: '/login'
}), function(req, res, next) {

	req.session.userId = req.user._id;
	req.session.loggedin = req.user.username;
	res.redirect('/loggedin/'+req.user._id);
});

app.get('/loggedin', async(req, res, next) => {
	const user = await User.findOne({_id: req.user._id}).then((result) => result).catch((err) => next(err));
	if (user) {
		return res.redirect('/loggedin/'+req.user._id)
	} else {
		return res.redirect('/login')
	}
})

app.get('/loggedin/:id', csrfProtection, async (req, res, next) => {
	const user = await User.findOne({_id: req.params.id}).then((result) => result).catch((err) => next(err));
	return res.render('profile', {
		user: user,
		csrfToken: req.csrfToken()
	})
})
app.post('/loggedin/:id', upload.array(), parseBody, csrfProtection, (req, res, next) => {
	User.findOneAndUpdate({_id:req.params.id}, {$set:{about:req.body.about}}, {new:true}).lean().exec((err, user)=>{
		if (err) {
			return next(err)
		} else {
			req.session.user = user;
			return res.redirect('/loggedin/'+user._id)
		}
	})
})

app.get('/logout', function(req, res){
	req.logout();
	if (req.session) {
		req.session.destroy((err) => {
			if (err) {
				req.session = null;
			}
			res.redirect('/'); 
		})
	} else {
		res.redirect('/')
	}
})

app.all('/blog/api/*'
, ensureAdmin
)

app.get('/blog/api/grantadmins', grantAdmins, (req, res, next) => {
	return res.redirect('/')
})
.get('/blog/api/profile/:id', (req, res, next) => {
	var id = req.params.id;
	const user = User.findOne({_id: id}).then((result) => result).catch((err) => next(err))
	if (user.admin) {
		return res.render('profile', {
			user: user
		})
	}
})
.get('/blog/api/dashboard', ensureBlogData, autoIndexMedia, (req, res, next) => {
	return res.render('blogs', {
		data: req.featuredblogs,
		user: req.user
	})
})
.get('/blog/api/newstory', (req, res, next) => {
	var blog = new Blog({
		category: 'blog',
		title: '',
		author: '',
		lede: '',
		description: '',
		media: [
			{
				index: 0,
				image: '/images/logo.jpg',
				thumb: '/images/logo.jpg',
				caption:''
			}
		]
	});
	blog.save((err) => {
		if (err) {
			next(err)
		}
		return res.redirect('/blog/api/editstory/blog/'+blog._id)
	})
})
.get('/blog/api/editstory/:type/:id', csrfProtection, async (req, res, next) => {
	if (req.params.id && req.params.id !== 'null') {
		const doc = await Blog.findOne({_id: req.params.id}).then((doc) => doc).catch((err) => next(err));
		return res.render('edit', {
			doc: doc,
			csrfToken: req.csrfToken(),
			user: req.user,
			edit: true
		});
		
	} else {
		return res.render('edit', {
			csrfToken: req.csrfToken(),
			user: req.user,
			edit: false
		});
	}
})

app.post('/blog/api/newstory', upload.array(), parseBody
, csrfProtection
, async (req, res, next) => {
	const body = req.body;
	console.log(body);
	const content = new Blog(body);
	content.save((err)=>{
		if (err) {
			return next(err)
		}
		return res.sendFile(htmlpath);
	});
})

.post('/blog/api/editstory/:type/:id', upload.array(), parseBody, csrfProtection, (req, res, next) => {
	var media = req.body.media || [];
	console.log(req.body)
	const set = {$set: req.body}
	Blog.findOneAndUpdate({_id: req.params.id}, set, {new:true}, (err, doc) => {
		if (err) {
			return next(err)
		}
		return res.redirect('/blog/api/dashboard');
	
	})
})
.post('/blog/api/uploadimg/:id', uploadmedia.single('img'), parseBody, (req, res, next) => {
	const imagePath = req.file.path;
	const thumbPath = req.file.path.replace(/\.(png)$/, '.thumb.png');
	sharp(req.file.path).resize({ height: 200 }).toFile(thumbPath)
	.then(function(newFileInfo) {
		console.log("resize success")
		console.log(newFileInfo)
	})
	.catch(function(err) {
		console.log("resize error occured");
		console.log(err)
	});
	const media = {
		image: '/uploadedImages/'+req.params.id+'/'+req.file.filename,
		image_abs: req.file.path,
		thumb: '/uploadedImages/'+req.params.id+'/'+req.file.filename.replace(/\.(png)$/, '.thumb.png'),
		thumb_abs: thumbPath,
		caption: 'Edit me'
	}
	Blog.findOneAndUpdate({_id: req.params.id}, {$push: {media: media}}, {safe: true, upsert: false, new: true}, (err, doc) => {
		if (err) {
			return next(err)
		} else {
			return res.status(200).send(doc)
		}
	})
})
.post('/blog/api/deleteentry/:id', async function(req, res, next) {
	var outputPath = url.parse(req.url).pathname;
	var id = req.params.id;
	Blog.findById(id).lean().exec(async (err, doc) => {
		if (err) {
			return next(err)
		}
		var item = doc.media[0]
		var abs = (path.join(__dirname, uploadedImages) + id) +'/' + item.image
		var existsImg = await fs.existsSync(abs);
		if (existsImg) {
			var p = (path.join(__dirname, uploadedImages) + id);
			await fs.rmdirSync(p);
		}
		Blog.deleteOne({_id: doc._id}, (err, data) => {
			if (err) {
				return next(err)
			}
			return res.status(200).send('ok');
		})
	})
})
.post('/blog/api/deletemedia/:id/:index', function(req, res, next) {
	var id = req.params.id;
	var index = parseInt(req.params.index, 10);
	Blog.findOne({_id: id}).lean().exec(async function(err, thisdoc){
		if (err) {
			return next(err)
		}
		var oip = (!thisdoc.media[index] ? null : path.join(__dirname, '../uploads', thisdoc.media[index].image));
		var otp = (!thisdoc.media[index] ? null : path.join(__dirname, '../uploads', thisdoc.media[index].thumb));
		var existsImg = await fs.existsSync(oip);
		var existsThumb = await fs.existsSync(otp);
		if (existsImg) await fs.unlinkSync(oip);
		if (existsThumb) await fs.unlinkSync(otp);
		Blog.findOneAndUpdate({_id: id}, {$pull: {media: {_id: thisdoc.media[index]._id}}}, {multi: false, new: true}, function(err, doc) {
			if (err) {
				return next(err) 
			}
			return res.status(200).send(doc);
		})	
	})
});

app
.use(function (req, res, next) {
	if (req.url) console.log(require('url').parse(req.url).pathname)
	var err = new Error('Not Found');
	err.status = 404;
	return next(err)
})
.use(function (err, req, res, next) {
	console.log("!!!ERROR!!!")
	console.log(err)
	console.log("!!!ERROR!!!")
	// res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


if (mongoose.connection.readyState === 0) {
	// connect to mongo db
	const mongoUri = config.fullMongoUrl;
	const promise = mongoose.connect(
		mongoUri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
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