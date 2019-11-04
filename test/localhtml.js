const {ImageData,Image} = require('canvas'); //Only to use ImageData structure

			var img = new Image();
			var maxWidth;
			var maxHeight;
			var orjImageData;
			var totalAngle=0;

			const loadImg = () => {
				/*
				* On HTML body load, Load a default image to canvas
				*/
				img.src='accenture.jpg'; //default Local image file
				totalAngle = 0;
				var canvas = document.getElementById('canvasa');
				var ctx = canvas.getContext('2d');
//				img.crossOrigin = "Anonymous";
				img.onload = function() {
				  if (img.src!=='') {
				  	const angle45 = 45 * Math.PI / 180;
					maxWidth = Math.ceil(img.width * Math.cos(angle45) + img.height * Math.sin(angle45))+4;
					maxHeight = Math.ceil(img.width * Math.sin(angle45) + img.height * Math.cos(angle45))+4;
					canvas.width = img.width;
					canvas.height = img.height;
				  }
 				  ctx.drawImage(img, 0, 0);
				  orjImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
				  img.style.display = 'none';
				};
				document.getElementById("rotateForm").onsubmit = function(e) {
					e.preventDefault();
				}
			}
			
			function rotateImg(angleDec) {
				/*
				* Rotate the image according to angle inbox degree
				*/
				let angleDecField = document.getElementById('angle');
				angleDecField.value = angleDec;
				let canvas = document.getElementById('canvasa');
				console.log(canvas.width);
				let ctx = canvas.getContext('2d');
				let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

				totalAngle = (totalAngle + parseInt(angleDecField.value))%360;
				imgData = rotate(orjImageData,totalAngle);
				
				canvas.width = imgData.width;
				canvas.height = imgData.height;
				ctx.putImageData(imgData, 0, 0);
				console.log(canvas.width);
			}
			
			const rotate = (image,angleDec) => {
				/*
				* Rotate ImageData with Angle. Clockwise rotation about the centre of the image
				* Parameters: image:ImageData, angle: double in degree
				* Returns new ImageData
				* Time complexity = O(w*h)
				* Space compexity = O(w*h).
				* canvas API or any native lib isn't used for rotate
				* Space complexity could be O(1) if the rotation on same ImageData.data and with tmp var, 4 time rotation. 
				* But calculation for different degrees is a risk
				*/
				const startTime = performance.now();
				const data = image.data;
				const angle = angleDec * Math.PI / 180;				
				const width = image.width;
				const height = image.height;
				let cData;
				let newWidth = width;
				let newHeight = height;
				/*
				* Calculate the Size of a Rotated Image
				* For 180 and 360 degrees, size is same
				* For 90 and 270 degrees, width and height are reversed
				* For acute degrees, Use new-width=w x cos@ + h x sin@, new-height=w x sin@ + h x cos@
				* For obtuse degrees, Use new-width=h x cos@ + w x sin@, new-height=h x sin@ + w x cos@
				* Reference: https://iiif.io/api/annex/notes/rotation/
				*/
				if (angleDec%180===0) {
					cData = new Uint8ClampedArray(width*height*4);
				}else if (angleDec%90===0) {
					newWidth = height;
					newHeight = width;
				}else if (angleDec%180<90) {
					const dAngle = angleDec%180 * Math.PI / 180;
					newWidth = Math.ceil(width * Math.cos(dAngle) + height * Math.sin(dAngle))+4;
					newHeight = Math.ceil(width * Math.sin(dAngle) + height * Math.cos(dAngle))+4;
				} else if (angleDec%180>90) {
					const rAngle = (angleDec%180-90) * Math.PI / 180;
					newWidth = Math.ceil(height * Math.cos(rAngle) + width * Math.sin(rAngle))+4;
					newHeight = Math.ceil(height * Math.sin(rAngle) + width * Math.cos(rAngle))+4;
				}

				if (newWidth>maxWidth && newHeight>maxHeight) {
					newWidth = maxHeight;
					newHeight = maxHeight;
				}
				if (angleDec%180!==0) {
					cData = new Uint8ClampedArray(newWidth*newHeight*4);
				}
				let nx, ny;
				let x = 0;
				let y = 0; //if you want image canvas different location change x and y
				const cx = width / 2; //Original image center
				const cy = height / 2;
				const ncx = newWidth / 2; //New center may be changed according to new image size
				const ncy = newHeight / 2; 
				let xx, yy; //To be used for x and y difference
				let iData, pData;
				
				/*
				* Fill destination image data with geometry rotation formula. nx and ny
				* Reference: https://medium.com/possible-cee/geometry-done-right-with-js-16706b33e88
				*/
				for (var w = 0; w < width; w++)	{
				  for (var h = 0; h < height; h++) {
					xx = x + w - cx;
					yy = y + h - cy;
					nx = Math.round(xx * Math.cos(angle) - yy * Math.sin(angle) + ncx);
					ny = Math.round(xx * Math.sin(angle) + yy * Math.cos(angle) + ncy);
					
					if (ny>0 && angleDec==180) { //correction y calculation for 180 degree. == operator is used on purpose
						ny -=1;
					}
					
					if (nx>0 && angleDec%360!==0) { //correction x calculation because of 0 index start
						nx -=1;
					}
					
					iData = (h * width + w) * 4; //Calculate original position for one dimensional ImageData.data array 
					pData = (nx + (ny * newWidth)) * 4; //Calculate destination position for one dimensional ImageData.data array
					cData[pData] = data[iData]; // Red 
					cData[pData+1] = data[iData+1]; //Green 
					cData[pData+2] = data[iData+2]; //Blue 
					cData[pData+3] = data[iData+3]; //Alpha
					//Because some js formula calculations, rounds are wrong. There may be a few blank points in picture.
					//To fix it. If previous destination point is blank, write adjacent filled point data 
					if(cData[pData-1]===0) {
						cData[pData-4] = data[iData];
						cData[pData-3] = data[iData+1];
						cData[pData-2] = data[iData+2];
						cData[pData-1] = data[iData+3];						
					}
				  }
				}
				
				//Write destination temporary array to original ImageData
				image =  new ImageData(newWidth, newHeight);
				for (let i = 0; i < image.data.length; i += 4) {
				  image.data[i] = cData[i];
				  image.data[i + 1] = cData[i+1]; 
				  image.data[i + 2] = cData[i+2];
				  image.data[i + 3] = cData[i+3];
				}
				let endTime = performance.now();
				console.log("Process time="+ (endTime - startTime) +" ms");
				return image;
			}