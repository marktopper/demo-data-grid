<script type="text/template" data-grid="infinite" data-grid-template="pagination">

    <% var pagination = grid.buildPagination(response); %>

    <div class="col-md-12">

		<% _.each(pagination, function(p) { %>

			<a href="#" class="goto-page" data-grid="infinite" data-grid-page="<%= p.page %>">
				Load More
			</a>

		<% }); %>

	</div>

</script>
