@extends('layouts.default')

{{-- Page title --}}
@section('title')
Standard Pagination
@stop

{{-- Inline scripts --}}
@section('scripts')
<script>
$(function()
{
	// Setup DataGrid
	var grid = $.datagrid('standard', '.table', '#pagination', '.applied-filters',
	{
		method: 'group',
		throttle: 100,
		//threshold: 1,
		loader: '.loading',
		sort: {
			column: 'id',
			direction: 'asc'
		},
		callback: function(obj)
		{
			//
		}
	});

	// Text Binding
	$('.hidden-select').change(function() {

		$('.options').find('li').text($('.hidden-select option:selected').text());

	});


	/**
	 * DEMO ONLY EVENTS
	 */
	$('[data-per-page]').on('change', function()
	{
		grid.setThrottle($(this).val());

		grid.refresh();
	});
});
</script>
@stop

{{-- Page content --}}
@section('content')

<div class="loader" data-grid="single">

	<div>
		<span></span>
	</div>

</div>


<div class="page-header">

	<h1>Standard Pagination</h1>

	<p class="lead">Filtering and paginating data has never been easier.</p>

</div>

<div class="row">

	<div class="col-md-12">

		<form data-search data-grid="standard" class="search">

			<div class="select">

				<select name="column" class="hidden-select">
					<option value="all">All</option>
					<option value="subdivision">Subdivision</option>
					<option value="city">City</option>
				</select>

				<ul class="options">
					<li>All</li>
				</ul>

			</div>

			<input type="text" name="filter" placeholder="Search" class="search-input">

			<div class="loading">Loading &hellip;</div>

			<button class="search-btn"><i class="fa fa-search"></i></button>

		</form>

	</div>

</div>

<div class="row">

	<div class="col-md-12">

		<div class="applied-filters" data-grid="standard"></div>

	</div>

</div>

<div class="row">

	<div class="col-md-12">

		<table class="table table-bordered table-striped" data-source="{{ URL::to('source') }}" data-grid="standard">
			<thead>
				<tr>
					<th data-sort="id" data-grid="standard" class="sortable">id</th>
					<th data-sort="country" data-grid="standard" class="sortable">Country</th>
					<th data-sort="subdivision" data-grid="standard" class="sortable">Subdivision</th>
					<th data-sort="city" data-grid="standard" class="sortable">City</th>
					<th data-sort="population" data-grid="standard" class="sortable">Population</th>
				</tr>
			</thead>
			<tbody></tbody>
		</table>

	</div>

</div>

<footer id="pagination" class="row text-center" data-grid="standard"></footer>

@include('templates/standard/results-tmpl')
@include('templates/standard/pagination-tmpl')
@include('templates/standard/filters-tmpl')
@include('templates/standard/no-results-tmpl')

@stop
