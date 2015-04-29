/*iio.Test = {
	constructor: function( canvas, test_class, custom_properties, color ){
		iio.start([ function( app, settings ){
			app.add(new test_class({
				pos: app.center,
				color: _color[settings.c].clone()
			}, custom_properties ));
		}, { c: color || iio.Color.random() } ], canvas )
	}
}*/

iio_Test = {};
var iioapps = document.getElementById('iioapps');

var _color;
function assign_Test_globals(){
	_color = [];
	_color[1] = new iio.Color(0,186,255);
	_color[0] = new iio.Color(101,176,66);
}

function create_test_canvas_grid( SIZE, COLS, ROWS ){
	var canvas, clear;
	for(var R=0; R<ROWS; R++){
		for(var C=0; C<COLS; C++){
			canvas = document.createElement('canvas');
			canvas.id = "c"+R+""+C;
			canvas.width = SIZE;
			canvas.height = SIZE;
			iioapps.appendChild(canvas);
		}
		clear = document.createElement('div');
		clear.className = "clear";
		iioapps.appendChild(clear);
	}
}

function Test_color(){
	switch(this.cycle){
		case 1: 
			if(this.color.g>100)
				this.color.g--;
			else if(this.color.r>100)
				this.color.r--;
			else this.cycle = iio.randomInt(1,3);
			break;
		case 2: 
			if(this.color.b<200)
				this.color.b++;
			else if(this.color.r<200)
				this.color.r++;
			else this.cycle = iio.randomInt(1,3);
			break;
		case 3: 
			if(this.color.g>0)
				this.color.g--;
			else if(this.color.r>0)
				this.color.r--;
			else this.cycle = iio.randomInt(1,3);
			break;
		default: 
			if(this.color.r<255)
				this.color.r++;
			else if(this.color.b<255)
				this.color.b++;
			else this.cycle = iio.randomInt(1,3);
	}
}
function Test_alpha(){
	if(this.fading){
		this.alpha -= this.speed;
		if(this.alpha <= .02)
			this.fading = false;
	} else {
		this.alpha += this.speed;
		if(this.alpha >= .98)
			this.fading = true;
	}
}
function Test_width(){
	if(this.growing){
		this.width++;
		if(this.width > _height)
			this.growing = false;
	} else {
		this.width--;
		if(this.width < 2)
			this.growing = true;
	}
}
function Test_outline(){
	if(this.growing){
		this.lineWidth++;
		if(this.lineWidth > 20)
			this.growing = false;
	} else {
		this.lineWidth--;
		if(this.lineWidth < 1)
			this.growing = true;
	}
	switch(this.cycle){
		case 1: 
			if(this.outline.g>100)
				this.outline.g--;
			else if(this.outline.r>100)
				this.outline.r--;
			else this.cycle = iio.randomInt(1,3);
			break;
		case 2: 
			if(this.outline.b<200)
				this.outline.b++;
			else if(this.outline.r<200)
				this.outline.r++;
			else this.cycle = iio.randomInt(1,3);
			break;
		case 3: 
			if(this.outline.g>0)
				this.outline.g--;
			else if(this.outline.r>0)
				this.outline.r--;
			else this.cycle = iio.randomInt(1,3);
			break;
		default: 
			if(this.outline.r<255)
				this.outline.r++;
			else if(this.outline.b<255)
				this.outline.b++;
			else this.cycle = iio.randomInt(1,3);
	}
}