var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var RestaurantSchema = new Schema({
	name: String,
	borough: String,
	cuisine: String
});

module.exports  = mongoose.model('Restaurant', RestaurantSchema);
