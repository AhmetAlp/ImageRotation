const {ImageData} = require('canvas'); //Only to use ImageData structure

class Rotator {
	//No need to any class fields
	constructor(maxWidth,maxHeight) {
		this.maxWidth = maxWidth;
		this.maxHeight = maxHeight;
	}
	rotate(imagex,angleDec) {
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

		const data = imagex.data;
		const angle = angleDec * Math.PI / 180;
		
		const width = imagex.width;
		const height = imagex.height;
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
			newWidth=height;
			newHeight=width;
		}else if (angleDec%180<90) {
			const dAngle = angleDec%180 * Math.PI / 180;
			newWidth = Math.ceil(width * Math.cos(dAngle) + height * Math.sin(dAngle))+4;
			newHeight = Math.ceil(width * Math.sin(dAngle) + height * Math.cos(dAngle))+4;
		} else if (angleDec%180>90) {
			const rAngle=(angleDec%180-90) * Math.PI / 180;
			newWidth = Math.ceil(height * Math.cos(rAngle) + width * Math.sin(rAngle))+4;
			newHeight = Math.ceil(height * Math.sin(rAngle) + width * Math.cos(rAngle))+4;
		}
		if (newWidth>this.maxWidth && newHeight>this.maxHeight) {
			newWidth = this.maxHeight;
			newHeight = this.maxHeight;
		}
		if (angleDec%180!==0) {
			cData = new Uint8ClampedArray(newWidth*newHeight*4);
		}		
		let nx, ny; //new x and y
		let x = 0;
		let y = 0; //If you want image canvas different location change x and y
		const cx = width / 2; //Original image center
		const cy = height / 2;
		const ncx = newWidth / 2; //New image center may be changed according to new image size
		const ncy = newHeight / 2;
		let xx, yy;
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
			cData[pData] = data[iData]; //Red
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
		imagex= new ImageData(cData,newWidth, newHeight);
		return imagex;
	}
}

module.exports = Rotator;