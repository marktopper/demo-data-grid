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
$(function() {

	// Setup DataGrid
    var dg = $.dg({
        url: {
            semantic: true,
            base: '/semantic'
        }
    });

    var grid = dg.add('standard', {
        source: '{{ URL::to('source') }}',
        pagination: {
            throttle: 20
        },
        loader: {
            selector: '.loader'
        }
    }).on('dg:applying', function(filter) {
        console.log(this, filter);
    });

	// Date Picker
	$('.datePicker').datetimepicker({
		pickTime: false
	});

	/**
	 * DEMO ONLY EVENTS
	 */
	$('[data-per-page]').on('change', function() {
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

			<ul class="dropdown-menu" role="menu" data-grid="standard" data-grid-group="mainfilters" data-grid-reset-group>
				<li><a href="#" data-grid-filter="country:us" data-grid-query="country:United States" data-grid-label="United States">United States</a></li>
				<li><a href="#" data-grid-filter-default data-grid-filter="country:canada" data-grid-query="country:Canada" data-grid-label="Canada">Canada</a></li>
				<li><a href="#" data-grid-filter="population_over_10000" data-grid-query="population:>:10000" data-grid-label="population:Population >:10000">Populations > 10000</a></li>
				<li><a href="#" data-grid-filter="population:5000" data-grid-query="population:=:5000" data-grid-label="population:Populations is:5000">Populations = 5000</a></li>
				<li><a href="#" data-grid-filter="population_over_5000" data-grid-query="population:>:5000" data-grid-label="Populations over 5000">Populations > 5000</a></li>
				<li><a href="#" data-grid-filter="population_less_5000" data-grid-query="population:<:5000" data-grid-label="Populations less 5000">Populations < 5000</a></li>
				<li><a href="#" data-grid-filter="us_washington_5000" data-grid-query="country:United States; subdivision:washington; population:<:5000" data-grid-label="country:Country:United States; subdivision:Subdivision:Washington; population:Population:5000">Washington, United States < 5000</a></li>
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
				<li><a href="#" data-grid="standard" data-grid-download="csv">Export to CSV</a></li>
				<li><a href="#" data-grid="standard" data-grid-download="json">Export to JSON</a></li>
				<li><a href="#" data-grid="standard" data-grid-download="pdf">Export to PDF</a></li>
			</ul>

		</div>

	</div>

	{{-- Date picker : Start date --}}
	<div class="col-md-2">

		<div class="form-group">

			<div class="input-group datePicker"
                 data-grid="standard"
                 data-grid-filter="created"
                 data-grid-type="range"
                 data-grid-query="created_at"
                 data-grid-range="start"
                 data-grid-date
                 data-grid-client-date-format="MMM DD, YYYY"
                 data-grid-server-date-format
                 data-grid-label="Created At"
            >

                <input type="text" data-format="MMM DD, YYYY" disabled class="form-control" placeholder="Start Date">

				<span class="input-group-addon" style="cursor: pointer;"><i class="fa fa-calendar"></i></span>

			</div>

		</div>

	</div>

	{{-- Date picker : End date --}}
	<div class="col-md-2">

		<div class="form-group">

			<div class="input-group datePicker" data-grid="standard"
                 data-grid-filter="created"
                 data-grid-type="range"
                 data-grid-query="created_at"
                 data-grid-range="end"
                 data-grid-date
                 data-grid-client-date-format="MMM DD, YYYY"
                 data-grid-server-date-format
                 data-grid-label="Created At"
            >

                <input type="text" data-format="MMM DD, YYYY" disabled
                       class="form-control" placeholder="End Date">

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

		<form data-grid-search data-grid="standard" class="form-inline" role="form">

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

	<div class="applied-filters" data-grid-layout="filters" data-grid="standard"></div>

</div>

{{-- Results --}}
<div class="row">

	<div class="col-lg-12">

		<div class="table-responsive">

			<table class="table table-striped table-bordered table-hover" data-grid-layout="results" data-grid="standard">

				<thead>
					<tr>
						<th class="sortable col-md-4" data-grid="standard" data-grid-sort="country">Country</th>
						<th class="sortable col-md-3" data-grid-sort-default data-grid="standard" data-grid-sort="subdivision">Subdivision</th>
						<th class="sortable col-md-3" data-grid="standard" data-grid-sort="city">City</th>
						<th class="sortable col-md-2" data-grid="standard" data-grid-sort="population">Population</th>
					</tr>
				</thead>
				<tbody></tbody>
			</table>

		</div>

	</div>

</div>

{{-- Pagination --}}
<footer id="pagination" data-grid-layout="pagination" data-grid="standard"></footer>

@include('templates/standard/results')
@include('templates/standard/filters')
@include('templates/standard/pagination')

@stop
