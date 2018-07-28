// --------------------------------------------------------
// Dependencies

const twit = require('twit');
const fs = require('fs');
const util = require('util');

let config = require('./config/config.js');
let hash_tags = require('./config/tags.js');

// --------------------------------------------------------
// Debug

var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) {
  log_file.write(Date() + '\n' + util.format(d) + '\n');
  log_stdout.write(Date() + '\n' + util.format(d) + '\n');
};

// --------------------------------------------------------
// Stream


let active = function (id, reset) {


	var diff = reset - Date.now();

	setTimeout(function(id){
		
		for (let el of config) {
			if (el.id == id) el.active = true;
		}

	}, diff);

};

let start = function (reset) {


	for (let el of config) {

		if(el.selected == true) {
			el.selected = false;
			el.active = false;
			active(el.id, reset);
		}

		if (el.active == true) {
			el.selected = true;
			bot(new twit(el.data));
			return true;
		}
	}


};

let bot = function(T) {

	let stream = T.stream('statuses/filter',
		{ track: hash_tags });
	 
	stream.on('tweet', function (tweet) {

		T.post('favorites/create', { id: tweet.id_str }, function (err, data, response) {
			console.log(data.text);
			if (err) console.log(err);
			if (response.statusCode == 429) {
				
				console.log("CODE 429");
				stream.stop();
				T.get('application/rate_limit_status', {resources:'favorites'}, function (err, data, response){

					let limit = data.resources.favorites['/favorites/list'];
					let reset = limit.reset;
					
					start(reset); // 429 -- rate limit
				});
			}
		});
	});

	stream.on('error', function(err) {
		console.log(err);
	});

};

start();
