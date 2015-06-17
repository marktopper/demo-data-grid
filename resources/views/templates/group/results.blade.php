<script type="text/template" data-grid="group" data-grid-template="results">

    <% var results = response.results; %>

    <% if (_.isEmpty(results)) { %>

        <tr>
            <td colspan="4">No Results</td>
        </tr>

    <% } else { %>

        <% _.each(results, function(r) { %>

            <tr>
                <td><%= r.country %></td>
                <td><%= r.subdivision %></td>
                <td><%= r.city %></td>
                <td><%= r.population %></td>
            </tr>

        <% }); %>

    <% } %>

</script>

