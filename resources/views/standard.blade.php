@extends('layouts.default')

{{-- Page title --}}
@section('title')
@parent
: Standard
@stop

{{-- Inline styles --}}
@section('styles')
<link rel="stylesheet" href="{{ URL::asset('assets/css/datepicker.css') }}">
<link rel="stylesheet" href="{{ URL::asset('assets/css/jquery.nouislider.min.css') }}">
@stop

{{-- Inline scripts --}}
@section('scripts')
<script src="{{ URL::asset('assets/js/moment.js') }}"></script>
<script src="{{ URL::asset('assets/js/bootstrap-datetimepicker.js') }}"></script>
<script src="{{ URL::asset('assets/js/jquery.nouislider.all.min.js') }}"></script>

<script>
$(function() {

    // Setup DataGrid
    var grid = $.datagrid('standard', {
        source: '{{ URL::to('source') }}',
        pagination: {
            throttle: 20
        },
        multiple: true,
        loader: {
            selector: '.loader'
        },
        filters: {
            'mexico:large': {
                type: 'term',
                label: 'Large Mexico cities',
                default: true,
                query: [
                    {
                        column: 'country',
                        value: 'Mexico',
                        operator: '='
                    },
                    {
                        column: 'population',
                        value: '10000',
                        operator: '>='
                    }
                ]
            },
            'mexico:small': {
                type: 'term',
                label: 'Small Mexico cities',
                query: [
                    {
                        column: 'country',
                        value: 'Mexico',
                        operator: '='
                    },
                    {
                        column: 'population',
                        value: '10000',
                        operator: '<'
                    }
                ]
            }
        }
    }).on('dg:applying', function(filter) {

        if (filter.name === 'population') {
            $('.populationSlider').val([filter.query.from, filter.query.to]);
        }

        console.log(this, filter);
    });

    // Date Picker
    $('.datePicker').datetimepicker({
        pickTime: false
    });

    $('.populationSlider').noUiSlider({
        start: [0, 100000],
        step: 100,
        connect: true,
        range: {
            'min': 0,
            'max': 100000
        },
        format: {
            to: function(value) {
                return parseInt(value);
            },

            from: function(value) {
                return parseInt(value);
            }
        }
    }).on('change', function() {
        var range = $(this).val();
        console.log('change', range);
        $(this).data('grid-query', ['population', ':', range[0], ':', range[1]].join(''));
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

			<ul class="dropdown-menu" role="menu" data-grid="standard" data-grid-group="mainfilters">
				<li><a href="#" data-grid-filter="country:us" data-grid-query="country:United States" data-grid-sort="subdivision:asc;population:asc" data-grid-label="United States">United States</a></li>
				<li><a href="#" data-grid-filter="country:canada" data-grid-query="country:Canada" data-grid-label="Canada">Canada</a></li>
				<li><a href="#" data-grid-filter="population_over_10000" data-grid-query="population:>:10000" data-grid-label="population:Population >:10000">Populations > 10000</a></li>
                <li><a href="#" data-grid-filter="mexico:large">Large Mexico cities</a></li>
                <li><a href="#" data-grid-filter="mexico:small">Small Mexico cities</a></li>
				<li><a href="#">DSADSA</a></li>
				<li><a href="#" data-grid-filter="population_over_5000" data-grid-query="population:>:5000" data-grid-label="Populations over 5000">Populations > 5000</a></li>
				<li><a href="#" data-grid-filter="population_less_5000" data-grid-query="population:<:5000" data-grid-label="Populations less 5000">Populations < 5000</a></li>
				<li><a href="#" data-grid-filter="us_washington_5000" data-grid-query="country:United States; subdivision:washington; population:<:5000" data-grid-label="Country: United States; Subdivision: Washington; Population: 5000">Washington, United States < 5000</a></li>

                @foreach (range(10000, 10000000, 10000) as $index)
                    <li>
                        <a href="#" data-grid-filter="population_{{$index}}" data-grid-query="population:>:{{$index}}" data-grid-label="Population > {{$index}}">
                            Foo{{ $index }}
                        </a>
                    </li>
                @endforeach
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

	<div class="col-md-5">

		<form data-grid-search data-grid-reset-filter data-grid="standard" class="form-inline" role="form">

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
<br>
<div class="row">

    {{-- Date picker : Start date --}}
    <div class="col-md-2">

        <div class="form-group">

            <div class="input-group datePicker"
                 data-grid="standard"
                 data-grid-filter="created"
                 data-grid-type="range"
                 data-grid-query="created"
                 data-grid-range="start"
                 data-grid-date-format
                 data-grid-label="Created At">

                <input type="text" data-format="DD MMM, YYYY" disabled class="form-control" placeholder="Start Date">

                <span class="input-group-addon" style="cursor: pointer;"><i class="fa fa-calendar"></i></span>

            </div>

        </div>

    </div>

    {{-- Date picker : End date --}}
    <div class="col-md-2">

        <div class="form-group">

            <div class="input-group datePicker"
                 data-grid="standard"
                 data-grid-filter="created"
                 data-grid-type="range"
                 data-grid-query="created"
                 data-grid-range="end"
                 data-grid-date-format
                 data-grid-label="Created At">

                <input type="text" data-format="DD MMM, YYYY" disabled class="form-control" placeholder="End Date">

                <span class="input-group-addon" style="cursor: pointer;"><i class="fa fa-calendar"></i></span>

            </div>

        </div>

    </div>

    <div class="col-md-3" style="padding-top: 7px;">

        <div class="populationSlider"
             data-grid="standard"
             data-grid-filter="population"
             data-grid-type="range"
             data-grid-query="population:0:1000000"
             data-grid-label="Population">
        </div>

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
