srcPath = 'src/core';

// Files will be concatenated in the following order
coreSrc = [
  'license',
  'core.js',
  'libs.js',
  'Interface.js',
  'Vector.js',
  'Color.js',
  'Gradient.js',
  'Drawable.js',
  'SpriteMap.js',
  'Shape.js',
  'Ellipse.js',
  'Polygon.js',
  'Line.js',
  'Text.js',
  'Rectangle.js',
  'Grid.js',
  'Quad.js',
  'QuadGrid.js',
  'App.js',
  'Sound.js',
  'Loader.js',
  'AttachBox2d.js'
].map(function(filename) { return srcPath + '/' + filename });

module.exports = function(grunt) {
  grunt.initConfig({
    concat: {
      options: {
        separator: '\n'
      },
      iio: {
        src: coreSrc,
        dest: 'build/iio.js',
        nonull: true
      },
      debug: {
        src: ['<%= concat.iio.dest %>', 'src/extras/*.js'],
        dest: 'build/iio_debug.js',
        nonull: true
      }
    },
    uglify: {
      iio: {
        options: {
          preserveComments: require('uglify-save-license')
        },
        files: {
          'build/iio.min.js': ['<%= concat.iio.dest %>']
        }
      },
      /*debug: {
        files: {
          'build/iio_debug.min.js': ['<%= concat.debug.dest %>']
        }
      }*/
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['concat:iio', 'uglify:iio']);
  grunt.registerTask('debug', ['concat', 'uglify']);
};

