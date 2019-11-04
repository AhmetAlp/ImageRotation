const express = require('express')
const path = require('path');
const bodyParser = require('body-parser');
const formidable = require('formidable');
const fs = require('fs');
//const compression = require('compression');
const zlib = require('zlib')
const {ImageData} = require('canvas'); //Only to use ImageData structure
const rotator = require('./Rotator');

const app = express();
const router = express.Router();

const byteLimit=1024*1024*1024*30;
const angle45 = 45 * Math.PI / 180;
var maxWidth = 0;
var maxHeight = 0;

app.use(bodyParser.json({limit: byteLimit, extended:true, type:'application/json'}));
app.use(bodyParser.urlencoded({limit:byteLimit, extended:true, type:'application/x-www-form-urlencoded'}));

router.get('/',function(req,res){
  //__dirname : It will resolve to your project folder.
  res.sendFile(path.join(__dirname+'/RotateImage.html'));
});

router.get('/local',function(req,res){
  //__dirname : It will resolve to your project folder.
  res.sendFile(path.join(__dirname+'/RotateImageLocal.html'));
});

router.post('/rotate',function(req,res){
	let width = req.body.width;
	let height = req.body.height;
	let angleDec = req.body.angle;
	let imageData = new Uint8ClampedArray(width*height*4);
	
	//Copy imageData from request body
	for (let i = 0; i < imageData.length; i++) {
	  imageData[i] = req.body.imagedata[i];
	}
	
	let imagex = new ImageData(imageData,width,height);
	if (maxWidth===0) {
		maxWidth = Math.ceil(imagex.width * Math.cos(angle45) + imagex.height * Math.sin(angle45))+4;
	}
	if (maxHeight===0) {
		maxHeight = Math.ceil(imagex.width * Math.sin(angle45) + imagex.height * Math.cos(angle45))+4;
	}
	const rotator1=new rotator(maxWidth,maxHeight);
	let startTime = new Date();
	imageData = rotator1.rotate(imagex,angleDec);
	let endTime = new Date();
	console.log("Process time="+ (endTime - startTime) +" ms");

	res.send(imageData);
});

router.post('/fileupload',async function(req,res,next){
    var form = new formidable.IncomingForm();
	var htmlText = '';
    var formFields = await new Promise(function (resolve, reject) {
		form.parse(req, function (err, fields, files) {
		  var oldpath = files.filetoupload.path;
		  htmlText = files.filetoupload.name;
		  var newpath = __dirname + "/images/" + files.filetoupload.name;
		  fs.rename(oldpath, newpath, function (err) {
			if (err) {
				console.log(err);
			};
		  });
		  resolve(fields);
		});
	});
	//__dirname : It will resolve to your project folder.
	let data = fs.readFileSync(path.join(__dirname+'/RotateImage.html'));
	htmlText = data.toString().replace("img\.src='';","img.src='" + htmlText + "';");
	res.send(htmlText);  
});

router.post('/fileuploadlocal',async function(req,res,next){
	/*
	* Without node.js server rotate. Only html inline rotate function version
	*/
    var form = new formidable.IncomingForm();
	var htmlText = '';
    var formFields = await new Promise(function (resolve, reject) {
		form.parse(req, function (err, fields, files) {
		  var oldpath = files.filetoupload.path;
		  htmlText = files.filetoupload.name;
		  var newpath = __dirname + "/images/" + files.filetoupload.name;
		  fs.rename(oldpath, newpath, function (err) {
			if (err) {
				console.log(err);
			};
		  });
		  resolve(fields);
		});
	});
	//__dirname : It will resolve to your project folder.
	let data = fs.readFileSync(path.join(__dirname+'/RotateImageLocal.html'));
	htmlText = data.toString().replace("img\.src='accenture.jpg';","img.src='" + htmlText + "';");
	res.send(htmlText);  
});

//add the router
app.use('/', router);
app.use(express.static(__dirname + '/images'));
app.listen(process.env.port || 3000);

console.log('Running at Port 3000');