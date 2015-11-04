// node_rest_server.js

// BASE SETUP
// =============================================================================

// Instantiates the packages required
var express     = require('express');        // call express
var app         = express();                 // define our app using express

var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var assert      = require('assert');

// Configure app
app.use(morgan('dev')); // log requests to the console

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port    = process.env.PORT || 8080;        // set our port

// Format: mongodb://<server_url>:<port>/<database_name>
var dbUrl       = 'mongodb://localhost:27017/test';
var mongoose    = require('mongoose');
mongoose.connect(dbUrl);    // connect to our database
var Restaurant  = require('./model/restaurant');

// SUPPORTING FUNCTIONS FOR API
// =============================================================================
var findRestaurantsWithSpecificFlavourInaZipcode = function(res, db, callback) {
   var cursor = db.collection('restaurants').find(
     { "cuisine": "Italian", "address.zipcode": "10075" }
   );

   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
         console.dir(doc);
         res.end(JSON.stringify(doc));
      } else {
         callback();
      }
   });
};


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
	// Intercept the request and do more processing
	console.log('<Request interceptor>');
	next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'Welcome to Restaurant service API base. Malformed request observed!' });
});

// on routes that end in /restaurants
// ----------------------------------------------------
router.route('/restaurants')

	// create a restaurant (accessed at POST http://localhost:8080/api/restaurants)
	.post(function(req, res) {
		var restaurant = new Restaurant();		// create a new instance of the Bear model
		restaurant.name = req.body.name;  // set the bears name (comes from the request)

		restaurant.save(function(err) {
			if (err)
				res.send(err);

			res.json({ message: 'Restaurant created!' });
		});
	})

	// Get all the restaurants (accessed at GET http://localhost:8080/api/restaurants)
	.get(function(req, res) {
		Restaurant.find(function(err, restaurants) {
			if (err)
				res.send(err);

			res.json(restaurants);
		});
	});

// On routes that end in /restaurants/:restaurant_id
// ----------------------------------------------------
router.route('/restaurants/:restaurant_id')

	// get the bear with that id
	.get(function(req, res) {
		Restaurant.findById(req.params.restaurant_id, function(err, restaurant) {
			if (err)
				res.send(err);
			res.json(restaurant);
		});
	})

	// update the bear with this id
	.put(function(req, res) {
		Restaurant.findById(req.params.restaurant_id, function(err, restaurant) {

			if (err)
				res.send(err);

			restaurant.name = req.body.name;
			restaurant.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: req.body.name + ' Restaurant updated!' });
			});

		});
	})

	// delete the bear with this id
	.delete(function(req, res) {
		Restaurant.remove({
			_id: req.params.restaurant_id
		}, function(err, restaurant) {
			if (err)
				res.send(err);

			res.json({ message: restaurant.name + 'Successfully deleted' });
		});
	});

// On routes that end in /restaurants/:Cuisine
// ----------------------------------------------------
router.route('/restaurants/:cuisine')

	// get the bear with that id
	.get(function(req, res) {
		Restaurant.find({cuisine: req.params.cuisine}, function(err, restaurant) {
			if (err)
				res.send(err);
			res.json(restaurant);
		});
	})

// REGISTER OUR ROUTES -------------------------------
// All of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server ready on port ' + port);
