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
var Message     = require('./app/models/message');
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
		var now = new Date();
		var jsonDate = now.toJSON();
		
		console.log ('POST user entry : ');
		var user = new User();		// create a new instance of the User model

		//one object for assign vars to bdd
		var objectFB = req.body.objectFB;
		console.log ("objectFB");
		console.log (objectFB);
		var server_token = assignSecurityVariable(req.body.server_token);

		user.id_fb = objectFB.id;  // set the bears name (comes from the request)
		user.name = objectFB.name;
		user.bio = objectFB.bio;
		user.email = objectFB.email;
		user.first_name = objectFB.first_name;
		user.link = objectFB.link;
		user.locale = objectFB.locale;
		user.timezone = objectFB.timezone;
		user.updated_time = objectFB.updated_time;
		user.verified = objectFB.verified;
		// generate private && unique token // todo: replace with ssh
		var hat = require('hat');
		user.server_token = hat();
		console.log ('coucou');
		// CHECK if user fb ever exist
		User.findOne({id_fb: user.id_fb}, function(err, result) {
			if (err){
				console.log ("error");
			}if (result) {
				// UTILISATEUR EXISTANT VERIF UPDATE
        		console.log ("User ever Exist, test to update");
        		//console.log (server_token);
				/////////
				if (server_token){
					// update utilisateur
					User.update(
						{server_token: server_token},// id reference
			   			{
							id_fb: objectFB.id,
							name: objectFB.name,
							bio: objectFB.bio,
							email: objectFB.email,
							first_name: objectFB.first_name,
							link: objectFB.link,
							locale: objectFB.locale,
							timezone: objectFB.timezone,
							updated_time: objectFB.updated_time,
							verified: objectFB.verified,
							updated_time: jsonDate
			   			} // update field
						, function(err, result) {
						if (err){
							console.log ("error update profil user !");
						}if (result) {
			        		console.log ("User ever Exist, update profil success");
							res.json({
								message: 'Profil update success.',
								server_token: server_token
							});
			    		}
					});
	    		} else {
	    			console.log ("first conection OR: error server token SUPPRIMER LA REPONSE POUR LA SECURITE");
	    			res.json({
						message: 'LOG - User Exist- Error token !',
						server_token: result.server_token
					});
	    		}
	    		////////
				/*res.json({
					message: 'LOG - User ever Exist !',
					server_token: result.server_token
				});*/
    		} else {
    			// ajout utilisateur ok
    			user.save(function(err) {
					if (err){
						res.send(err);
					}
					res.json({
						message: 'LOG - User created!',
						server_token:user.server_token
					});
				});
        		//console.log ("ELSE ACTION -> user created");
    		}
		});
	})
	// get all the users (accessed at GET http://localhost:8080/api/bears)
	.get(function(req, res) {
		User.find(function(err, users) {
			if (err)
				res.send(err);

			res.json(users);
		});
	});
router.route('/user/geolocation') // UPDATE USER //
	// create a user
	.post(function(req, res) {
		console.log ('POST /user/geolocation entry : ');
		//var user = new User();		// create a new instance of the User model
		//one object for assign vars to bdd
		var geolocation = req.body.geolocation;
		var server_token = req.body.server_token;
		//console.log (req.body.geolocation);
		// info user in conect for app
		//user.geolocation = geolocation;
		// CHECK if user ever exist
		User.update(
			{server_token: server_token},// id reference
   			{geolocation: geolocation} // update field
			, function(err, result) {
			if (err){
				console.log ("error update geoposition !");
			}if (result) {
        		console.log ("User ever Exist, update geoposition success");
				res.json({
					message: 'Geo position update success.'
					//server_token: result.server_token
				});
    		}
		});
	})
	// get all the users (accessed at GET http://localhost:8080/api/bears)
	.get(function(req, res) {
		User.find(function(err, users) {
			if (err)
				res.send(err);

			res.json(users);
		});
	});
router.route('/proximity') // PROXIMITY //
	// get all the users (accessed at GET http://localhost:8080/api/bears)
	.post(function(req, res) {
		// update last date user search..

		var geolocation = req.body.geolocation;
		var server_token = req.body.server_token;
		if (server_token==='undefined'){
			console.log ("alert token");
		}
		// check token && search profiles
		console.log(server_token);
		// CHECK if user ever exist
		User.findOne({server_token: server_token}, function(err, result) {
			if (err){
				console.log ("error");
			}if (result) {
				//console.log (result);
        		console.log ("User ever Exist, ok for search proximity");
				User.find(function(err, users) {
					if (err)
						res.send(err);
					// return all users
					res.json(users);
				});
    		} else {
    			
    			res.json({
					message: 'LOG - User not Exist permission denied !',
					server_token: server_token
				});
    		}
		});
	});

// on routes that end in /bears/:bear_id
// ----------------------------------------------------
router.route('/user/:user_id')
	// get the bear with that id
	.get(function(req, res) {
		User.findById(req.params.bear_id, function(err, user) {
			if (err)
				res.send(err);
			res.json(user);
		});
	})
	// update the bear with this id
	.put(function(req, res) {
		User.findById(req.params.bear_id, function(err, user) {

			if (err)
				res.send(err);

			user.name = req.body.name;
			user.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'User updated!' });
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
console.log('    Rest Service on localhost:' + port);

/* FOR SERVER CHECK IF VAR IS GOOD && RETURN IT */
function assignSecurityVariable(entry){
	if (entry === 'undefined'){
		console.log ('ERROR: assignSecurityVariable -> undefined');
		return false
	} else if (entry == null){
		console.log ('ERROR: assignSecurityVariable -> null');
		return false;
	} else {
		return entry;
	}
}