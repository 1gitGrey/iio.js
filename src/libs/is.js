/* iio.is
------------------
*/
iio.is = {
  fn: function(fn) {
    return typeof fn === 'function'
  },
  number: function(o) {
    if (typeof o === 'number') return true;
    //return (o - 0) == o && o.length > 0;
  },
  string: function(s) {
    return typeof s == 'string' || s instanceof String
  },
  filetype: function(file, extensions) {
    return extensions.some(function(ext) {
      return (file.indexOf('.' + ext) != -1)
    });
  },
  image: function(file) {
    return this.filetype(file, ['png', 'jpg', 'gif', 'tiff']);
  },
  sound: function(file) {
    return this.filetype(file, ['wav', 'mp3', 'aac', 'ogg']);
  },
  between: function(val, min, max) {
    if (max < min) {
      var tmp = min;
      min = max;
      max = tmp;
    }
    return (val >= min && val <= max);
  },
  Polygon: function(o){
    if (o instanceof iio.Polygon
     || o instanceof iio.Rectangle
     || o instanceof iio.Grid
     || o instanceof iio.Text)
      return true;
    return false;
  },
  Circle: function(o){
    if (o instanceof iio.Ellipse && (!o.vRadius || o.radius === o.vRadius))
      return true;
    return false;
  },
  Quad: function(o){
    if (o instanceof iio.Quad
     || o instanceof iio.App
     || o instanceof iio.QuadGrid)
      return true;
    return false;
  }
}
