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
			
			var data = initData.map((doc) => {
				var entry = {
					title: 'About the '+doc.category+'',
					category: doc.category,
					description: doc.description,
					media: doc.media,
					tags: ['committee'],
					date: new Date()
				}
				var blog = new Blog(entry);
				blog.save((err) => console.log(err));
				return entry;
			});
			// data = await Blog.find({}).lean().then((data)=>data).catch((err)=>next(err));
			if (data && data.length > 0) req.featuredblogs = data;
			return next();

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
module.exports = { ensureAdmin, ensureAuthenticated, ensureBlogDocument, ensureBlogData }
