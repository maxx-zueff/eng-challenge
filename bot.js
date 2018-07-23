// --------------------------------------------------------
// Dependencies

const twit = require('twit');
const config = require('./config/engchallenge1.js');
const T = new twit(config);
const fs = require('fs');
const util = require('util');

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

let hash_tags = ['#adulted', '#eal', '#ellchat', '#ESL',
	'#grammar', '#twinglish', '#englishdiary',
	'#100DaysOfEnglish']; 

let stream = T.stream('statuses/filter',
	{ track: hash_tags });
 
stream.on('tweet', function (tweet) {
	T.post('favorites/create', { id: tweet.id_str }, function (err, data, response) {
		if (err) console.log(err);
		else console.log('LIKE!');
	});
});