/*
* Simple voting app
*/

const http = require('http');
var fs = require('fs');
const crypto = require('crypto');
var qs = require('querystring');

// Change to what is preferred. Im just running locally!
const hostname = '0.0.0.0';
const port = 8080;

function not_found(res) {
	res.statusCode = 404;
    res.end();
}

function ok(res) {
	res.statusCode = 200;
	res.end();
}

function send_json(response, object) {
  response.writeHead(200, {"Content-Type": "application/json"});
  var json = JSON.stringify(object);
  response.end(json);
}

function timestamp_log(log) {
	console.log("[" + (new Date()).toISOString() + "] " + log);
}

function streamFile(req, res, filePath) {
  const path = filePath;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize-1;
    const chunksize = (end-start)+1;
    const file = fs.createReadStream(path, {start, end});
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
}

function output_file(req, res, url) {
	try {

		var stats = fs.lstatSync(url);

		if ( stats.isFile() ) {

			var html = fs.readFileSync(url);

			if ( url.endsWith(".mp4") || 
			     url.endsWith(".mov") ) {
				// Handle streamed content
				timestamp_log("Stream call..");
				streamFile(req, res, url);
			} else {
				// mime type handling
				var datatype = "text/plain";

				if ( url.endsWith(".csv") ) {
					datatype = "text/csv";
				} else if ( url.endsWith(".mp3") ) {
					datatype = "audio/mpeg";
				} else if ( url.endsWith(".jpg") ) {
					datatype = "image/jpeg";
				} else if ( url.endsWith(".ico")) {
					datatype = "image/png";
				}

				res.writeHead(200, {'Content-Type': datatype});
				res.end(html);

			}


			return true;

		}

	} catch (e) {};

	return false;
}

const server = http.createServer((req, res) => {

	if ( req.url == "/" ) {

		var html = fs.readFileSync('index.html');
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);

	} else {
		
		var i = 1;

		while ( req.url[i] == "/" )
			i++;

		var url = req.url.replace(/\/+/g,'/').substr(1);

		var ip = req.headers['x-forwarded-for'] || 
			req.connection.remoteAddress || 
			req.socket.remoteAddress ||
			(req.connection.socket ? req.connection.socket.remoteAddress : null);

		var filereq = output_file(req, res,url);

		if ( ! filereq ) {
			var failed = 1;

			if ( req.method == 'HEAD') {
				output_file(req, res,"favicon.ico");
				failed = 0;
			}


			res.writeHead(302, {
				'Location': '/'
			});
			res.end();

		} else {
			timestamp_log( ip + ": " + req.url);
		}

	}

});

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});
