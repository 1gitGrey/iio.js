show_demo_index = function(){
  page.append(h1('iio.js App Demos'));
  page.append('<h3>click any app to view the source code</h3>');
  var iioApps = document.createElement('div');
  iioApps.className = 'iioapps';
  page.append(iioApps);
  add_demo_preview( iioApps, ScrollShooter, "ScrollShooter" );
  add_demo_preview( iioApps, Snake, "Snake" );
  add_demo_preview( iioApps, ColorGrid, "ColorGrid", {w:20} );
  add_demo_preview( iioApps, ColorLines, "ColorLines", { lineWidth:20 } );
  add_demo_preview( iioApps, MineSweeper, "MineSweeper", { color: new iio.Color(255,255,255) } );
  add_demo_preview( iioApps, Squares, "Squares" );
  add_demo_preview( iioApps, Snow, "Snow" );
  add_demo_preview( iioApps, TicTacToe, "TicTacToe" );
  page.append(clear);

  show_unit_test(page, iio.test.Line, 'Line', 0);
  show_unit_test(page, iio.test.Text, 'Text', 1);
  show_unit_test(page, iio.test.Circle, 'Circle', 2);
  show_unit_test(page, iio.test.Rectangle, 'Rectangle', 3);
  show_unit_test(page, iio.test.Polygon, 'Polygon', 4);
  show_unit_test(page, iio.test.Grid, 'Grid', 5);
}

add_demo_preview = function( elem, app, title, settings ){
  create_demo_canvas( elem, 200, title )
  $('#'+title).click(function(){
    goTo('#demos-'+title);
    return false;
  });
  if(settings)
    iio.start([ app, iio.merge( { preview:true }, settings ) ], title );
  else 
    iio.start([ app, { preview:true } ], title );
}

show_demo = function( app, title, settings){
  $('#column').hide();
  $('#header').css({ 'left': 0, 'margin-left': 0 });
  $('#footer').css({ 'left': 0, 'margin-left': 0 });
  $('#header').append('<div id="fullscreen_header"><a id="back" href="">&lt;&lt; back</a> | <h1>'+title+'</h1> | <a id="source" href="">source code</a> </div>');
  $('#back').click(function(){
    window.history.back()
  });
  $('#source').click(function(e){
    codeWindow = window.open("demos/source-code/"+title+".html", "littleWindow", "location=no,menubar=no,toolbar=no,width=700,height=800,left=0"); 
    codeWindow.moveTo(0,0);
    return false;
  });
  if( settings )
    iio.start( [ app, settings ] );
  else iio.start( app )
}

function create_demo_canvas( elem, SIZE, id ){
  
  var canvas, container, h, p;
  
  container = document.createElement('div');
  container.className += "demo_wrap";

  h = document.createElement('h4');
  h.innerHTML = id;
  h.className += "demo_title";

  canvas = document.createElement('canvas');
  canvas.id = id;
  canvas.width = SIZE;
  canvas.height = SIZE;
  canvas.className += "demo";
  /*canvas.codeurl = testcode_url(R,C);
  canvas.onclick = function(e){
    codeWindow = window.open(this.codeurl, "littleWindow", "location=no,menubar=no,toolbar=no,width=500,height=600,left=0"); 
    codeWindow.moveTo(0,0);
  }*/
  
  container.appendChild(canvas);
  container.appendChild(h);
  elem.appendChild(container);
  return canvas;
}