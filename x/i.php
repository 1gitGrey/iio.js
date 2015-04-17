<!doctype html>
<html>
<head>
	<meta charset="utf-8">
    <title>iio &middot; I</title>
    <meta name="description" content="iio Experiment I">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="shortcut icon" type="favicon/png" href="http://iioengine.com/favicon.ico">
</head>
<body>
</body>
</html>
<script type="text/javascript" src="http://iioengine.com/js/iioEngine.min.js"></script>
<script type="text/javascript">
//AUTHOR: Sebastian Bierman-Lytle
//URL: iioEngine.com
//NOTE: try resizing your browser window. if you start with tall vertical column and continuously drag your window wider
//      the app produces some really interesting vertical patterns.

//LICENSE & INFO: https://raw.github.com/sbiermanlytle/iioengine/master/README.md 
I = function(io){

	io.setBGColor('black');

	init = function(){
		createBlock = function(x,y){
			return new iio.SimpleRect(x,y)
					.createWithAnim(spriteMap.getSprite(32,16,0,4,true))
					.addAnim(spriteMap.getSprite(32,16,6,6+4,true))
					.addAnim(spriteMap.getSprite(32,16,12,12+4,true))
					.addAnim(spriteMap.getSprite(32,16,18,18+4,true));
		}

		var grid = new iio.Grid(0,0,io.canvas,32,16)
			.setStrokeStyle('white');

	   var spriteMap = new iio.SpriteMap('http://iioengine.com/img/breakout/tiles.png',function(){

	    	resetAnim = function(){
	    		this.stopAnim(0);
	    		this.playAnim(iio.getRandomInt(10,30),io,resetAnim);
	    		this.setAnimKey(iio.getRandomInt(0,this.anims.length));
	    		return false;
	    	}

         var startColor=1;
         while (startColor == 1) 
            startColor = iio.getRandomInt(0,4);

			for (var i=0;i<grid.cells.length;i++)
				for (var j=0;j<grid.cells[i].length;j++)
					io.addObj(createBlock(
						grid.getCellCenter(i,j)))
                      .setAnimKey(startColor)
         			  	 .playAnim(iio.getRandomInt(10,30),io,resetAnim);
	    });
	}; init();

	this.onResize=function(){
      io.rmvAll();
      init();
    }
    
 }; iio.start(I);
</script>