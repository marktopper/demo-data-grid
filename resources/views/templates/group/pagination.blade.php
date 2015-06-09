<script type="text/template" data-grid="group" data-template="pagination">

	<% _.each(pagination, function(p) { %>

		<% 	var rows = 1;

		for(i = 1; i <= p.pages; i++) {

			var start  = rows;
			var end    = rows + (p.per_page - 1);
			rows = end+1;

		 	if (p.page === i) { %>

			<li class="active"><a><%= start %> - <%= end %></span></a></li>

			<% } else { %>

			<li><a href="#" data-grid="standard" data-page="<%= i %>"><%= start %> - <%= end %></a></li>

			<% } %>

		<% } %>

	<% }); %>

</script>
