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
const { ensureAdmin, ensureAuthenticated, ensureBlogData, ensureBlogDocument, autoIndexMedia, grantAdmins, seedDb } = require('./utils/middleware.js');
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
const publicPath = path.join(__dirname, 'public');
const uploadedImages = '../uploads/img/';
const uploadedIframes = '../uploads/iframe/'
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
// TODO: MatterMost Auth!
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
app.locals.appUrl = (config.env === 'production' ? 'https://streetsolidarity.com' : 'http://localhost:'+config.port+'')
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
		var uploadDir = (req.params.type === 'img' ? uploadedImages : uploadedIframes);
		var initDir = (path.join(__dirname, uploadDir));
		var p = (path.join(__dirname, uploadDir) + '/'+ req.params.id);
		var exists = await fs.existsSync(p);//.catch((err) => console.log(err));
		if (!exists) {
			// await fs.mkdirSync(initDir, {recursive:true});
			await fs.mkdirSync(p, {recursive:true});
			cb(null, p)
			// fs.mkdir(initDir, {recursive:true}, err => {
			// 	if (err) {
			// 		cb(err)
			// 	} else {
			// 		fs.mkdir(p, {recursive:true}, (err) => {
			// 			if (err) {
			// 				cb(err)
			// 			} else {
			// 				cb(null, p)
			// 			}
			// 		})
			// 	}
			// })
			
		} else {
			cb(null, p)
		}
	},
	filename: (req, file, cb) => {
		if (req.params.type === 'img') {
			var newPath = file.originalname.replace(/\.(tiff|jpg|jpeg)$/, '.png');
			cb(null, newPath) //Appending extension
		} else if (req.params.type === 'doc') {
			cb(null, file.originalname)
		}
	}
})

var uploadmedia = multer({ storage: storage });

app
.set('views', './views')
.set('view engine', 'pug')
.use(favicon(path.join(publicPath, 'icons', 'favicon.ico')))
.use(express.static(publicPath))
.use('/uploadedIframes',express.static(path.join(__dirname, uploadedIframes)))
.use('/uploadedImages',express.static(path.join(__dirname, uploadedImages)))
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
	app.disable('x-powered-by');
	app.disable('Strict-Transport-Security');
	response.set({
			'Access-Control-Allow-Origin' : '*',
			'Access-Control-Allow-Methods' : 'GET, POST, HEAD, OPTIONS',
			'Access-Control-Allow-Headers' : 'Cache-Control, Origin, Content-Type, Accept, Set-Cookie',
			'Access-Control-Allow-Credentials' : true,
		});
	// response.header('Access-Control-Allow-Origin', '*');
	// response.header(
	// 	'Access-Control-Allow-Headers',
	// 	'Origin, X-Requested-With, Content-Type, Accept'
	// );
	// response.header('Access-Control-Allow-Methods', 'GET, POST');
	// response.header('Accept', '*/*');
	next();
});

app.get('*', ensureBlogData)

app.get('/', (req, res, next) => {
	if (req.query && req.query.c) {
		Blog.find({category: req.params.category}).lean().exec((err, data) => {
			if (err) {
				return next(err)
			}
			return res.render('main', {
				distinct: req.distinct,
				data: data,
				user: req.user
			})
		})
	} else {
		return res.render('main', {
			distinct: req.distinct,
			data: req.featuredblogs,
			user: req.user
		})
	}
	
});

app.param('category', (req, res, next, value) => {
	// console.log('param')
	// console.log(value)
	if (['login', 'register', 'auth', 'loggedin', 'logout'].indexOf(value) !== -1) {
		return next('route')
	}
	Blog.findOne({category: value}).lean().exec((err, doc) => {
		if (err) {
			return next('route')
		} else {
			if (!doc) {
				return next()
			} else {
				return next()
			}
		}
	})
})
app.get('/:category', (req, res, next) => {
	Blog.find({category: req.params.category}).lean().exec((err, data) => {
		if (err) {
			return next(err)
		}
		if (data.length === 0) {
			return res.redirect('/blog/api/seed')
		} else {
			// console.log(req.user, req.session.user)
			return res.render('main', {
				distinct: req.distinct,
				data: data,
				// doc: data[data.length - 1],
				user: req.user
			})
		}
	})
})

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
				date: new Date(),
				about: ''
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
					req.session.user = doc;
					req.session.userId = doc._id;
					req.session.loggedin = doc.username;
					
					return res.redirect('/loggedin')
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
	req.session.user = req.user;
	req.session.userId = req.user._id;
	req.session.loggedin = req.user.username;
	res.redirect('/loggedin/'+req.user._id);
});

app.get('/loggedin', async(req, res, next) => {
	let user;
	if (req.user) {
		user = await User.findOne({_id: req.user._id}).then((result) => result).catch((err) => next(err));
	}
	if (user) {
		return res.redirect('/loggedin/'+req.user._id)
	} else {
		return res.redirect('/login')
	}
})

app.get('/loggedin/:id', csrfProtection, async (req, res, next) => {
	const user = await User.findOne({_id: req.params.id}).then((result) => result).catch((err) => next(err));
	const data = await Blog.find({category: 'draft', author: req.params.id}).then((result) => result).catch((err) => next(err));
	return res.render('profile', {
		user: user,
		csrfToken: req.csrfToken(),
		data: data
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

app.get('/blog/:id', ensureBlogDocument, (req, res, next) => {
	// console.log(req.doc);
	User.findOne({_id: req.doc.author}).lean().exec((err, author) => {
		if (err) {
			return next(err)
		}
		return res.render('main', {
			distinct: req.distinct,
			data: [req.doc],
			user: req.user,
			author: author
		})

	})
})

app.all('/blog/api/*'
, ensureAdmin
)

app.get('/blog/api/seed', seedDb, (req, res, next) => {
	return res.redirect('/')
})




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
// .get('/blog/api/dashboard', ensureBlogData, autoIndexMedia, (req, res, next) => {
// 	return res.render('main', {
// 		data: req.featuredblogs,
// 		user: req.user
// 	})
// })
.get('/blog/api/newstory', (req, res, next) => {
	var blog = new Blog({
		category: 'draft',
		title: '',
		author: req.user._id,
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
		return res.redirect('/blog/api/editstory/draft/'+blog._id)
	})
})
.get('/blog/api/editstory/:type/:id', csrfProtection, async (req, res, next) => {
	if (req.params.id && req.params.id !== 'null') {
		const doc = await Blog.findOne({_id: req.params.id}).then((doc) => doc).catch((err) => next(err));
		return res.render('edit', {
			distinct: req.distinct,
			data: [doc],
			csrfToken: req.csrfToken(),
			user: req.user,
			edit: true
		});
		
	} else {
		return res.render('edit', {
			distinct: req.distinct,
			csrfToken: req.csrfToken(),
			user: req.user,
			edit: false
		});
	}
})

// app.post('/blog/api/newstory', upload.array(), parseBody
// , csrfProtection
// , async (req, res, next) => {
// 	const body = req.body;
// 	console.log(body);
// 	const content = new Blog(body);
// 	content.save((err)=>{
// 		if (err) {
// 			return next(err)
// 		}
// 		return res.sendFile(htmlpath);
// 	});
// })

.post('/blog/api/editstory/:type/:id', upload.array(), parseBody, csrfProtection, (req, res, next) => {
	var media = req.body.media || [];
	// console.log(req.body)
	const set = {$set: req.body}
	Blog.findOneAndUpdate({_id: req.params.id}, set, {new:true}, (err, doc) => {
		if (err) {
			return next(err)
		}
		if (doc.category === 'draft') {
			return res.redirect('/loggedin')
		} else {
			return res.redirect('/blog');
		}
	
	})
})
.post('/blog/api/uploaddoc/:type/:id/:index', uploadmedia.single('doc'), parseBody, (req, res, next) =>{
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)
	const iframePath = req.file.path;
	const dc = {
		title: req.file.filename,
		iframe: '/uploadedIframes/'+req.params.id+'/'+req.file.filename,
		iframe_abs: iframePath,
		caption: 'Edit me'
	}
	var query = {$set: {}};
	let key;
	key = 'doc'
	query.$set[key] = dc;
	// console.log(req.body)
	
	var query2 = {$set: {}};
	let key2 = 'title';
	query2[key2] = req.file.filename;
	Blog.findOneAndUpdate({_id: req.params.id}, query, {safe: true, upsert: false, new: true}, (err, doc) => {
		if (err) {
			return next(err)
		} else {
			Blog.findOneAndUpdate({_id: req.params.id}, query2, {safe: true, upsert: false, new: true}, (err, doc) => {
				if (err) {
					return next(err)
				} else {
					return res.status(200).send(doc)
				}
			})
		}
	})
})
.post('/blog/api/uploadimg/:type/:id/:index', uploadmedia.single('img'), parseBody, (req, res, next) => {
	const imagePath = req.file.path;
	const thumbPath = req.file.path.replace(/\.(png)$/, '.thumb.png');
	const index = parseInt(req.params.index);
	sharp(req.file.path).resize({ height: 200 }).toFile(thumbPath)
	.then(function(newFileInfo) {
		console.log("resize success")
		console.log(newFileInfo)
	})
	.catch(function(err) {
		console.log("resize error occured");
		console.log(err)
	});
	sharp(req.file.path).resize({ 
		width: 1200,
		withoutEnlargement: true
	}).toFile(imagePath)
	.then(newFileInfo => console.log(newFileInfo))
	.catch(err => console.log(err))
	const media = {
		image: '/uploadedImages/'+req.params.id+'/'+req.file.filename,
		image_abs: imagePath,
		thumb: '/uploadedImages/'+req.params.id+'/'+req.file.filename.replace(/\.(png)$/, '.thumb.png'),
		thumb_abs: thumbPath,
		caption: 'Edit image caption'
	}
	var query = (
		isNaN(index) ? 
		{$push: {}} :
		{$set: {}}
	)
	let key;
	if (isNaN(index)) {
		key = 'media'
		query.$push.media = media
	} else {
		key = 'media.'+index+''
		query.$set[key] = media
	}
	// console.log(query)
	Blog.findOneAndUpdate({_id: req.params.id}, query, {safe: true, upsert: false, new: true}, (err, doc) => {
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
	return next(err)
})
.use(function (err, req, res, next) {
	console.log("!!!ERROR!!!")
	console.log(err)
	console.log("!!!ERROR!!!")
	// res.status(err.status || 500);
	return res.render('error', {
		message: err.message,
		error: {}
	});
});


if (mongoose.connection.readyState === 0) {
	// connect to mongo db
	const mongoUri = (process.env.NODE_ENV === 'development' ? config.devDb : config.fullMongoUrl );
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