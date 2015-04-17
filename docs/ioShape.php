<?php 
	chdir('../');
    include('inc/redirector.php');
    $homepath = '../';
    $title = 'ioShape';
  include('inc/docsGlobals.php');
	include('inc/preHeader.php');
	include('inc/header.php');
  	include('pan/ioObjsPan.php');
?>
	<section class="container right-container top docs">
        <div id='ad-right'>
    <script type="text/javascript"><!--
if (document.body.clientWidth > 1100){
google_ad_client = "ca-pub-1234510751391763";
/* iioEngine_docs-ioShape */
google_ad_slot = "1299905137";
google_ad_width = 120;
google_ad_height = 600;
}
//-->
</script>
<script type="text/javascript"
src="http://pagead2.googlesyndication.com/pagead/show_ads.js">
</script>
</div>
      <div class="docs-top">
        <a class="anchor top-anchor" name="overview">&nbsp;</a> 
        <h1>ioShape</h1>
        <h4>Extends :: <a href="ioObj.php">ioObj</a></h4>
        <p>The base class for all iio Shapes.</p>
        <p>This class exists only to give the shape classes a common root so that attaching new functions to them is easier. It does not add any new data on its own.</p>
        <p>The only function it has is an implementation of <span class="kwd">clone</span> that returns an <a href="">ioShape</a>. This function is otherwise identical to ioObj's <a href="ioObj.php#clone">clone</a> function.</p>
      </div>
<?php
  include('inc/footer.php');
?>
    </section>
</div>