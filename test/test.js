var assert = require('assert');
const jsdom = require('jsdom');
const path = require('path');
const fs = require('fs');
const { JSDOM } = jsdom;
const {ImageData,Image} = require('canvas'); //Only to use ImageData structure
const { PerformanceObserver, performance } = require('perf_hooks');
const rotator = require('../Rotator');

const angle45 = 45 * Math.PI / 180;

describe('Basic Mocha String Test', function () {
 it('should return width=10 height=5', function () {		
		const width = 10;
		const height = 5;

		let imageData = new Uint8ClampedArray(width*height*4);
		let imagex = new ImageData(imageData,width,height);
		
		const rotator1=new rotator(width,height);

		imageData = rotator1.rotate(imagex,0);
		assert.equal(imageData.width,10);
		assert.equal(imageData.height,5);
	});
 it('should return in 1 s', function () {
		const width = 720;
		const height = 1280;

		let imageData = new Uint8ClampedArray(width*height*4);
		let imagex = new ImageData(imageData,width,height);
		
		const rotator1=new rotator(width,height);

		let startTime = performance.now();
		imageData = rotator1.rotate(imagex,90);
		let endTime = performance.now();

		assert.equal(imageData.width,height);
		assert.equal(imageData.height,width);
		assert(endTime-startTime<1000); 
    });
 it('should return in 1s(local)', function() {
		const options = {
			resources: 'usable',
			runScripts: 'dangerously',
		};
		//const localjs = fs.readFileSync('test/localhtml.js', { encoding: 'utf-8' });		
		JSDOM.fromFile(path.join(__dirname+'/../RotateImageLocalTest.html'),options).then(dom => {
			let angleField = dom.window.document.getElementById('angle');
			let rotateField = dom.window.document.getElementById('rotateSubmit');
			angleField.value = 90;
			//console.log('Before run');
 		    setTimeout(() => {
				let startTime = performance.now();
				var elementjs = dom.window.document.getElementsByTagName("script")[0];
				//console.log(elementjs);
				elementjs.parentNode.removeChild(elementjs);
				/*
				console.log(dom.window.document.getElementsByTagName("script")[0]);
				const scriptEl = dom.window.document.createElement("script");
				scriptEl.textContent = localjs;
				dom.window.document.head.appendChild(scriptEl);
				*/
				//dom.window.rotateImg();
				let endTime = performance.now();
				assert(endTime-startTime<1000); 			
			}, 1000);
			
		});
	});
});