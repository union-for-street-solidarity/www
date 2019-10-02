const { Blog } = require('../models/index.js');
function ensureAdmin(req, res, next) {
	if (!req.isAuthenticated() || !req.user || !req.user.admin) {
		return res.redirect('/login')
	} else {
		console.log(req.user)
		return next()
	} 
}
function ensureAuthenticated(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.redirect('/login')
	} else {
		req.session.user = req.user;
		return next()
	}
}
function aggregateData(distinct, cb) {
	Blog.find({}).lean().exec((err, data)=>{
		cb(err, data)
	})
}
const ensureBlogDocument = async (req, res, next, val) => {
	const doc = await Blog.findById(val).lean().then((doc) => doc).catch((err) => next(err));
	if (!doc) {
		return next();
	} else {
		req.doc = doc;
		return next()
	}
}

function ensureBlogData(req, res, next) {
	Blog.distinct('category', (err, distinct) => {
		if (err) return next(err);
		if (!distinct || distinct.length === 0) {
			
			return res.redirect('/blog/api/seed')

		} else {
			aggregateData(distinct, (err, data)=>{
				if (err) return next(err);
				if (data && data.length > 0) req.featuredblogs = data;
				return next();
			})
		}
	})
	// .catch((err) => next(err));
	

}
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

const seedDb = async (req, res, next) => {
	const distinct = await Blog.distinct("category").then((dist) => dist).catch((err) => console.log(err));
	if (distinct && distinct.length > 1) {
		return next()
	} else {
		const abs = path.join(publicPath, 'content.json');
		const exists = await fs.existsSync(abs);
		if (exists) {
			const content = await fs.readFileSync(abs).toString();
			console.log(content)
			await JSON.parse(content).forEach(async (item) => {
				const entry = new Blog(item);
				entry.date = new Date()
				await entry.save((err) => {
					if (err) {
						return next(err)
					} else {
						console.log('ok')
					}
				})
				return next()
			})
		} else {
			console.log(abs)
		}
	}
}

module.exports = { ensureAdmin, ensureAuthenticated, ensureBlogDocument, ensureBlogData, autoIndexMedia, grantAdmins, seedDb }
