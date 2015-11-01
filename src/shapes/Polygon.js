/* Polygon
------------------
*/

//DEFINITION
iio.Polygon = function(){ this.Polygon.apply(this, arguments) };
iio.inherit(iio.Polygon, iio.Shape);
iio.Polygon.prototype._super = iio.Shape.prototype;

//CONSTRUCTOR
iio.Polygon.prototype.Polygon = function() {
  this._super.Shape.call(this,iio.merge_args(arguments));
}

//FUNCTIONS
iio.Polygon.prototype.finish_path_shape = function(ctx){
  if (this.color) ctx.fill();
  if (this.img) {
    if (this.noImageRounding)
      ctx.drawImage(this.img,
        iio.specVec( this.vs,
          function(v1,v2){if(v1.x>v2.x)return true;return false}).x,
        iio.specVec( this.vs,
          function(v1,v2){if(v1.y>v2.y)return true;return false}).y,
        iio.specVec( this.vs,
          function(v1,v2){if(v1.x<v2.x)return true;return false}).x
        - iio.specVec( this.vs,
          function(v1,v2){if(v1.x>v2.x)return true;return false}).x,
        iio.specVec( this.vs,
          function(v1,v2){if(v1.y>v2.y)return true;return false}).y
        - iio.specVec( this.vs,
          function(v1,v2){if(v1.y<v2.y)return true;return false}).y);
    else ctx.drawImage(this.img,
        Math.floor(iio.specVec( this.vs,
          function(v1,v2){if(v1.x>v2.x)return true;return false}).x),
        Math.floor(iio.specVec( this.vs,
          function(v1,v2){if(v1.y>v2.y)return true;return false}).y),
        Math.floor(iio.specVec( this.vs,
          function(v1,v2){if(v1.x<v2.x)return true;return false}).x
        - iio.specVec( this.vs,
          function(v1,v2){if(v1.x>v2.x)return true;return false}).x),
       Math.floor( iio.specVec( this.vs,
          function(v1,v2){if(v1.y>v2.y)return true;return false}).y
        - iio.specVec( this.vs,
          function(v1,v2){if(v1.y<v2.y)return true;return false}).y));
  }
  if (this.outline) ctx.stroke();
  if (this.clip) ctx.clip();
}
iio.Polygon.prototype.draw_shape = function(ctx) {
  ctx.beginPath();
  ctx.moveTo(this.vs[0].x, this.vs[0].y);
  if (this.bezier) {
    var _i = 0;
    for (var i = 1; i < this.vs.length; i++)
      ctx.this.bezierCurveTo(this.bezier[_i++] || this.vs[i - 1].x, 
        this.bezier[_i++] || this.vs[i - 1].y, 
        this.bezier[_i++] || this.vs[i].x, 
        this.bezier[_i++] || this.vs[i].y,
         this.vs[i].x, this.vs[i].y);
    if (!this.open) {
      i--;
      ctx.this.bezierCurveTo(this.bezier[_i++] || this.vs[i].x,
       this.bezier[_i++] || this.vs[i].y,
       this.bezier[_i++] || 0,
       this.bezier[_i++] || 0,
       0, 0);
    }
  } else for(var i=1; i<this.vs.length; i++)
    ctx.lineTo(this.vs[i].x, this.vs[i].y);
  if (typeof(this.open) == 'undefined' || !this.open)
    ctx.closePath();
  this.finish_path_shape(ctx);
}
iio.Polygon.prototype.contains = function(v, y) {
  v = this.localize(v,y);
  var i = j = c = 0;
  for (i = 0, j = this.vs.length - 1; i < this.vs.length; j = i++) {
    if (((this.vs[i].y > v.y) != (this.vs[j].y > v.y)) &&
      (v.x < (this.vs[j].x - this.vs[i].x) * (v.y - this.vs[i].y) / (this.vs[j].y - this.vs[i].y) + this.vs[i].x))
      c = !c;
  }
  return c;
}
iio.Polygon.prototype.trueVs = function() {
  var vs = [];
  for(var v,i=0;i<this.vs.length;i++){
    v = this.localizeRotation(this.vs[i].clone(),true);
    v.x += this.pos.x;
    v.y += this.pos.y;
    vs[i]=v;
  }
  return vs;
}
iio.Polygon.prototype.left = function(){ 
  return iio.specVec( this.trueVs(),
    function(v1,v2){
      if(v1.x>v2.x)
        return true;
      return false
    }).x
}
iio.Polygon.prototype.right = function(){ 
  return iio.specVec( this.trueVs(),
    function(v1,v2){
      if(v1.x<v2.x)
        return true;
      return false
    }).x 
}
iio.Polygon.prototype.top = function(){ 
  return iio.specVec( this.trueVs(),
    function(v1,v2){
      if(v1.y>v2.y)
        return true;
      return false}).y
}
iio.Polygon.prototype.bottom = function(){ 
  return iio.specVec( this.trueVs(),
    function(v1,v2){
      if(v1.y<v2.y)
        return true;
      return false}).y
}