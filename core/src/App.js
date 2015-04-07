
//DEFINITION
iio.App =  function() { this.App.apply(this, arguments) }
iio.inherit(iio.App, iio.Obj);
iio.App.prototype._super = iio.Obj.prototype;

//CONSTRUCTOR
iio.App.prototype.App = function(view, app, s) {

  this._super.Obj.call(this,arguments);

  //set app reference for shared functions
  this.app = this;

  //set canvas & context
  this.canvas = view;
  this.ctx = view.getContext('2d');

  //prep canvas
  this.canvas.parent = this;
  iio.canvas.prep_input(this.canvas);

  //get width & height from canvas
  this.width = view.clientWidth || view.width;
  this.height = view.clientHeight || view.height;

  //set center
  this.center = {
    x: this.width / 2,
    y: this.height / 2
  };

  //get DOM offset of canvas
  var offset = view.getBoundingClientRect();

  //set canvas DOM position
  this.pos = {
    x: offset.left,
    y: offset.top
  };

  //create convert function with offset
  this.convertEventPos = function(e) {
    return {
      x: e.clientX - this.pos.x,
      y: e.clientY - this.pos.y
    }
  }

  //initialize app properties
  this.collisions = [];
  this.objs = [];
  this.loops = [];

  //add app to global app array
  iio.apps.push(this);

  //run js script
  this.runScript = new app(this, s);
}

//FUNCTIONS
iio.App.prototype.create = function(){
  var props = {};
  for(var i=0; i<arguments.length; i++){
    if(arguments[i] === null) break;
    if(arguments[i] instanceof iio.V)
      props.pos = arguments[i];
    else if(typeof arguments[i] === 'object')
      props = iio.merge(props,arguments[i]);

    else if(iio.is.number(arguments[i]))
      props.width = arguments[i];

    else if(iio.is.string(arguments[i]))
      props.color = arguments[i];

  }
  if(props.vs){
    if(props.vs.length == 2)
      return this.add(new iio.Line(props));
  } else if(this.radius)
    return this.add(new iio.Ellipse(props));
  else if(this.height)
    return this.add(new iio.Rectangle(props));
  else return this.add(new iio.Square(props));
}
iio.App.prototype.stop = function() {
  this.objs.forEach(function(obj) {
    iio.cancelLoops(obj);
  });
  iio.cancelLoops(this);
  if (this.mainLoop) iio.cancelLoop(this.mainLoop.id);
  this.clear();
}
iio.App.prototype.draw = function(noClear) {
  if (!noClear) this.ctx.clearRect(0, 0, this.width, this.height);
  if (this.color) {
    this.ctx.fillStyle = this.color.toString();
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  if (this.round && this.canvas.style.borderRadius != this.round) {
    this.canvas.style.borderRadius = this.round;
    //this.canvas.style.MozBorderRadius=this.round;
    //this.canvas.style.WebkitBorderRadius=this.round;
  }
  if (this.outline)
    this.canvas.style.border = (this.lineWidth || 1) + 'px solid ' + this.outline;
  if (this.alpha)
    this.canvas.style.opacity = this.alpha;
  if (this.objs.length > 0)
    this.objs.forEach(function(obj) {
      if (obj.draw) obj.draw(this.ctx);
    }, this);
}
iio.App.prototype.clear = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);
  /*if(this.color){
     this.ctx.fillStyle=this.color;
     this.ctx.fillRect(0,0,this.width,this.height);
  }*/
}
iio.App.prototype.collision = function(o1, o2, fn) {
  this.collisions.push(
    [o1, o2, fn]
  );
}
iio.App.prototype.cCollisions = function(o1, o2, fn) {
  if (o1 instanceof Array) {
    if (o2 instanceof Array) {
      if (o2.length == 0) return;
      o1.forEach(function(_o1) {
        o2.forEach(function(_o2) {
          if (iio.collision.check(_o1, _o2)) fn(_o1, _o2);
        });
      });
    } else {
      o1.forEach(function(_o1) {
        if (iio.collision.check(_o1, o2)) fn(_o1, o2);
      });
    }
  } else {
    if (o2 instanceof Array) {
      o2.forEach(function(_o2) {
        if (iio.collision.check(o1, _o2)) fn(o1, _o2);
      });
    } else if (iio.collision.check(o1, o2)) fn(o1, o2);
  }
}
iio.App.prototype._update = function(o, dt) {
  if (this.update) this.update(dt);
  if (this.objs && this.objs.length > 0)
    this.objs.forEach(function(obj) {
      if (obj.update && obj.update(o, dt)) this.rmv(obj);
    }, this);
  if (this.collisions && this.collisions.length > 0) {
    this.collisions.forEach(function(collision) {
      this.cCollisions(collision[0], collision[1], collision[2]);
    }, this);
  }
}