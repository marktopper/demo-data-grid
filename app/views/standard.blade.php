@extends('layouts.default')

{{-- Page title --}}
@section('title')
@parent
: Standard
@stop

{{-- Inline styles --}}
@section('styles')
<link rel="stylesheet" href="{{ URL::asset('assets/css/datepicker.css') }}">
@stop

{{-- Inline scripts --}}
@section('scripts')
<script src="{{ URL::asset('assets/js/moment.js') }}"></script>
<script src="{{ URL::asset('assets/js/bootstrap-datetimepicker.js') }}"></script>

<script>
$(function()
{
	// Setup DataGrid
	var grid = $.datagrid('standard', '.table', '#pagination', '.applied-filters',
	{
		throttle: 20,
		loader: '.loader',
		callback: function(obj)
		{
			// Select the correct value on the per page dropdown
			$('[data-per-page]').val(obj.opt.throttle);

			// Disable the export button if no results
			$('button[name="export"]').prop('disabled', (obj.pagination.filtered === 0) ? true : false);
		}
	});

	// Date Picker
	$('.datePicker').datetimepicker({
		pickTime: false
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

<div class="loader" data-grid="standard">

	<div>
		<span></span>
	</div>

</div>

<div class="page-header">

	<h1>Standard Pagination</h1>

	<p class="lead">Filtering and paginating data has never been easier.</p>

</div>

<div class="row">

	{{-- Filters button --}}
	<div class="col-md-1">

		<div class="btn-group">

			<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
				Filters <span class="caret"></span>
			</button>

			<ul class="dropdown-menu" role="menu">
				<li><a href="#" data-grid="standard" data-filter="country:us" data-label="country:Country:United States">United States</a></li>
				<li><a href="#" data-grid="standard" data-filter="country:ca" data-label="country:Country:Canada">Canada</a></li>
				<li><a href="#" data-grid="standard" data-filter="population:>:10000" data-label="population:Population >:10000">Populations > 10000</a></li>
				<li><a href="#" data-grid="standard" data-filter="population:=:5000" data-label="population:Populations is:5000">Populations = 5000</a></li>
				<li><a href="#" data-grid="standard" data-filter="population:>:5000">Populations > 5000</a></li>
				<li><a href="#" data-grid="standard" data-filter="population:<:5000">Populations < 5000</a></li>
				<li><a href="#" data-grid="standard" data-filter="country:us, subdivision:washington, population:<:5000" data-label="country:Country:United States, subdivision:Subdivision:Washington, population:Population:5000">Washington, United States < 5000</a></li>
			</ul>

		</div>

	</div>

	{{-- Export button --}}
	<div class="col-md-1">

		<div class="btn-group">

			<button name="export" type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
				Export <span class="caret"></span>
			</button>

			<ul class="dropdown-menu" role="menu">
				<li><a href="#" data-grid="standard" data-download="csv">Export to CSV</a></li>
				<li><a href="#" data-grid="standard" data-download="json">Export to JSON</a></li>
				<li><a href="#" data-grid="standard" data-download="pdf">Export to PDF</a></li>
			</ul>

		</div>

	</div>

	{{-- Date picker : Start date --}}
	<div class="col-md-2">

		<div class="form-group">

			<div class="input-group datePicker" data-grid="standard" data-range-filter>

				<input type="text" data-format="DD MMM, YYYY" disabled class="form-control" data-range-start data-range-filter="created_at" data-label="Created At" placeholder="Start Date">

				<span class="input-group-addon" style="cursor: pointer;"><i class="fa fa-calendar"></i></span>

			</div>

		</div>

	</div>

	{{-- Date picker : End date --}}
	<div class="col-md-2">

		<div class="form-group">

			<div class="input-group datePicker" data-grid="standard" data-range-filter>

				<input type="text" data-format="DD MMM, YYYY" disabled class="form-control" data-range-end data-range-filter="created_at" data-label="Created At" placeholder="End Date">

				<span class="input-group-addon" style="cursor: pointer;"><i class="fa fa-calendar"></i></span>

			</div>

		</div>

	</div>

	{{-- Results per page --}}
	<div class="col-md-2">

		<div class="form-group">

			<select data-per-page class="form-control">
				<option>Per Page</option>
				<option value="10">10</option>
				<option value="20">20</option>
				<option value="30">30</option>
				<option value="40">40</option>
				<option value="50">50</option>
				<option value="100">100</option>
				<option value="200">200</option>
			</select>

		</div>

	</div>

	<div class="col-md-4">

		<form data-search data-grid="standard" class="form-inline" role="form">

			<div class="form-group">

				<select name="column" class="form-control">
					<option value="all">All</option>
					<option value="subdivision">Subdivision</option>
					<option value="city">City</option>
				</select>

			</div>

			<div class="form-group">

				<input type="text" name="filter" placeholder="Search" class="form-control">

			</div>

			<button type="submit" class="btn btn-default">Search</button>

		</form>

	</div>

</div>

{{-- Applied filters --}}
<div class="row">

	<div class="applied-filters" data-grid="standard"></div>

</div>

{{-- Results --}}
<div class="row">

	<div class="col-lg-12">

		<div class="table-responsive">

			<table class="table table-striped table-bordered table-hover" data-source="{{ URL::to('source') }}" data-grid="standard">

				<thead>
					<tr>
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

</div>

{{-- Pagination --}}
<footer id="pagination" data-grid="standard"></footer>

@include('templates/standard/results')
@include('templates/standard/no_results')
@include('templates/standard/pagination')
@include('templates/standard/filters')
@include('templates/standard/no_filters')

@stop
