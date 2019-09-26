var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
		Blog = require('mongoose-geojson-schema');

var Media = new Schema({
	caption: String,
	image: String,
	image_abs: String,
	thumb: String,
	thumb_abs: String,
	iframe: String,
	orientation: String
});

var schema= new Schema({
	// properties: {
		category: String,
		title: String,
		author: String,
		lede: String,
		description: String,
		date: Date,
		media: [Media],
		tags: [String],
    footnotes: [ ],
	// },
	geometry: Schema.Types.GeoJSON
	
}, {collection: 'blog'});

schema.index({ geometry: '2dsphere' });
module.exports = mongoose.model('Blog', schema);