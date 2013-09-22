		<ol class="breadcrumb">
			<li><a href="/">Übersicht</a></li>
			<li class="active">{category_name}</li>
			<div id="category_active_users"></div>
		</ol>
		<ul class="topics">
			<!-- BEGIN topics -->
			<li>
				<span class="timestamp">{topics.teaser_timestamp}</span>
				<a href="../../topic/{topics.slug}">{topics.title} ({topics.postcount})</a>
				<div class="teaser">
					<img class="img-thumbnail" src="{topics.teaser_userpicture}" />
					<p>
						vor {topics.teaser_text} &mdash; {topics.teaser_timestamp}
					</p>
					<div class="clear"></div>
				</div>
			</li>
			<!-- END topics -->
		</ul>
		<footer id="footer" class="container">
			<div class="copyright"><a href="/">Übersicht</a> | <a href="/impressum.html">Impressum</a> | <a href="//github.com/nodecode/nodeforum.de">Quellcode</a><br />
			Copyright &copy; 2013 <a href="http://nodeforum.de">nodeforum.de</a>, powered by <a target="_blank" href="http://www.nodebb.org">NodeBB</a>
		</footer>
