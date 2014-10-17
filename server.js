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
	// create user or update key conect user
	.post(function(req, res) {
		var now = new Date();
		var jsonDate = now.toJSON();
		var user = new User();		// create a new instance of the User model
		
		console.log ('POST user entry : ');

		//one object for assign vars to bdd
		var objectFB = req.body.objectFB;
		console.log ("objectFB");
		console.log (objectFB);
		var server_token = assignSecurityVariable(req.body.server_token);
		var settings = assignSecurityVariable(req.body.settings);
		console.log (server_token);
		// asign user variables
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
		user.settings = settings;
		
		// generate private && unique token // todo: replace with ssh
		var hat = require('hat');
		user.server_token = hat();

		// CHECK if user fb ever exist
		User.findOne({id_fb: user.id_fb}, function(err, result) {
			if (err){
				console.log ("error fin user from /user");
			}if (result) {
				// UTILISATEUR EXISTANT VERIF UPDATE
        		console.log ("User ever Exist, test to update");
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
							updated_time: jsonDate,
							settings:settings
			   			} // update field
						, function(err, result_upd) {
						if (err){
							console.log ("error update profil user !");
							res.json({
								message: 'LOG - UPDATE ERROR:Exist -> error update profil user !',
								server_token: result.server_token
							});
						}if (result_upd) {
			        		console.log ("User ever Exist, update profil success");
							res.json({
								message: 'LOG - User Exist -> UPDATED !',
								server_token: result.server_token
							});
			    		}
					});
    		} else {
    			// ajout new utilisateur ok
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
router.route('/user/settings') // SETTINGS //
	// get all the users (accessed at GET http://localhost:8080/api/bears)
	.post(function(req, res) {
		//console.log (req);
		// update last date user search..
		var settings = req.body.settings;
		var server_token = req.body.server_token;

		// check token && search profiles
		console.log(server_token);
		// CHECK if user ever exist
		User.findOne({server_token: server_token}, function(err, result) {
			if (err){
				console.log ("error");
			}if (result) {
				//console.log (result);
        		console.log ("User ever Exist, ok for update settings");
				User.update(
						{server_token: server_token},// id reference
			   			{
							settings:settings
			   			} // update field
						, function(err, result_upd) {
						if (err){
							console.log ("error update settings user !");
							res.json({
								message: 'LOG - UPDATE ERROR:Exist -> error update settings user !',
								server_token: result.server_token
							});
						}if (result_upd) {
			        		console.log ("User ever Exist, update settings success");
							res.json({
								message: 'LOG - User Exist -> settings UPDATED !',
								server_token: result.server_token
							});
			    		}
					});
    		} else {
    			
    			res.json({
					message: 'LOG - User not Exist permission denied !',
					server_token: server_token
				});
    		}
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
router.route('/user/:id_fb/:server_token')
	// get the bear with that id
	.get(function(req, res) {
		// CHECK if user ever exist
		User.findOne({server_token: req.params.server_token}, function(err, result) {
			if (err){
				console.log ("error");
			}if (result) {
				//console.log (result);
        		console.log ("User Exist, ok for get details");
				User.findOne({id_fb: req.params.id_fb}, function(err, result) {
					if (err){
						console.log ("error");
					}if (result) {
						//console.log (result);
		        		console.log ("User Exist - details");
						res.json({
							message: 'LOG - User Exist - details !',
							result: result
						});
		    		} else {
		    			res.json({
							message: 'LOG - User token not Exist permission denied !',
						});
		    		}
				});
    		} else {
    			res.json({
					message: 'LOG - User token not Exist permission denied !',
				});
    		}
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
router.route('/messages') // PROXIMITY //
	// get all the users (accessed at GET http://localhost:8080/api/bears)
	.post(function(req, res) {
		var server_token = req.body.server_token;
		var id_receiver = req.body.id_receiver;
		var text_message = req.body.message;

		// CHECK if user ever exist
		User.findOne({server_token: server_token}, function(err, result) {
			if (err){
				console.log ("error");
			}if (result) {
        		console.log ("User ever Exist, ok for set message");
				
				// save message
				var now = new Date();
				var jsonDate = now.toJSON();
				var message = new Message();		// create a new instance of the User model

				// asign message variables
				message.id_fb_send = result.id_fb;  // set the bears name (comes from the request)
				message.id_fb_rec = id_receiver;
				message.mess = text_message;
				message.datetime = jsonDate;
				// check message
				if (assignSecurityVariable(text_message)){
					message.save(function(err) {
						if (err){
							console.log ("error message");
							res.send(err);
						}
						res.json({
							message: 'LOG - Message created!'
							//server_token:user.server_token
						});
					});
				} else {
					res.json({
							message: 'LOG - Message not create: message empty !'
							//server_token:user.server_token
						});
				}
    		} else {
    			res.json({
					message: 'LOG - User not Exist permission denied !',
					server_token: server_token
				});
    		}
		});
});
/* MESSAGES from server_token */
router.route('/messages/:server_token')
	.get(function(req, res) {
		// CHECK if user ever exist with token
		User.findOne({server_token: req.params.server_token}, function(err, result) {
			if (err){
				console.log ("error");
			}if (result) {

//////// HEREEEEEEEE ///
				// agregate
				/*
				Message.aggregate(
					{ $group: 
						{ id_fb_rec: '$result.id_fb' } 
					},
					function (err, res) {
						if (err) return handleError(err);
						console.log(res);
					}
				);
				*/
				// generate aggregate for filter search on mongo
				/*var rules = [ {'id_fb_rec': result.id_fb} ];
				 
			    // and here are the grouping request:
			    Message.aggregate([
			        { $match: {$and: rules } },
			        { $project: {
			                id_fb_rec: result.id_fb // and let's turn the nested field into usual field (usual renaming)
			            }
			        },
			        { $group: {
			                id_fb_rec: result.id_fb, // grouping key
			            }
			        }
			    ], {});*/



				//console.log (result);
        		console.log ("User Exist, ok for get all messages");
				Message
				.find({ // get all messages interraction
					id_fb_rec: { $in: [result.id_fb] },
					id_fb_send: { $in: [result.id_fb] }
				}, function(err, result) {
					if (err){
						console.log ("error");
						console.log (err);
					}if (result) {
						//console.log (result);
		        		console.log ("User Exist - all messages");
						res.json({
							message: 'LOG - User Exist - all messages download !',
							result: result
						});
		    		} else {
		    			res.json({
							message: 'LOG - aucun all message present !',
							result: null
						});
		    		}
				})
				.sort({ datetime: 1 }, function(err, result) {
					if (result)
						console.log ("sorted");
					if (err)
						console.log ('error sorted');
				});
    		} else {
    			res.json({
					message: 'LOG - User token not Exist permission denied !'
				});
    		}
		});
});
/* MESSAGES from server_token send to id_fb */
router.route('/messages/:server_token/:id_fb')
	// get the bear with that id
	.get(function(req, res) {
		// CHECK if user ever exist with token
		User.findOne({server_token: req.params.server_token}, function(err, result) {
			if (err){
				console.log ("error");
			}if (result) {
				//console.log (result);
        		console.log ("User Exist, ok for get messages");
				Message.find({ // si receive or send present in message
					id_fb_rec: { $in: [req.params.id_fb, result.id_fb] },
					id_fb_send: { $in: [req.params.id_fb, result.id_fb] }
				}, function(err, result) {
					if (err){
						console.log ("error");
					}if (result) {
						//console.log (result);
		        		console.log ("User Exist - messages");
						res.json({
							message: 'LOG - User Exist - messages download !',
							result: result
						});
		    		} else {
		    			res.json({
							message: 'LOG - aucun message present !',
							result: null
						});
		    		}
				}).sort({ datetime: 1 }, function(err, result) {
					console.log ("sorted");
				});
    		} else {
    			res.json({
					message: 'LOG - User token not Exist permission denied !'
				});
    		}
		});
});
/* REGISTER OURS ROUTES FROM SERVER JS*/
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