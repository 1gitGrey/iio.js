
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
};
//DEFINITION
iio.Color = function(){ this.Color.apply(this, arguments) };

//STATIC FUNCTIONS
iio.Color.random = function(){
	return new iio.Color(iio.randomInt(0,255),iio.randomInt(0,255),iio.randomInt(0,255))
}

//CONSTRUCTOR
iio.Color.prototype.Color = function(r,g,b,a) {
	this.r = r || 0;
	this.g = g || 0;
	this.b = b || 0;
	this.a = a || 1;
	return this;
}

//FUNCTIONS
iio.Color.prototype.toString = function(){
	return 'rgba('+this.r+','+this.g+','+this.b+','+this.a+')';
}
iio.Color.prototype.invert = function(){
	this.r = 255-this.r;
	this.g = 255-this.g;
	this.b = 255-this.b;
	return this;
}
iio.Color.prototype.randomize = function(alpha){
	this.r = iio.randomInt(0,255);
	this.g = iio.randomInt(0,255);
	this.b = iio.randomInt(0,255);
	if(alpha) this.a = iio.random();
	return this;
};
//DEFINITION
iio.Drawable = function(){ this.Drawable.apply(this, arguments) }
iio.inherit(iio.Drawable, iio.Obj);
iio.Drawable.prototype._super = iio.Obj.prototype;

//CONSTRUCTOR
iio.Drawable.prototype.Drawable = function() {
  this._super.Obj.call(this,arguments[0]);
  //if(!this.pos) this.pos = {x:0, y:0}
}

//BOUNDS FUNCTIONS
iio.Drawable.prototype.resolve = function(b, c) {
  if (b.length > 1) return b[1](c);
  return true;
}
iio.Drawable.prototype.over_upper_limit = function(bnd, lim, c) {
  if (lim > bnd[0]) return this.resolve(bnd, c);
  return false;
}
iio.Drawable.prototype.below_lower_limit = function(bnd, lim, c) {
  if (lim < bnd[0]) return this.resolve(bnd, c);
  return false;
}

//UPDATE FUNCTIONS
iio.Drawable.prototype.update = function() {

  // transform and remove Drawableect if necessary
  var remove = false;
  if(this.bounds) remove = this.past_bounds();
  if (this.shrink) remove = this.update_shrink();
  if (this.fade) remove = this.update_fade();
  if (remove) return remove;

  // update position
  if (this.acc) this.update_acc();
  if (this.vel) this.update_vel();

  if (this.objs && this.objs.length > 0)
      this.objs.forEach(function(obj) {
        if (obj.update && obj.update(o, dt)) this.rmv(obj);
      }, this);
}
iio.Drawable.prototype.update_vel = function(){
  if (this.vel.x) this.pos.x += this.vel.x;
  if (this.vel.y) this.pos.y += this.vel.y;
  if (this.vel.r) this.rot += this.vel.r;
}
iio.Drawable.prototype.update_acc = function(){
  this.vel.x += this.acc.x;
  this.vel.y += this.acc.y;
  this.vel.r += this.acc.r;
}
iio.Drawable.prototype.update_shrink = function(){
  if (this.shrink instanceof Array)
    return this._shrink(this.shrink[0], this.shrink[1]);
  else return this._shrink(this.shrink);
}
iio.Drawable.prototype.update_fade = function(){
  if (this.fade instanceof Array)
    return this._fade(this.fade[0], this.fade[1]);
  else return this._fade(this.fade);
}
iio.Drawable.prototype.past_bounds = function(){
  if (this.bounds.right && this.over_upper_limit(this.bounds.right, this.pos.x, this)) return true;
  if (this.bounds.left && this.below_lower_limit(this.bounds.left, this.pos.x, this)) return true;
  if (this.bounds.top && this.below_lower_limit(this.bounds.top, this.pos.y, this)) return true;
  if (this.bounds.bottom && this.over_upper_limit(this.bounds.bottom, this.pos.y, this)) return true;
  return false;
}
iio.Drawable.prototype.update_properties_deprecated = function(){
  if (o.simple) {
    if (!(o.bbx instanceof Array)) {
      o.bbx = [o.bbx, o.bbx];
    } else if (typeof(o.bbx[1] == 'undefined'))
      o.bbx[1] = o.bbx[0];
  }
  if (o.anims) {
    o.animKey = 0;
    o.animFrame = 0;
    if (!o.width) o.width = o.anims[o.animKey].frames[o.animFrame].w;
    if (!o.height) o.height = o.anims[o.animKey].frames[o.animFrame].h;
  }
  if (o.bezier)
    o.bezier.forEach(function(b, i) {
      if (b === 'n') o.bezier[i] = undefined;
    });
  if (o.img && iio.is.string(o.img)) {
    nd = false;
    var src = o.img;
    o.img = new Image();
    o.img.src = src;
    o.img.parent = o;
    if ((typeof o.width == 'undefined' && typeof o.radius == 'undefined') || o.radius == 0)
      o.img.onload = function(e) {
        if (o.radius == 0) o.radius = o.width / 2;
        else {
          o.width = o.width || 0;
          o.height = o.height || 0;
        }
        if (nd);
        else o.app.draw();
      }
  } else if (o.img) {
    if ((typeof o.width == 'undefined' && typeof o.radius == 'undefined') || o.radius == 0) {
      if (o.radius == 0) o.radius = o.img.width / 2;
      else {
        o.width = o.img.width || 0;
        o.height = o.img.height || 0;
      }
      if (nd);
      else o.app.draw();
    }
  }
}

//ANIMATION FUNCTIONS
iio.Drawable.prototype.playAnim = function(fps, t, r, fn, s) {
  if (iio.is.string(t)) {
    var o = this;
    this.anims.some(function(anim, i) {
      if (anim.tag == t) {
        o.animKey = i;
        o.width = anim.frames[o.animFrame].w;
        o.height = anim.frames[o.animFrame].h;
        return true;
      }
      return false;
    });
  } else r = t;
  this.animFrame = s || 0;
  if (typeof(r) != 'undefined') {
    this.repeat = r;
    this.onanimstop = fn;
  }
  var loop;
  if (fps > 0) loop = this.loop(fps, iio.anim.next);
  else if (fps < 0) loop = this.loop(fps * -1, iio.anim.prev);
  else this.app.draw();
  return loop;
}
iio.Drawable.prototype.nextFrame = function(o) {
  o.animFrame++;
  if (o.animFrame >= o.anims[o.animKey].frames.length) {
    o.animFrame = 0;
    if (typeof(o.repeat) != 'undefined') {
      if (o.repeat <= 1) {
        window.cancelAnimationFrame(id);
        window.clearTimeout(id);
        if (o.onanimstop) o.onanimstop(id, o);
        return;
      } else o.repeat--;
    }
  }
}
iio.Drawable.prototype.prevFrame = function(o) {
  o.animFrame--;
  if (o.animFrame < 0)
    o.animFrame = o.anims[o.animKey].frames.length - 1;
  o.app.draw();
}
iio.Drawable.prototype._shrink = function(s, r) {
  this.width *= 1 - s;
  this.height *= 1 - s;
  if (this.width < .02) {
    if (r) return r(this);
    else return true;
  }
},
iio.Drawable.prototype._fade = function(s, r) {
  this.alpha *= 1 - s;
  if (this.alpha < .002) {
    if (r) return r(this);
    else return true;
  }
}


//DRAW FUNCTIONS
iio.Drawable.prototype.prep_ctx = function(ctx){
  ctx = ctx || this.app.ctx;
  ctx.save();

  //translate & rotate
  if (this.origin) ctx.translate(this.origin.x, this.origin.y);
  else if(this.pos) ctx.translate(this.pos.x, this.pos.y);
  if (this.rot) ctx.rotate(this.rot);
  return ctx;
}
iio.Drawable.prototype.prep_ctx_color = function(ctx){
  //if (o.color.indexOf && o.color.indexOf('gradient') > -1)
    //o.color = o.createGradient(ctx, o.color);
  ctx.fillStyle = this.color.toString();
  return ctx;
}
iio.Drawable.prototype.prep_ctx_outline = function(ctx){
  //if (o.outline.indexOf && o.outline.indexOf('gradient') > -1)
    //o.outline = o.createGradient(ctx, o.outline);
  ctx.strokeStyle = o.outline.toString();
  return ctx;
}
iio.Drawable.prototype.prep_ctx_lineWidth = function(ctx){
  ctx.lineWidth = o.lineWidth || 1;
  return ctx;
}
iio.Drawable.prototype.prep_ctx_shadow = function(ctx){
  var s = this.shadow.split(' ');
  s.forEach(function(_s) {
    if (iio.is.number(_s))
      ctx.shadowBlur = _s;
    else if (_s.indexOf(':') > -1) {
      var _i = _s.indexOf(':');
      ctx.shadowOffsetX = _s.substring(0, _i);
      ctx.shadowOffsetY = _s.substring(_i + 1);
    } else ctx.shadowColor = _s;
  });
  return ctx;
}
iio.Drawable.prototype.prep_ctx_dash = function(ctx){
  if (this.dash.length > 1 && this.dash.length % 2 == 1)
    ctx.lineDashOffset = this.dash[this.dash.length - 1];
  //ctx.setLineDash(this.dash.slice().splice(0,this.dash.length-1));
  ctx.setLineDash(this.dash);
  return ctx;
}
iio.Drawable.prototype.finish_path_shape = function(ctx){
  if (this.color) ctx.fill();
  if (this.img) ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
  if (this.outline) ctx.stroke();
  if (this.clip) ctx.clip();
} 
iio.Drawable.prototype.draw_obj = function(ctx){
  ctx.save();
  ctx.globalAlpha = this.alpha;
  if (this.lineCap) ctx.lineCap = this.lineCap;
  if (this.shadow) ctx = this.prep_ctx_shadow(ctx);
  if (this.dash) ctx = this.prep_ctx_dash(ctx);
  if (this.color) ctx = this.prep_ctx_color(ctx);
  if (this.outline) {
    ctx = this.prep_ctx_outline(ctx);
    ctx = this.prep_ctx_lineWidth(ctx);
  }
  if(this.draw_shape) this.draw_shape(ctx);
  ctx.restore();
}
iio.Drawable.prototype.draw = function(ctx){

  if (this.hidden) return;
  ctx = this.prep_ctx(ctx);
  
  //draw objs in z index order
  if (this.objs&&this.objs.length > 0) {
    var drawnSelf = false;
    this.objs.forEach(function(obj) {
      if (!drawnSelf && obj.z >= this.z) {
        this.draw_obj(ctx);
        drawnSelf = true;
      }
      if (obj.draw) obj.draw(ctx);
    }, this);
    if (!drawnSelf) this.draw_obj(ctx);
  } 
  //draw
  else this.draw_obj(ctx);
  ctx.restore();
}
iio.Drawable.prototype.draw_line = function(ctx, x1, y1, x2, y2){
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x1, y1);
  ctx.stroke();
};
//DEFINITION
iio.Circle = function(){ this.Circle.apply(this, arguments) };
iio.inherit(iio.Circle, iio.Drawable);
iio.Circle.prototype._super = iio.Drawable.prototype;

//CONSTRUCTOR
iio.Circle.prototype.Circle = function() {
  this._super.Drawable.call(this,arguments[0]);
}

//FUNCTIONS
iio.Circle.prototype.draw_shape = function(ctx) {
  ctx.beginPath();
  ctx.arc(0, 0, this.radius, 0, 2 * Math.PI, false);
  if (this.color) ctx.fill();
  if (this.img) ctx.drawImage(this.img, -this.radius, -this.radius, this.radius, this.radius);
  if (this.outline) ctx.stroke();
  if (this.clip) ctx.clip();
  ctx.restore();
}
iio.Circle.prototype.contains = function(v, y) {
  if (typeof(y) != 'undefined') v = {
    x: v,
    y: y
  }
  if (this.radius == this.radius && iio.v.dist(v, this.pos) < this.radius)
    return true;
  else {
    if (this.rot) {
      v.x -= this.pos.x;
      v.y -= this.pos.y;
      v = iio.rotatePoint(v.x, v.y, -this.rot);
      v.x += this.pos.x;
      v.y += this.pos.y;
    }
    if (Math.pow(v.x - this.pos.x, 2) / Math.pow(this.radius, 2) + Math.pow(v.y - this.pos.y, 2) / Math.pow(this.radius, 2) <= 1)
      return true;
  }
  return false;
}
iio.Circle.prototype.left = function(){ return pos.x - this.radius }
iio.Circle.prototype.right = function(){ return pos.x + this.radius }
iio.Circle.prototype.top = function(){ return pos.y - this.radius }
iio.Circle.prototype.bottom = function(){ return pos.y + this.radius }
iio.Circle.prototype.draw_shape = function(ctx){
  ctx.beginPath();
  ctx.arc(0, 0, this.radius, 0, 2 * Math.PI, false);
  if (this.radius != this.radius) ctx.closePath();
  this.finish_path_shape(ctx);
};
//DEFINITION
iio.Grid = function(){ this.Grid.apply(this, arguments) };
iio.inherit(iio.Grid, iio.Rectangle);
iio.Grid.prototype._super = iio.Rectangle.prototype;

//CONSTRUCTOR
iio.Grid.prototype.Grid = function() {
  this._super.Rectangle.call(this,arguments[0]);
  this.res = { x:this.width/this.C, y:this.height/this.R };
    this.cells = [];
    var x = -this.res.x * (this.C - 1) / 2;
    var y = -this.res.y * (this.R - 1) / 2;
    for (var c = 0; c < this.C; c++) {
      this.cells[c] = [];
      for (var r = 0; r < this.R; r++) {
        this.cells[c][r] = this.add({
          pos:{
            x:x,
            y:y
          },
          c: c,
          r: r,
          width: this.res.x,
          height: this.res.y
        });
        y += this.res.y;
      }
      y = -this.res.y * (this.R - 1) / 2;
      x += this.res.x;
    }
}

//FUNCTIONS
iio.Grid.prototype.draw_shape = function(ctx) {
  ctx.translate(-this.width / 2, -this.height / 2);
  /*iio.draw.rect(ctx, this.width, this.height, {
    c: this.color,
    o: this.outline
  }, {
    img: this.img,
    anims: this.anims,
    mov: this.mov,
    round: this.round
  });*/
  if (this.color) {
    if (this.color.indexOf && this.color.indexOf('gradient') > -1)
      this.color = this.createGradient(ctx, this.color);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;
    for (var c = 1; c < this.C; c++) this.draw_line(ctx, c * this.res.x, 0, c * this.res.x, this.height);
    for (var r = 1; r < this.R; r++) this.draw_line(ctx, 0, r * this.res.y, this.width, r * this.res.y);
  }
}
iio.Grid.prototype.clear = function() {
  this.objs = [];
  iio.initGrid(this);
  this.app.draw();
}
iio.Grid.prototype.cellCenter = function(c, r) {
  return {
    x: -this.width / 2 + c * this.res.x + this.res.x / 2,
    y: -this.height / 2 + r * this.res.y + this.res.y / 2
  }
}
iio.Grid.prototype.cellAt = function(x, y) {
  if (x.x) return this.cells[Math.floor((x.x - this.left) / this.res.x)][Math.floor((x.y - this.top) / this.res.y)];
  else return this.cells[Math.floor((x - this.left) / this.res.x)][Math.floor((y - this.top) / this.res.y)];
}
iio.Grid.prototype.foreachCell = function(fn, p) {
  for (var c = 0; c < this.C; c++)
    for (var r = 0; r < this.R; r++)
      if (fn(this.cells[c][r], p) === false)
        return [r, c];
};
//DEFINITION
iio.Line = function(){ this.Line.apply(this, arguments) };
iio.inherit(iio.Line, iio.Drawable);
iio.Line.prototype._super = iio.Drawable.prototype;

//CONSTRUCTOR
iio.Line.prototype.Line = function() {
  this._super.Drawable.call(this,arguments[0]);
  this.pos = this.pos || this.vs[0];
  //this.center.x = (this.pos.x + this.endPos.x) / 2;
  //this.center.y = (this.pos.y + this.endPos.y) / 2;
  //this.width = iio.v.dist(this.pos, this.endPos);
  //this.height = o.lineWidth;
}


//FUNCTIONS
iio.Line.prototype.update_props = function(v) {
  
}
iio.Line.prototype.contains = function(v, y) {
  if (typeof(y) != 'undefined') v = {
    x: v,
    y: y
  }
  if (iio.is.between(v.x, this.pos.x, this.vs[1].x) && iio.is.between(v.y, this.vs[0].y, this.vs[1].y)) {
    var a = (this.vs[1].y - this.vs[0].y) / (this.vs[1].x - this.vs[0].x);
    if (!isFinite(a)) return true;
    var y = a * (this.vs[1].x - this.vs[0].x) + this.vs[0].y;
    if (y == v.y) return true;
  }
  return false;
}

iio.Line.prototype.draw_shape = function(ctx) {
  /*if (this.color.indexOf && this.color.indexOf('gradient') > -1)
    this.color = this.createGradient(ctx, this.color);*/
  ctx.strokeStyle = this.color.toString();
  ctx.lineWidth = this.lineWidth || 1;
  if (this.origin)
    ctx.translate(-this.origin.x, -this.origin.y);
  else if(this.pos) ctx.translate(-this.pos.x, -this.pos.y);
  ctx.beginPath();
  ctx.moveTo(this.vs[0].x, this.vs[0].y);
  if (this.bezier)
    ctx.bezierCurveTo(this.bezier[0], this.bezier[1], this.bezier[2], this.bezier[3], this.vs[1].x, this.vs[1].y);
  else ctx.lineTo(this.vs[1].x, this.vs[1].y);
  ctx.stroke();
};
//DEFINITION
iio.Obj = function(){ this.Obj.apply(this, arguments) }

//CONSTRUCTOR
iio.Obj.prototype.Obj = function() {
  this.objs = [];
  this.set(arguments[0], true);
}

//FUNCTIONS
iio.Obj.prototype.set = function() {
  for (var p in arguments[0]) this[p] = arguments[0][p];
  this.convert_props();
}
iio.Obj.prototype.convert_props = function(){
  
  // string color to iio.Color
  if(iio.is.string(this.color)) 
    this.color = iio.convert.color(this.color);

  // arrays to iio.V
  this.convert_v("pos");
  this.convert_v("vel");
  this.convert_v("acc");
  if(this.vs)
    for(var i=0; i<this.vs.length; i++)
      if(this.vs[i] instanceof Array)
        this.vs[i] = new iio.V(this.vs[i]);
}
iio.Obj.prototype.convert_v = function(p){
  if(this[p] && this[p] instanceof Array)
    this[p] = new iio.V(this[p]);
}
iio.Obj.prototype.add = function() {
  if (arguments[0] instanceof Array)
    arguments[0].forEach(function() {
      this.add(arguments);
    }, this);
  else {
    arguments[0].parent = this;
    arguments[0].app = this.app;
    if(!arguments[0].pos)
      arguments[0].pos = {x:this.app.center.x,y:this.app.center.y};
    if (typeof(arguments[0].z) == 'undefined') arguments[0].z = 0;
    var i = 0;
    while (i < this.objs.length && typeof(this.objs[i].z) != 'undefined' && arguments[0].z >= this.objs[i].z) i++;
    this.objs.insert(i, arguments[0]);
    if (arguments[0].app && ((arguments[0].vel && (arguments[0].vel.x != 0 || arguments[0].vel.y != 0 || arguments[0].vel.r != 0)) || arguments[0].shrink || arguments[0].fade || (arguments[0].acc && (arguments[0].acc.x != 0 || arguments[0].acc.y != 0 || arguments[0].acc.r != 0))) && (typeof arguments[0].app.looping == 'undefined' || arguments[0].app.looping === false))
      arguments[0].app.loop();
  }
  if (arguments[arguments.length-1] === true);
  else if(this.app) this.app.draw();
  return arguments[0];
}
iio.Obj.prototype.create = function(){
  var obj = this.add(new iio.Obj(this, arguments), true);
  if (arguments[arguments.length-1] === true);
  else this.app.draw();
  return obj;
}
iio.Obj.prototype.rmv = function(o, nd) {
  callback = function(c, i, arr) {
    if (c == o) {
      arr.splice(i, 1);
      return true;
    } else return false;
  }
  if (typeof o == 'undefined')
    this.objs = [];
  else if (o instanceof Array)
    o.forEach(function(_o) {
      this.rmv(_o);
    }, this);
  else if (iio.is.number(o) && o < this.objs.length)
    this.objs.splice(o, 1);
  else if (this.objs) this.objs.some(callback);
  if (this.collisions) this.collisions.forEach(function(collision, i) {
    if (collision[0] == o || collision[1] == o)
      this.collisions.splice(i, 1);
    else if (collision[0] instanceof Array)
      collision[0].some(callback)
    if (collision[1] instanceof Array)
      collision[1].some(callback)
  })
  if (nd);
  else this.app.draw();
  return o;
}
iio.Obj.prototype.clear = function() {
  this.objs = [];
}
iio.Obj.prototype.loop = function(fps, fn) {
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
iio.Obj.prototype.clear_loops = function() {
  for (var i = 0; i < this.loops.length; i++)
    iio.cancelLoop(this.loops[i]);
}
iio.Obj.prototype.pause = function(c) {
  if (this.paused) {
    this.paused = false;
    this.loops.forEach(function(loop) {
      iio.loop(loop);
    });
    if (this.mainLoop) iio.loop(this.mainLoop);
    if (typeof c == 'undefined')
      this.objs.forEach(function(obj) {
        obj.loops.forEach(function(loop) {
          iio.loop(loop);
        });
      });
  } else {
    iio.cancelLoops(this);
    iio.cancelLoop(this.mainLoop.id);
    this.paused = true;
  }
}
;
//DEFINITION
iio.Polygon = function(){ this.Polygon.apply(this, arguments) };
iio.inherit(iio.Polygon, iio.Drawable);
iio.Polygon.prototype._super = iio.Drawable.prototype;

//CONSTRUCTOR
iio.Polygon.prototype.Polygon = function() {
  this._super.Drawable.call(this,arguments[0]);
}

//FUNCTIONS
iio.Polygon.prototype.draw_shape = function(ctx) {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  if (this.bezier) {
    var _i = 0;
    for (var i = 1; i < this.vs.length; i++)
      ctx.this.bezierCurveTo((this.bezier[_i++] || this.vs[i - 1].x - this.vs[0].x), (this.bezier[_i++] || this.vs[i - 1].y - this.vs[0].y), (this.bezier[_i++] || this.vs[i].x - this.vs[0].x), (this.bezier[_i++] || this.vs[i].y - this.vs[0].y), this.vs[i].x - this.vs[0].x, this.vs[i].y - this.vs[0].y);
    if (typeof(this.open) == 'undefined' || !this.open) {
      i--;
      ctx.this.bezierCurveTo((this.bezier[_i++] || this.vs[i].x - this.vs[0].x), (this.bezier[_i++] || this.vs[i].y - this.vs[0].y), (this.bezier[_i++] || 0), (this.bezier[_i++] || 0), 0, 0);
    }
  } else for(var i=1; i<this.vs.length; i++)
    ctx.lineTo(this.vs[i].x - this.vs[0].x, this.vs[i].y - this.vs[0].y);
  if (typeof(this.open) == 'undefined' || !this.open)
    ctx.closePath();
  this.finish_path_shape(ctx);
}
iio.Polygon.prototype.contains = function(v, y) {
  y = (v.y || y);
  v = (v.x || v);
  var i = j = c = 0;
  var vs = this.vs;
  if (this.rot) vs = this.getTrueVertices();
  for (i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    if (((vs[i].y > y) != (vs[j].y > y)) &&
      (v < (vs[j].x - vs[i].x) * (y - vs[i].y) / (vs[j].y - vs[i].y) + vs[i].x))
      c = !c;
  }
  return c;
}
iio.Polygon.prototype.getTrueVertices = function() {
  return this.vs.map(function(_v) {
    var v = iio.point.rotate(_v.x - this.pos.x, _v.y - this.pos.y, this.rot);
    v.x += this.pos.x;
    v.y += this.pos.y;
    return v;
  }, this);
};
//DEFINITION
iio.Rectangle = function(){ this.Rectangle.apply(this, arguments) };
iio.inherit(iio.Rectangle, iio.Drawable);
iio.Rectangle.prototype._super = iio.Drawable.prototype;

//CONSTRUCTOR
iio.Rectangle.prototype.Rectangle = function() {
  this._super.Drawable.call(this,arguments[0]);
  this.height = this.height || this.width;
}

//FUNCTIONS
iio.Rectangle.prototype.contains = function(v, y) {
  if (this.rot) return iio.poly.contains(v, y);
  y = v.y || y;
  v = v.x || v;
  v -= this.pos.x;
  y -= this.pos.y;
  if (v > -this.width / 2 && v < this.width / 2 && y > -this.width / 2 && y < this.width / 2)
    return true;
  return false;
}
iio.Rectangle.prototype.real_vertices = function() {
  this.vs = [{
    x: this.left,
    y: this.top
  }, {
    x: this.right,
    y: this.top
  }, {
    x: this.right,
    y: this.bottom
  }, {
    x: this.left,
    y: this.bottom
  }];
  return this.vs.map(function(_v) {
    var v = iio.point.rotate(_v.x - this.pos.x, _v.y - this.pos.y, this.rot);
    v.x += this.pos.x;
    v.y += this.pos.y;
    return v;
  }, this);
}
iio.Rectangle.prototype.left = function(){ return pos.x - this.width }
iio.Rectangle.prototype.right = function(){ return pos.x + this.width }
iio.Rectangle.prototype.top = function(){ return pos.y - this.height }
iio.Rectangle.prototype.bottom = function(){ return pos.y + this.height }
iio.Rectangle.prototype.draw_rounded = function(ctx){
  ctx.beginPath();
  ctx.moveTo(this.round[0], 0);
  ctx.lineTo(this.width - this.round[1], 0);
  ctx.quadraticCurveTo(this.width, 0, this.width, this.round[1]);
  ctx.lineTo(this.width, this.height - this.round[2]);
  ctx.quadraticCurveTo(this.width, this.height, this.width - this.round[2], this.height);
  ctx.lineTo(this.round[3], this.height);
  ctx.quadraticCurveTo(0, this.height, 0, this.height - this.round[3]);
  ctx.lineTo(0, this.round[0]);
  ctx.quadraticCurveTo(0, 0, this.round[0], 0);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
  ctx.clip();
}
iio.Rectangle.prototype.draw_shape = function(ctx){
  ctx.translate(-this.width / 2, -this.width / 2);
  if (this.bezier) {
    iio.draw.poly(ctx, this.getTrueVertices(), this.bezier);
    this.finish_path_shape(ctx);
  }
  // } else if (this.type==iio.X) {
  //   iio.draw.prep_x(ctx, this);
  //   iio.draw.line(ctx, 0, 0, this.width, this.width);
  //   iio.draw.line(ctx, this.width, 0, 0, this.width);
  //   ctx.restore();
  // } 
  else if(this.round)
    this.draw_rounded(ctx);
  else{
    if (this.color) ctx.fillRect(0, 0, this.width, this.width)
    if (this.img) ctx.drawImage(this.img, 0, 0, this.width, this.width);
    if (this.anims) ctx.drawImage(this.anims[this.animKey].frames[this.animFrame].src,
      this.anims[this.animKey].frames[this.animFrame].x,
      this.anims[this.animKey].frames[this.animFrame].y,
      this.anims[this.animKey].frames[this.animFrame].w,
      this.anims[this.animKey].frames[this.animFrame].h,
      0, 0, this.width, this.width);
    if (this.outline) ctx.strokeRect(0, 0, this.width, this.width);
  }
};
//DEFINITION
iio.SpriteMap = function() {this.SpriteMap.apply(this, arguments) }

//CONSTRUCTOR
iio.SpriteMap.prototype.SpriteMap = function(src, p) {
  this.img = new Image();
  this.img.src = src;
  this.img.onload = p.onload;
  return this;
}

//FUNCTIONS
iio.SpriteMap.prototype.sprite = function(w, h, a, x, y, n) {
  var s = {};
  if (iio.is.string(w)) {
    s.tag = w;
    w = h;
    h = a;
    a = x;
    x = y;
    y = n;
  }
  if (w instanceof Array) s.frames = w;
  else if (a instanceof Array) s.frames = a;
  else {
    s.frames = [];
    for (var i = 0; i < a; i++)
      s.frames[i] = {
        x: w * i,
        y: y,
        w: w,
        h: h
      };
  }
  s.frames.forEach(function(frame) {
    if (typeof(frame.src) == 'undefined') frame.src = this.img;
    if (typeof(frame.w) == 'undefined') frame.w = w;
    if (typeof(frame.h) == 'undefined') frame.h = h;
  }, this);
  return s;
};
//DEFINITION
iio.Square = function(){ this.Square.apply(this, arguments) };
iio.inherit(iio.Square, iio.Rectangle);
iio.Square.prototype._super = iio.Rectangle.prototype;

//CONSTRUCTOR
iio.Square.prototype.Square = function() {
	this._super.Rectangle.call(this,arguments[0]);
	this.height = this.width;
}
;
//DEFINITION
iio.Text = function(){ this.Text.apply(this, arguments) };
iio.inherit(iio.Text, iio.Drawable);
iio.Text.prototype._super = iio.Drawable.prototype;

//CONSTRUCTOR
iio.Text.prototype.Text = function() {
  this._super.Drawable.call(this,arguments[0]);
  this.size = this.size || 20;
  this.color = this.color || 'black';
  this.font = this.font || 'Arial';
  this.align = this.align || 'center';
  
  /*this.app.ctx.font = this.size + 'px ' + this.font;
  this.width = this.app.ctx.measureText(this.text).width;
  this.height = this.app.ctx.measureText('W').width;*/

  /*var tX = this.getX(this.text.length);
  this.cursor = this.add([tX, 10, tX, -this.size * .8], '2 ' + (this.color || this.outline), {
    index: this.text.length,
    shift: false
  });
  if (this.showCursor) {
    this.loop(2, function(o) {
      this.cursor.hidden = !this.cursor.hidden;
    })
  } else this.cursor.hidden = true;*/
}

//FUNCTIONS
iio.Text.prototype.draw_shape = function(ctx) {
  ctx.font = this.size + 'px ' + this.font;
  ctx.textAlign = this.align;
  if (this.color) ctx.fillText(this.text, 0, 0);
  if (this.outline) ctx.strokeText(this.text, 0, 0);
  if (this.showCursor)
    this.cursor.pos.x = this.cursor.endPos.x = this.getX(this.cursor.index);
}
iio.Text.prototype.contains = function(x, y) {
  if (typeof(y) == 'undefined') {
    y = x.y;
    x = x.x
  }
  x -= this.pos.x;
  y -= this.pos.y;
  if ((typeof(this.align) == 'undefined' || this.align == 'left') && x > 0 && x < this.width && y < 0 && y > -this.height)
    return true;
  else if (this.align == 'center' && x > -this.width / 2 && x < this.width / 2 && y < 0 && y > -this.height)
    return true;
  else if ((this.align == 'right' || this.align == 'end') && x > -this.width && x < 0 && y < 0 && y > -this.height)
    return true;
  return false;
}
iio.Text.prototype.charWidth = function(i) {
  i = i || 0;
  this.app.ctx.font = this.size + 'px ' + this.font;
  return this.app.ctx.measureText(this.text.charAt(i)).width;
}
iio.Text.prototype.getX = function(i) {
  this.app.ctx.font = this.size + 'px ' + this.font;
  if (typeof(this.align) == 'undefined' || this.align == 'left')
    return this.app.ctx.measureText(this.text.substring(0, i)).width;
  if (this.align == 'right' || this.align == 'end')
    return -this.app.ctx.measureText(this.text.substring(0, this.text.length - i)).width;
  if (this.align == 'center') {
    var x = -Math.floor(this.app.ctx.measureText(this.text).width / 2);
    return x + this.app.ctx.measureText(this.text.substring(0, i)).width;
  }
}
iio.Text.prototype.keyUp = function(k) {
  if (k == 'shift')
    this.cursor.shift = false;
}
iio.Text.prototype.keyDown = function(key, cI, shift, fn) {
  if (!iio.is.number(cI)) {
    fn = cI;
    cI = this.cursor.index;
  }
  var str;
  var pre = this.text.substring(0, cI);
  var suf = this.text.substring(cI);
  if (typeof fn != 'undefined') {
    str = fn(key, shift, pre, suf);
    if (str != false) {
      this.text = pre + str + suf;
      this.cursor.index = cI + 1;
      if (this.showCursor) this.cursor.hidden = false;
      this.app.draw();
      return this.cursor.index;
    }
  }
  if (key.length > 1) {
    if (key == 'space') {
      this.text = pre + " " + suf;
      cI++;
    } else if (key == 'backspace' && cI > 0) {
      this.text = pre.substring(0, pre.length - 1) + suf;
      cI--;
    } else if (key == 'delete' && cI < this.text.length)
      this.text = pre + suf.substring(1);
    else if (key == 'left arrow' && cI > 0) cI--;
    else if (key == 'right arrow' && cI < this.text.length) cI++;
    else if (key == 'shift') this.cursor.shift = true;
    else if (key == 'semi-colon') {
      if (shift) this.text = pre + ':' + suf;
      else this.text = pre + ';' + suf;
      cI++;
    } else if (key == 'equal') {
      if (shift) this.text = pre + '+' + suf;
      else this.text = pre + '=' + suf;
      cI++;
    } else if (key == 'comma') {
      if (shift) this.text = pre + '<' + suf;
      else this.text = pre + ',' + suf;
      cI++;
    } else if (key == 'dash') {
      if (shift) this.text = pre + '_' + suf;
      else this.text = pre + '-' + suf;
      cI++;
    } else if (key == 'period') {
      if (shift) this.text = pre + '>' + suf;
      else this.text = pre + '.' + suf;
      cI++;
    } else if (key == 'forward slash') {
      if (shift) this.text = pre + '?' + suf;
      else this.text = pre + '/' + suf;
      cI++;
    } else if (key == 'grave accent') {
      if (shift) this.text = pre + '~' + suf;
      else this.text = pre + '`' + suf;
      cI++;
    } else if (key == 'open bracket') {
      if (shift) this.text = pre + '{' + suf;
      else this.text = pre + '[' + suf;
      cI++;
    } else if (key == 'back slash') {
      if (shift) this.text = pre + '|' + suf;
      else this.text = pre + "/" + suf;
      cI++;
    } else if (key == 'close bracket') {
      if (shift) this.text = pre + '}' + suf;
      else this.text = pre + ']' + suf;
      cI++;
    } else if (key == 'single quote') {
      if (shift) this.text = pre + '"' + suf;
      else this.text = pre + "'" + suf;
      cI++;
    }
  } else {
    if (shift || this.cursor.shift)
      this.text = pre + key.charAt(0).toUpperCase() + suf;
    else this.text = pre + key + suf;
    cI++;
  }
  if (this.showCursor) this.cursor.hidden = false;
  this.cursor.index = cI;
  this.app.draw();
  return cI;
};
//DEFINITION
iio.V = function(){ this.V.apply(this, arguments) };

//CONSTRUCTOR
iio.V.prototype.V = function(v,y) {
	this.x = v.x || v[0] || v || 0;
	this.y = v.y || v[1] || y || 0;
}

//STATIC FUNCTIONS
iio.V.add = function(v1, v2) {
	for (var p in v2)
	  if (v1[p]) v1[p] += v2[p];
	return v1
}
iio.V.sub = function(v1, v2) {
	for (var p in v2)
	  if (v1[p]) v1[p] -= v2[p];
	return v1
}
iio.V.mult = function(v1, v2) {
	for (var p in v2)
	  if (v1[p]) v1[p] *= v2[p];
	return v1
}
iio.V.div = function(v1, v2) {
	for (var p in v2)
	  if (v1[p]) v1[p] /= v2[p];
	return v1
}
iio.V.dist = function(v1, v2) {
	return Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2))
};iio = {};
iio.apps = [];
iio.scripts = iio.scripts || {};

//INITIALIZATION
iio.start = function(app, id, d) {

  var c = iio.canvas.prep(id, d);

  //initialize application with settings
  if (app instanceof Array)
    return new iio.App(c, app[0], app[1]);

  //run iio file
  else if (iio.is.string(app) && app.substring(app.length - 4) == '.iio')
    return iio.read(app, iio.start);

  //initialize application without settings
  return new iio.App(c, app);
}
iio.runScripts = function() {
  var scripts = Array.prototype.slice.call(document.getElementsByTagName('script'));
  var iioScripts = scripts.filter(function(s) {
    return s.type === 'text/iioscript';
  });
  iioScripts.forEach(function(script) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", script.src, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status == 0)){
        iio.scripts[script.src] = eval("(function() {\nreturn function(settings) {\n" + 
									   CoffeeScript.compile(xhr.responseText, {bare: true}) + 
									   "}\n})()");
        iio.start(iio.scripts[script.src]);
      }
    }
    xhr.send(null);
  });
}

//JS ADDITIONS
Array.prototype.insert = function(index, item) {
  this.splice(index, 0, item);
  return this;
}

//UTIL FUNCTIONS
function emptyFn() {};
iio.inherit = function(child, parent) {
  var tmp = child;
  emptyFn.prototype = parent.prototype;
  child.prototype = new emptyFn();
  child.prototype.constructor = tmp;
}
iio.merge = function(o1,o2){
  for(var p in o2)
    o1[p] = o2[p];
  return o1;
}
iio.addEvent = function(obj, evt, fn, capt) {
  if (obj.addEventListener) {
    obj.addEventListener(evt, fn, capt);
    return true;
  } else if (obj.attachEvent) {
    obj.attachEvent('on' + evt, fn);
    return true;
  } else return false;
}
iio.set = function(os, p) {
  os.forEach(function(o) {
    o.set(p);
  });
}
iio.random = function(min, max) {
  min = min || 0;
  max = (max === 0 || typeof(max) != 'undefined') ? max : 1;
  return Math.random() * (max - min) + min;
}
iio.randomInt = function(min, max) {
  min = min || 0;
  max = max || 1;
  return Math.floor(Math.random() * (max - min)) + min;
}

//IO
iio.load = function(src, onload) {
  var img = new Image();
  img.src = src;
  img.onload = onload;
  return img;
}
iio.read = function(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status == 0))
      return callback(xhr.responseText);
  }
  xhr.send(null);
}

//LOOPING
iio.loop = function(fps, caller, fn) {
  if (iio.is.number(fps) || typeof window.requestAnimationFrame == 'undefined' || !fps.af) {
    if (typeof(fps.af) != 'undefined' && typeof(fps.fps) == 'undefined') {
      fn = caller;
      caller = fps;
      fps = 60
    } else if (!iio.is.number(fps)) {
      caller = fps;
      fps = fps.fps;
    }

    function loop() {
      var n = new Date().getTime();
      if (typeof caller.last == 'undefined') var first = true;
      var correctedFPS = Math.floor(Math.max(0, 1000 / fps - (n - (caller.last || fps))));
      caller.last = n + correctedFPS;
      var nufps;
      if (typeof first == 'undefined') {
        if (typeof caller.fn == 'undefined')
          nufps = caller.o._update(caller.o, correctedFPS);
        else if (iio.is.fn(caller.fn))
          nufps = caller.fn(caller.o, caller, correctedFPS);
        else nufps = caller.fn._update(caller, correctedFPS);
        caller.o.app.draw();
      }
      if (typeof nufps == 'undefined')
        caller.id = window.setTimeout(loop, correctedFPS);
      else {
        fps = nufps;
        caller.id = window.setTimeout(loop, 1000 / nufps);
      }
      //if(fn)fn(caller,correctedFPS/(1000/fps));
    };
    caller.id = window.setTimeout(loop, 1000 / fps);
    return caller.id;
  } else {
    fn = caller;
    caller = fps;

    function animloop() {
      if (typeof caller.fn == 'undefined') caller.o.draw();
      else if (iio.is.fn(caller.fn)) caller.fn(caller.o);
      else {
        caller.fn._update();
        caller.fn.draw();
      }
      caller.o.app.draw();
      caller.id = window.requestAnimationFrame(animloop);
    }
    caller.id = window.requestAnimationFrame(animloop);
    return caller.id;
  }
}
iio.cancelLoop = function(l) {
  window.clearTimeout(l);
  window.cancelAnimationFrame(l);
}
iio.cancelLoops = function(o, c) {
  o.loops.forEach(function(loop) {
    iio.cancelLoop(loop.id);
  });
  if (o.mainLoop) iio.cancelLoop(o.mainLoop.id);
  if (typeof c == 'undefined')
    o.objs.forEach(function(obj) {
      iio.cancelLoops(obj);
    });
}

//INPUT LISTENERS
iio.resize = function() {
  iio.apps.forEach(function(app) {
    if (app.canvas.fullscreen) {
      if (window.jQuery) {
        app.canvas.width = $(window).width();
        app.canvas.height = $(window).height();
      } else {
        app.canvas.width = window.innerWidth;
        app.canvas.height = window.innerHeight;
      }
    }
    app.width = app.canvas.width;
    app.height = app.canvas.height;
    app.center.x = app.canvas.width / 2;
    app.center.y = app.canvas.height / 2;
    if (app.runScript && app.runScript.resize) app.runScript.resize();
    app.draw();
  });
}
iio.prep_input = function() {
  window.onresize = iio.resize;
  iio.addEvent(window, 'keydown', function(e) {
    var k = iio.key.string(e);
    iio.apps.forEach(function(app) {
      if (app.runScript && app.runScript.onKeyDown)
        app.runScript.onKeyDown(e, k);
    });
  });
  iio.addEvent(window, 'keyup', function(e) {
    var k = iio.key.string(e);
    iio.apps.forEach(function(app) {
      if (app.runScript && app.runScript.onKeyUp)
        app.runScript.onKeyUp(e, k);
    });
  });
  iio.addEvent(window, 'scroll', function(event) {
    iio.apps.forEach(function(app) {
      var p = app.canvas.getBoundingClientRect();
      app.pos = {
        x: p.left,
        y: p.top
      };
    });
  });
}
iio.prep_input();

//DEPRECATED
iio.createGradient = function(ctx, g) {
  var gradient;
  var p = g.split(':');
  var ps = p[1].split(',');
  if (ps.length == 4)
    gradient = ctx.createLinearGradient(ps[0], ps[1], ps[2], ps[3]);
  else gradient = ctx.createRadialGradient(ps[0], ps[1], ps[2], ps[3], ps[4], ps[5]);
  var c;
  p.forEach(function(_p) {
    c = _p.indexOf(',');
    var a = parseFloat(_p.substring(0, c));
    var b = _p.substring(c + 1);
    gradient.addColorStop(a, b);
  });
  return gradient;
}

// Listen for window load, both in decent browsers and in IE
if (window.addEventListener)
  window.addEventListener('DOMContentLoaded', iio.runScripts, false);
else
  window.attachEvent('onload', iio.runScripts);
;//UTIL LIBRARIES
iio.is = {
  fn: function(fn) {
    return typeof fn === 'function'
  },
  number: function(o) {
    if (typeof o === 'number') return true;
    return (o - 0) == o && o.length > 0;
  },
  string: function(s) {
    return typeof s == 'string' || s instanceof String
  },
  image: function(img) {
    return ['png', 'jpg', 'gif', 'tiff'].some(
      function(ie) {
        return (img.indexOf('.' + ie) != -1)
      });
  },
  between: function(val, min, max) {
    if (max < min) {
      var tmp = min;
      min = max;
      max = tmp;
    }
    return (val >= min && val <= max);
  }
}

iio.convert = {
  color: function(c){
    if(c.toLowerCase()=='white') return new iio.Color(255,255,255);
    if(c.toLowerCase()=='black') return new iio.Color();
    if(c.toLowerCase()=='red') return new iio.Color(255);
    if(c.toLowerCase()=='green') return new iio.Color(0,255);
    if(c.toLowerCase()=='blue') return new iio.Color(0,0,255);
  }
}

iio.point = {
  rotate: function(x, y, r) {
    if (typeof x.x != 'undefined') {
      r = y;
      y = x.y;
      x = x.x;
    }
    if (typeof r == 'undefined' || r == 0) return {
      x: x,
      y: y
    }
    var newX = x * Math.cos(r) - y * Math.sin(r);
    var newY = y * Math.cos(r) + x * Math.sin(r);
    return {
      x: newX,
      y: newY
    };
  },
  vector: function(points) {
    var vecs = [];
    if (!(points instanceof Array)) points = [points];
    for (var i = 0; i < points.length; i++) {
      if (typeof points[i].x != 'undefined')
        vecs.push(points[i]);
      else {
        vecs.push({
          x: points[i],
          y: points[i + 1]
        });
        i++;
      }
    }
    return vecs;
  }
}

iio.key = {
  string: function(e) {
    switch (e.keyCode) {
      case 8:
        return 'backspace';
      case 9:
        return 'tab';
      case 13:
        return 'enter';
      case 16:
        return 'shift';
      case 17:
        return 'ctrl';
      case 18:
        return 'alt';
      case 19:
        return 'pause';
      case 20:
        return 'caps lock';
      case 27:
        return 'escape';
      case 32:
        return 'space';
      case 33:
        return 'page up';
      case 34:
        return 'page down';
      case 35:
        return 'end';
      case 36:
        return 'home';
      case 37:
        return 'left arrow';
      case 38:
        return 'up arrow';
      case 39:
        return 'right arrow';
      case 40:
        return 'down arrow';
      case 45:
        return 'insert';
      case 46:
        return 'delete';
      case 48:
        return '0';
      case 49:
        return '1';
      case 50:
        return '2';
      case 51:
        return '3';
      case 52:
        return '4';
      case 53:
        return '5';
      case 54:
        return '6';
      case 55:
        return '7';
      case 56:
        return '8';
      case 57:
        return '9';
      case 65:
        return 'a';
      case 66:
        return 'b';
      case 67:
        return 'c';
      case 68:
        return 'd';
      case 69:
        return 'e';
      case 70:
        return 'f';
      case 71:
        return 'g';
      case 72:
        return 'h';
      case 73:
        return 'i';
      case 74:
        return 'j';
      case 75:
        return 'k';
      case 76:
        return 'l';
      case 77:
        return 'm';
      case 78:
        return 'n';
      case 79:
        return 'o';
      case 80:
        return 'p';
      case 81:
        return 'q';
      case 82:
        return 'r';
      case 83:
        return 's';
      case 84:
        return 't';
      case 85:
        return 'u';
      case 86:
        return 'v';
      case 87:
        return 'w';
      case 88:
        return 'x';
      case 89:
        return 'y';
      case 90:
        return 'z';
      case 91:
        return 'left window';
      case 92:
        return 'right window';
      case 93:
        return 'select key';
      case 96:
        return 'n0';
      case 97:
        return 'n1';
      case 98:
        return 'n2';
      case 99:
        return 'n3';
      case 100:
        return 'n4';
      case 101:
        return 'n5';
      case 102:
        return 'n6';
      case 103:
        return 'n7';
      case 104:
        return 'n8';
      case 105:
        return 'n9';
      case 106:
        return 'multiply';
      case 107:
        return 'add';
      case 109:
        return 'subtract';
      case 110:
        return 'dec';
      case 111:
        return 'divide';
      case 112:
        return 'f1';
      case 113:
        return 'f2';
      case 114:
        return 'f3';
      case 115:
        return 'f4';
      case 116:
        return 'f5';
      case 117:
        return 'f6';
      case 118:
        return 'f7';
      case 119:
        return 'f8';
      case 120:
        return 'f9';
      case 121:
        return 'f10';
      case 122:
        return 'f11';
      case 123:
        return 'f12';
      case 144:
        return 'num lock';
      case 156:
        return 'scroll lock';
      case 186:
        return 'semi-colon';
      case 187:
        return 'equal';
      case 188:
        return 'comma';
      case 189:
        return 'dash';
      case 190:
        return 'period';
      case 191:
        return 'forward slash';
      case 192:
        return 'grave accent';
      case 219:
        return 'open bracket';
      case 220:
        return 'back slash';
      case 221:
        return 'close bracket';
      case 222:
        return 'single quote';
      default:
        return 'undefined';
    }
  },
  code_is: function(keys, event) {
    if (!(keys instanceof Array)) keys = [keys];
    var str = iio.key.string(event);
    return keys.some(function(key) {
      return key === str;
    });
  }
}

iio.canvas = {
  create: function(w, h) {
    var c = document.createElement('canvas');

    //create with size
    if (w) {
      c.width = w;
      c.height = h;
    }

    //create fullscreen
    else {
      c.margin = 0;
      c.padding = 0;
      c.style.position = 'absolute';
      c.fullscreen = true;
      if (window.jQuery) {
        c.width = $(document).width();
        c.height = $(document).height();
      } else {
        c.width = window.innerWidth;
        c.height = window.innerHeight;
      }
    }

    return c;
  },
  prep: function(id, d) {
    var c;

    //create with element id
    if (id) {
      c = document.getElementById(id);
      if (!c) {

        //create with existing canvas
        if (id.tagName == 'CANVAS') c = id;

        //create in existing element
        else if (iio.is.number(id) || id.x) {
          c = iio.canvas.create(id.x || id, id.y || id);
          if (d) d.appendChild(c);
          else document.body.appendChild(c);
        }
      }
      //create fullscreen
    } else {
      iio.canvas.prep_fullscreen();
      c = iio.canvas.create();
      document.body.appendChild(c);
    }
    return c;
  },
  prep_fullscreen: function() {
    document.body.style.margin = 0;
    document.body.style.padding = 0;
  },
  prep_input: function(o) {
    o.onmousedown = function(e) {
      var ep = this.parent.convertEventPos(e);
      if (this.parent.click) this.parent.click(e, ep);
      this.parent.objs.forEach(function(obj, i) {
        if (i !== 0) ep = this.parent.convertEventPos(e);
        if (obj.contains && obj.contains(ep))
          if (obj.click) {
            if (obj.cellAt) {
              var c = obj.cellAt(ep);
              obj.click(e, ep, c, obj.cellCenter(c.c, c.r));
            } else obj.click(e, ep);
          }
      }, this)
    }
  }
}

iio.collision = {
  check: function(o1, o2) {
    if (typeof(o1) == 'undefined' || typeof(o2) == 'undefined') return false;
    if (o1.type == iio.RECT && o2.type == iio.RECT) {
      if (o1.simple) {
        if (o2.simple) return iio.collision.rectXrect(
          o1.pos.x - o1.bbx[0], o1.pos.x + o1.bbx[0], o1.pos.y - (o1.bbx[1] || o1.bbx[0]), o1.pos.y + (o1.bbx[1] || o1.bbx[0]),
          o2.pos.x - o2.bbx[0], o2.pos.x + o2.bbx[0], o2.pos.y - (o2.bbx[1] || o2.bbx[0]), o2.pos.y + (o2.bbx[1] || o2.bbx[0]));
        else return iio.collision.rectXrect(
          o1.pos.x - o1.bbx[0], o1.pos.x + o1.bbx[0], o1.pos.y - (o1.bbx[1] || o1.bbx[0]), o1.pos.y + (o1.bbx[1] || o1.bbx[0]),
          o2.left, o2.right, o2.top, o2.bottom);
      } else if (o2.simple) return iio.collision.rectXrect(o1.left, o1.right, o1.top, o1.bottom,
        o2.pos.x - o2.bbx[0], o2.pos.x + o2.bbx[0], o2.pos.y - (o2.bbx[1] || o2.bbx[0]), o2.pos.y + (o2.bbx[1] || o2.bbx[0]));
      else return iio.collision.rectXrect(o1.left, o1.right, o1.top, o1.bottom, o2.left, o2.right, o2.top, o2.bottom)
    }
  },
  rectXrect: function(r1L, r1R, r1T, r1B, r2L, r2R, r2T, r2B) {
    if (r1L < r2R && r1R > r2L && r1T < r2B && r1B > r2T) return true;
    return false;
  }
}