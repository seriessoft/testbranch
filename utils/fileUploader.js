var express = require('express');
var fileUpload = require('express-fileupload');
var port = process.env.PORT || 3031;
var app = express();
app.use(fileUpload());

app.post('/upload', function(req, res) {
	var sampleFile;

	if (!req.files) {
		res.send('No files were uploaded.');
		return;
	}

	// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
	sampleFile = req.files.sampleFile;

	// Use the mv() method to place the file somewhere on your server
	sampleFile.mv(__dirname+'/public/uploads/filename.jpg', function(err) {
		if (err) {
			res.status(500).send(err);
		}
		else {
			res.send('File uploaded!');
		}
	});
});

app.listen(port,function(){
	console.log('FileUpload Server is running on port : '+port);
});
