/* Drawable
------------------
iio.js version 1.4
--------------------------------------------------------------
iio.js is licensed under the BSD 2-clause Open Source license
*/

// DEFINITION
iio.Drawable = function(){ this.Drawable.apply(this, arguments) }
iio.inherit(iio.Drawable, iio.Interface);
iio.Drawable.prototype._super = iio.Interface.prototype;

// CONSTRUCTOR
iio.Drawable.prototype.Drawable = function() {
  iio.Drawable.prototype._super.Interface.call(this, iio.merge_args(arguments));
  this.objs = [];
}

// OVERRIDE FUNCTIONS
//-------------------------------------------------------------------
iio.Drawable.prototype.set = function() {
  iio.Drawable.prototype._super.set.call(this, iio.merge_args(arguments));
  if (arguments[arguments.length-1] === true);
  else if(this.app) this.app.draw();
}
iio.Drawable.prototype.convert_props = function(){
  iio.convert.property.color(this,"color");
}

// OBJECT MANAGMENT FUNCTIONS
//-------------------------------------------------------------------
iio.Drawable.prototype.clear = function() {
  objs.foreach(function(obj){
    obj.clearLoops();
  })
  this.objs = [];
}
iio.Drawable.prototype.create = function(){
  var props = {};
  for(var i=0; i<arguments.length; i++){
    if(arguments[i] === null) continue;

    // given string
    if( iio.is.string(arguments[i]) ){
      var c = iio.Color[ arguments[i] ];
      // infer color
      if(c) props.color = c;
      // infer text
      else props.text = arguments[i]
    }

    // given Color
    else if(arguments[i] instanceof iio.Color)
      // infer color
      props.color = arguments[i];

    // given Vector
    else if( arguments[i] instanceof iio.Vector )
      // infer position
      props.pos = arguments[i];

    // given Array
    else if( arguments[i] instanceof Array )
      // infer position
      props.pos = arguments[i];

    //given Object
    else if(typeof arguments[i] === 'object')
      // merge objects
      props = iio.merge(props,arguments[i]);

    // given number
    else if(iio.is.number(arguments[i]))
      // infer width
      props.width = arguments[i];
  }

  if(props.vs){
    // infer Line
    if(props.vs.length == 2)
      return this.add(new iio.Line(props));
    // infer Polygon
    else return this.add(new iio.Polygon(props));
  } 
  // infer Circle
  else if(props.radius)
    return this.add(new iio.Ellipse(props));
  // infer Text
  else if(props.text)
    return this.add(new iio.Text(props));
  // infer Grid
  else if(props.res || props.R || props.C)
    return this.add(new iio.Grid(props));
  // infer Rectangle
  else if(props.width)
    return this.add(new iio.Rectangle(props));
  // infer Color
  else if(props.color)
    return props.color;
  // infer Vector
  else if(props.pos)
    return props.pos
  return false;
}
iio.Drawable.prototype.add = function() {

  // if input is Array
  if (arguments[0] instanceof Array)
    for(var i=0; i<arguments[0].length; i++)
      this.add(arguments[0][i], true);

  // else input is singular object
  else {

    // set hierarchy properties
    arguments[0].parent = this;

    // set app & ctx refs for object
    arguments[0].app = this.app;
    arguments[0].ctx = this.ctx;

    // set app & ctx refs for object children
    if(arguments[0].objs && arguments[0].objs.length>0)
      for(var i=0; i<arguments[0].objs.length; i++){
        arguments[0].objs[i].app = this.app;
        arguments[0].objs[i].ctx = this.ctx; 
      }

    // infer size if Text object
    if (arguments[0] instanceof iio.Text)
      arguments[0].inferSize();

    // set default z index
    if (typeof(arguments[0].z) == 'undefined') 
      arguments[0].z = 0;

    // insert into objs in order of z index
    var i = 0;
    while ( i < this.objs.length 
      && typeof(this.objs[i].z) != 'undefined' 
      && arguments[0].z >= this.objs[i].z) i++;
    this.objs.insert(i, arguments[0]);

    // set loop if neccessary
    if ( arguments[0].app && 
        (  arguments[0].vel 
        || arguments[0].vels 
        || arguments[0].rVel 
        || arguments[0].bezierVels 
        || arguments[0].bezierAccs
        || arguments[0].acc
        || arguments[0].accs 
        || arguments[0].rAcc 
        || arguments[0].onUpdate 
        || arguments[0].shrink 
        || arguments[0].fade 
        ) && (typeof arguments[0].app.looping == 'undefined' 
            || arguments[0].app.looping === false))
      arguments[0].app.loop();
  }

  // redraw unless suppressed
  if (arguments[arguments.length-1] === true);
  else if(this.app) this.app.draw();

  // return given object
  return arguments[0];
}
iio.Drawable.prototype.rmv = function() {

  // if input is Array
  if (arguments[0] instanceof Array)
    for(var i=0; i<arguments[0].length; i++)
      this.rmv(arguments[0][i], true);

  // input is a singular object
  else {

    // remove object at index
    if ( iio.is.number( arguments[0] ) && arguments[0] < this.objs.length )
      return this.objs.splice(o, 1);

    remove = function(c, i, arr) {
      if (c == arguments[0]) {
        arr.splice(i, 1);
        return true;
      } else return false;
    }

    // remove passed object
    if (this.objs) this.objs.some(remove);

    // removed associated collisions
    if (this.collisions) this.collisions.forEach(function(collision, i) {

      // remove collision referring only to removed object
      if ( collision[0] == arguments[0] || collision[1] == arguments[0] )
        this.collisions.splice(i, 1);
      else {
        // remove reference to removed object from collision arrays
        if (collision[0] instanceof Array)
          collision[0].some(remove)
        if (collision[1] instanceof Array)
          collision[1].some(remove)
      }
    })
  }

  // redraw unless suppressed
  if (arguments[arguments.length-1] === true);
  else if(this.app) this.app.draw();

  // return removed object(s)
  return arguments[0];
}

// LOOP MANAGMENT FUNCTIONS
//-------------------------------------------------------------------
iio.Drawable.prototype.loop = function(fps, fn) {
  this.looping = true;
  var loop;
  if (typeof fn == 'undefined') {
    if (typeof fps == 'undefined') {
      if (this.app.mainLoop) iio.cancelLoop(this.app.mainLoop.id);
      loop = this.app.mainLoop = {
        fps: 60,
        fn: this,
        af: this.rqAnimFrame,
        o: this.app
      };
      this.app.fps = 60;
      loop.id = this.app.mainLoop.id = iio.loop(this.app.mainLoop);
    } else {
      if (!iio.is.number(fps)) {
        loop = {
          fps: 60,
          fn: fps,
          af: this.rqAnimFrame
        }
        loop.id = iio.loop(loop, fps);
      } else {
        if (this.app.mainLoop) iio.cancelLoop(this.app.mainLoop.id);
        loop = this.app.mainLoop = {
          fps: fps,
          o: this.app,
          af: false
        }
        this.app.fps = fps;
        loop.id = this.app.mainLoop.id = iio.loop(this.app.mainLoop);
      }
    }
  } else {
    loop = {
      fps: fps,
      fn: fn,
      o: this,
      af: this.rqAnimFrame
    };
    loop.id = iio.loop(fps, loop);
  }
  this.loops.push(loop);
  /*if(typeof o.app.fps=='undefined'||o.app.fps<fps){
     if(o.app.mainLoop) iio.cancelLoop(o.app.mainLoop.id);
     o.app.mainLoop={fps:fps,o:o.app,af:o.app.rqAnimFrame}
     o.app.fps=fps;
     o.app.mainLoop.id=iio.loop(o.app.mainLoop);
  }*/
  return loop.id;
}
iio.Drawable.prototype.clearLoops = function() {
  for (var i = 0; i < this.loops.length; i++)
    iio.cancelLoop(this.loops[i]);
}
iio.Drawable.prototype.pause = function(c) {
  if (this.paused) {
    this.paused = false;
    this.loops.forEach(function(loop) {
      iio.loop(loop);
    });
    if (this.mainLoop) iio.loop(this.mainLoop);
    if (typeof c == 'undefined')
      this.objs.forEach(function(Drawable) {
        Drawable.loops.forEach(function(loop) {
          iio.loop(loop);
        });
      });
  } else {
    iio.cancelLoops(this);
    iio.cancelLoop(this.mainLoop.id);
    this.paused = true;
  }
}
