// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();

// configure app
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ALLOW CROSS for external domains
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var port     = process.env.PORT || 8080; // set our port

var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost/partiesfines'); // connect to our database
var User     = require('./app/models/user');

// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log ('REQ Entry : ');
	console.log (req.body);
	next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });	
});

// on routes that end in /bears
// ----------------------------------------------------
router.route('/user')

	// create a user
	.post(function(req, res) {
		console.log ('POST user : ');
		
		var user = new User();		// create a new instance of the Bear model
		var objectFB = req.body.objectFB;
		console.log (req.body.objectFB);
		// info user in conect for app
		user.id = objectFB.id;  // set the bears name (comes from the request)
		user.name = objectFB.name;
		user.bio = objectFB.bio;
		user.email = objectFB.email;
		user.first_name = objectFB.first_name;
		user.link = objectFB.link;
		user.locale = objectFB.locale;
		user.timezone = objectFB.timezone;
		user.updated_time = objectFB.updated_time;
		user.verified = objectFB.verified;
		// token
		require('crypto').randomBytes(48, function(ex, buf) {
  			user.server_token = buf.toString('hex');
		});
		// CHECK if user ever exist
		User.findOne({id: user.id}, function(err, result) {
			if (err){
				console.log ("error");
			}if (result) {
        		console.log ("RESULT OK");
    		} else {
    			// ajout utilisateur
    			user.save(function(err) {
					if (err){
						res.send(err);
					}
					res.json({ message: 'LOG - User created!' });
				});
        		console.log ("ELSE ACTION -> user created");
    		}
		});
	})

	// get all the bears (accessed at GET http://localhost:8080/api/bears)
	.get(function(req, res) {
		User.find(function(err, users) {
			if (err)
				res.send(err);

			res.json(users);
		});
	});

// on routes that end in /bears/:bear_id
// ----------------------------------------------------
router.route('/bears/:bear_id')

	// get the bear with that id
	.get(function(req, res) {
		Bear.findById(req.params.bear_id, function(err, bear) {
			if (err)
				res.send(err);
			res.json(bear);
		});
	})

	// update the bear with this id
	.put(function(req, res) {
		Bear.findById(req.params.bear_id, function(err, bear) {

			if (err)
				res.send(err);

			bear.name = req.body.name;
			bear.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'Bear updated!' });
			});

		});
	})

	// delete the bear with this id
	.delete(function(req, res) {
		Bear.remove({
			_id: req.params.bear_id
		}, function(err, bear) {
			if (err)
				res.send(err);

			res.json({ message: 'Successfully deleted' });
		});
	});


// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Rest Service on localhost:' + port);
