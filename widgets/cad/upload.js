var fs = require('fs');
var fetch = require('node-fetch'); // requires node-fetch as dependency

// adapted from: https://gist.github.com/yuhgto/edb5d96e088599c2a6ea44860df9117b

// set filename
var upfile = 'public/test.stl';

// set auth token and query
var API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjkyMTE0ODcyLCJ1aWQiOjE0ODgwMzE5LCJpYWQiOiIyMDIwLTExLTI3VDIwOjI4OjM2LjAwMFoiLCJwZXIiOiJtZTp3cml0ZSJ9.Ah-Kos4wR6L3-KCvmd4Y6ZIL3AuPfhqrgcWnuG3b3eg"
var query = 'mutation ($file: File!) { add_file_to_column (file: $file, item_id: 881017097, column_id: "files") { id } }';

// set URL and boundary
var url = "https://api.monday.com/v2/file";
var boundary = "xxxxxxxxxx";
var data = "";

fs.readFile(upfile, function(err, content){

    // simple catch error
    if(err){
        console.error(err);
    }

    // construct query part
    data += "--" + boundary + "\r\n";
    data += "Content-Disposition: form-data; name=\"query\"; \r\n";
    data += "Content-Type:application/json\r\n\r\n";
    data += "\r\n" + query + "\r\n";

    // construct file part
    data += "--" + boundary + "\r\n";
    data += "Content-Disposition: form-data; name=\"variables[file]\"; filename=\"" + upfile + "\"\r\n";
    data += "Content-Type:application/octet-stream\r\n\r\n";
    var payload = Buffer.concat([
            Buffer.from(data, "utf8"),
            new Buffer.from(content, 'binary'),
            Buffer.from("\r\n--" + boundary + "--\r\n", "utf8"),
    ]);

    // construct request options
    var options = {
        method: 'post',
        headers: {
          "Content-Type": "multipart/form-data; boundary=" + boundary,
          "Authorization" : API_KEY
        },
        body: payload,
    };

    // make request
    fetch(url, options)
      .then(res => res.json())
      .then(json => console.log(json));
});
