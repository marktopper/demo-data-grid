<script type="text/template" data-grid="infinite" data-grid-template="results">

    <% var results = response.results; %>

    <% if (_.isEmpty(results)) { %>
        <li>
            No Results
        </li>
    <% } else { %>

        <div class="row">

            <% _.each(results, function(r) { %>

                <li class="col-md-4">
                    <div class="wrapper">
                        <h2><%= r.city %>
                            <small><%= r.subdivision %></small>
                        </h2>

                        <span><%= r.population %></span>
                    </div>
                </li>

            <% }); %>

        </div>
    <% } %>

</script>
