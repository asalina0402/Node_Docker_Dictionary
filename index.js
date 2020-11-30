const fs = require('fs');
const http = require('http');
const https = require('https');
const url = require('url');
const PORT = process.env.PORT || 8080

let dictionary = null;

const DownloadDictionaryFile = (url, file, callback) => {
	
	let stream = fs.createWriteStream(file)

	let req = https.get(url, function(res) {
		res.pipe(stream)
		
		stream.on('finish', function() {
			stream.close(callback)
		})
	}).on('error', function(err) {
		fs.unlink(file)
		
		if(callback){
			callback(err.message)
		}
	})

}

const LoadDictionary = (file, callback) => {
	fs.readFile(file, (err, data) => {
		if (err) {
			console.log(err);
			callback(err);
			return;
		}
		dictionary = JSON.parse(data);
		console.log('dictionary loaded.');
		callback();
	})
};

DownloadDictionaryFile('https://raw.githubusercontent.com/asalina0402/Node_Docker_Dictionary/main/dictionary.json', 'dictionary.json', (err) => {
	if (err) {
		return console.log(err)
	}
	LoadDictionary('dictionary.json', (err) => {
		if (err) {
			return console.log(err)
		}
	})
})

const server = http.createServer((req, res) => {
	
	let u = url.parse(req.url);

	if (u.pathname === '/') {
		res.setHeader('Content-type', 'application/json')
		return res.end(JSON.stringify({
			Message: 'Hello World',
			Routes: ['/', '/ready', '*'],
		}))
	}

	if (u.pathname === '/ready') {
		if (dictionary) {
			res.writeHead(200)
			return res.end('OK')
		}else{
			res.writeHead(404)
			return res.end('Not Loaded')
		}
	}

	let key = '';
	
	if (u.pathname.length > 0) {
		key = u.pathname.substr(1).toUpperCase(); 
	}
	
	let def = dictionary ? dictionary[key] : null;
	
	if (!def) {
		res.writeHead(404);
		return res.end(key + ' was not found');
	}
	
	res.writeHead(200);
	res.end(def);

})

server.listen(PORT, (err) => {  
	if (!err) {
		console.log(`Server is listening at http://127.0.0.1:${PORT}`);
	}else{
		console.log('Error starting server', err);
	}
})
