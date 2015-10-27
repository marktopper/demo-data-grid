<script type="text/template" data-grid="standard" data-grid-template="results">

    <% var results = response.results; %>

    <% if (_.isEmpty(results)) { %>
        <tr>
            <td colspan="4">No Results</td>
        </tr>
    <% } else { %>

        <% _.each(results, function(r) { %>

            <tr>
                <td><%= r.track_id %></td>
                <td><%= r.title %></td>
            </tr>

        <% }); %>

    <% } %>

</script>

