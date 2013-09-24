<ol class="breadcrumb">
	<li><a href="/">Übersicht</a></li>
	<li class="active">Suche</li>
</ol>


<form id="mobile-search-form" class="navbar-form navbar-right visible-xs" role="search" method="GET" action="">
	<div class="" id="search-fields">
		<div class="form-group">
			<input type="text" class="form-control" placeholder="Search" name="query" value="">
		</div>
		<button type="submit" class="btn btn-default hide">Search</button>
	</div>
</form>

<div class="category search">
	<div class="{show_results}">
		<ul id="topics-container" data-search-query="{search_query}">
		<h3>Themen</h3>
		<div class="alert alert-info {show_no_topics}">Kein Thema gefunden!</div>
		<!-- BEGIN topics -->
		<a href="../../topic/{topics.slug}" id="tid-{topics.tid}">
			<li class="category-item">
				<div>
					<div class="col-md-12 img-thumbnail">
						<div class="search-result-post">
							<img src="{topics.teaser_userpicture}" />
							<strong>{topics.teaser_username}</strong>: <span class="search-result-text">{topics.title}</span>
						</div>

					</div>
				</div>
			</li>
		</a>
		<!-- END topics -->
		<h3>Beiträge</h3>
		<div class="alert alert-info {show_no_posts}">Keinen Beitrag gefunden!</div>
		<!-- BEGIN posts -->
		<a href="../../topic/{posts.topicSlug}#{posts.pid}" id="tid-{posts.tid}">
			<li class="category-item">
				<div>
					<div class="col-md-12 img-thumbnail">
						<div class="search-result-post">
							<img src="{posts.picture}" />
							<strong>{posts.username}</strong>: <span class="search-result-text">{posts.content}</span>
						</div>

					</div>
				</div>
			</li>
		</a>
		<!-- END posts -->
		</ul>
	</div>
</div>

<script type="text/javascript" src="{relative_path}/src/forum/search.js"></script>
