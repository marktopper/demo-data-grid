<script type="text/template" data-grid="standard" data-template="filters">

	<% _.each(filters, function(f) { %>

		<button class="btn btn-default" data-grid-reset-filter="<%= f.name %>">

			<% if (f.from !== undefined && f.to !== undefined) { %>

				<% if (/[0-9]{4}-[0-9]{2}-[0-9]{2}/g.test(f.from) && /[0-9]{4}-[0-9]{2}-[0-9]{2}/g.test(f.to)) { %>

					<%- f.label %> <em><%- moment(f.from).format('MMM DD, YYYY') %> - <%- moment(f.to).format('MMM DD, YYYY') %></em>

				<% } else { %>

					<%- f.label %> <em><%- f.from %> - <%- f.to %></em>

				<% } %>

			<% } else if (f.label) { %>

				<%- f.label %>

			<% } else { %>

				<% if (f.query.column === 'all') { %>

					<%- f.query.value %>

				<% } else { %>

					<%- f.query.value %> in <em><%- f.query.column %></em>

				<% } %>

			<% } %>

			<span><i class="fa fa-times-circle"></i></span>

		</button>

	<% }); %>

</script>
