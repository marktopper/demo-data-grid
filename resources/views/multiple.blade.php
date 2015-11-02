@extends('layouts.default')

{{-- Page title --}}
@section('title')
@parent
: Multiple
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

    var dg = $.dg();

    var grid1 = dg.add('multi1', {
        source: '{{ URL::to('source') }}',
        pagination: {
            throttle: 2,
            threshold: 100
        },
        filters: {
            'mexico_large': {
                type: 'term',
                label: 'Large Mexico cities',
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
                        value: '5000',
                        operator: '<='
                    }
                ]
            }
        }
    }).on('dg:applying', function(filter) {
        if (filter.name === 'population') {
            $('.populationSlider[data-grid="multi1"]').val([filter.query.from, filter.query.to]);
        }
    }).on('dg:update', function(filter) {
        $('[data-per-page][data-grid="multi1"]').val(this.getThrottle());
    });

    var grid2 = dg.add('multi2', {
        source: '{{ URL::to('songs') }}',
        pagination: {
            throttle: 2,
            threshold: 100
        },
        filters: {
            'mexico_large': {
                type: 'term',
                label: 'Large Mexico cities',
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
            }
        }
    }).on('dg:applying', function(filter) {
        if (filter.name === 'population') {
            $('.populationSlider[data-grid="multi2"]').val([filter.query.from, filter.query.to]);
        }
    }).on('dg:update', function(filter) {
        $('[data-per-page][data-grid="multi2"]').val(this.getThrottle());
    });

    var grid3 = dg.add('multi3', {
        source: '{{ URL::to('songs') }}',
        pagination: {
            throttle: 3,
            threshold: 100
        },
        filters: {
            'mexico_large': {
                type: 'term',
                label: 'Large Mexico cities',
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
                        value: '5000',
                        operator: '<='
                    }
                ]
            }
        }
    }).on('dg:applying', function(filter) {
        if (filter.name === 'population') {
            console.log(filter);
            $('.populationSlider[data-grid="multi3"]').val([filter.query.from, filter.query.to]);
        }
    }).on('dg:update', function(filter) {
        $('[data-per-page][data-grid="multi3"]').val(this.getThrottle());
    });

    // window.grid2 = $.dg('multi2', {
    //     source: '{{ URL::to('source') }}',
    //     url: {
    //         hash: false
    //     },
    //     pagination: {
    //         throttle: 2
    //     },
    //     multiple: true,
    //     loader: {
    //         selector: '.loader'
    //     }
    // });


    // // Setup DataGrid
    // window.grid = $.dg('multi1', {
    //     source: '{{ URL::to('source') }}',
    //     hash: false,
    //     pagination: {
    //         throttle: 2
    //     },
    //     url: {
    //         hash: false
    //     },
    //     multiple: false,
    //     loader: {
    //         selector: '.loader'
    //     },
    //     // layouts: {
    //     //     results: {
    //     //         template: '[data-grid-template="results"]',
    //     //         layout: '[data-grid-layout="results"]'
    //     //     },
    //     //     filters: {
    //     //         template: '[data-grid-template="filters"]',
    //     //         layout: '[data-grid-layout="filters"]'
    //     //     },
    //     //     pagination: {
    //     //         template: '[data-grid-template="pagination"]',
    //     //         layout: '[data-grid-layout="pagination"]'
    //     //     },
    //     //     // results_ul: {
    //     //     //     template: '[data-grid-template="results_alt"]',
    //     //     //     layout: '[data-grid-layout="results_alt"]'
    //     //     // }
    //     // },
    //     filters: {
    //         'mexico_large': {
    //             type: 'term',
    //             label: 'Large Mexico cities',
    //             query: [
    //                 {
    //                     column: 'country',
    //                     value: 'Mexico',
    //                     operator: '='
    //                 },
    //                 {
    //                     column: 'population',
    //                     value: '10000',
    //                     operator: '>='
    //                 }
    //             ]
    //         },
    //         'mexico:small': {
    //             type: 'term',
    //             label: 'Small Mexico cities',
    //             query: [
    //                 {
    //                     column: 'country',
    //                     value: 'Mexico',
    //                     operator: '='
    //                 },
    //                 {
    //                     column: 'population',
    //                     value: '5000',
    //                     operator: '<='
    //                 }
    //             ]
    //         }
    //     }
    // });

    // window.grid2 = $.dg('multi2', {
    //     source: '{{ URL::to('source') }}',
    //     url: {
    //         hash: false
    //     },
    //     pagination: {
    //         throttle: 2
    //     },
    //     multiple: true,
    //     loader: {
    //         selector: '.loader'
    //     }
    // });

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
        $(this).data('grid-query', ['population', ':', range[0], ':', range[1]].join(''));
    });

    /**
	 * DEMO ONLY EVENTS
	 */
    $('[data-per-page][data-grid="multi1"]').on('change', function() {
        grid1.setThrottle($(this).val());
        grid1.refresh();
    });

    $('[data-per-page][data-grid="multi2"]').on('change', function() {
        grid2.setThrottle($(this).val());
        grid2.refresh();
    });

    $('[data-per-page][data-grid="multi3"]').on('change', function() {
        grid3.setThrottle($(this).val());
        grid3.refresh();
    });
});
</script>
@stop

{{-- Page content --}}
@section('content')

<div class="loader" data-grid="multi1">

    <div>
        <span></span>
    </div>

</div>

<div class="loader" data-grid="multi2">

    <div>
        <span></span>
    </div>

</div>

<div class="loader" data-grid="multi3">

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

			<ul class="dropdown-menu" role="menu" data-grid="multi1" data-grid-group="mainfilters">
				<li><a href="#" data-grid-filter="country:us" data-grid-query="country:United States" data-grid-sort="subdivision:asc;population:desc" data-grid-label="United States">United States</a></li>
				<li><a href="#" data-grid-filter="country:canada" data-grid-query="country:Canada" data-grid-label="Canada">Canada</a></li>
				<li><a href="#" data-grid-filter="population_over_10000" data-grid-query="population:>:10000" data-grid-label="population:Population >:10000">Populations > 10000</a></li>
                <li><a href="#" data-grid-filter="mexico_large" data-grid-sort="subdivision:asc;population:desc">Large Mexico cities</a></li>
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
				<li><a href="#" data-grid="multi1" data-grid-download="csv">Export to CSV</a></li>
				<li><a href="#" data-grid="multi1" data-grid-download="json">Export to JSON</a></li>
				<li><a href="#" data-grid="multi1" data-grid-download="pdf">Export to PDF</a></li>
			</ul>

		</div>

	</div>

	{{-- Results per page --}}
	<div class="col-md-2">

		<div class="form-group">

			<select data-per-page data-grid="multi1" class="form-control">
				<option>Per Page</option>
				<option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
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

		<form data-grid-search data-grid-reset-filter data-grid="multi1" class="form-inline" role="form">

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
                 data-grid="multi1"
                 data-grid-filter="created"
                 data-grid-type="range"
                 data-grid-query="created_at"
                 data-grid-range="start"
                 data-grid-date
                 data-grid-client-date-format="MMM DD, YYYY"
                 data-grid-label="Created At">

                <input type="text" data-format="MMM DD, YYYY" disabled class="form-control" placeholder="Start Date">

                <span class="input-group-addon" style="cursor: pointer;"><i class="fa fa-calendar"></i></span>

            </div>

        </div>

    </div>

    {{-- Date picker : End date --}}
    <div class="col-md-2">

        <div class="form-group">

            <div class="input-group datePicker"
                 data-grid="multi1"
                 data-grid-filter="created"
                 data-grid-type="range"
                 data-grid-query="created_at"
                 data-grid-range="end"
                 data-grid-date
                 data-grid-client-date-format="MMM DD, YYYY"
                 data-grid-label="Created At">

                <input type="text" data-format="MMM DD, YYYY" disabled class="form-control" placeholder="End Date">

                <span class="input-group-addon" style="cursor: pointer;"><i class="fa fa-calendar"></i></span>

            </div>

        </div>

    </div>

    <div class="col-md-3" style="padding-top: 7px;">

        <div class="populationSlider"
             data-grid="multi1"
             data-grid-filter="population"
             data-grid-type="range"
             data-grid-query="population:0:1000000"
             data-grid-label="Population">
        </div>

    </div>
</div>

{{-- Applied filters --}}
<div class="row">

	<div class="applied-filters" data-grid-layout="filters" data-grid="multi1"></div>

</div>

{{-- Results --}}
<div class="row">

	<div class="col-lg-12">

		<div class="table-responsive">

            <ul data-grid-layout="results_alt" data-grid="multi1"></ul>

			<table class="table table-striped table-bordered table-hover" data-grid-layout="results" data-grid="multi1">

				<thead>
					<tr>
						<th class="sortable col-md-4" data-grid="multi1" data-grid-sort="country">Country</th>
						<th class="sortable col-md-3" data-grid-sort-default data-grid="multi1" data-grid-sort="subdivision">Subdivision</th>
						<th class="sortable col-md-3" data-grid="multi1" data-grid-sort="city">City</th>
						<th class="sortable col-md-2" data-grid="multi1" data-grid-sort="population">Population</th>
					</tr>
				</thead>
				<tbody></tbody>
			</table>

		</div>

	</div>

</div>

{{-- Pagination --}}
<footer id="pagination" data-grid-layout="pagination" data-grid="multi1"></footer>








<div class="row">

    {{-- Filters button --}}
    <div class="col-md-1">

        <div class="btn-group">

            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
                Filters <span class="caret"></span>
            </button>

            <ul class="dropdown-menu" role="menu" data-grid="multi2" data-grid-group="mainfilters">
                <li><a href="#" data-grid-filter="country:us" data-grid-query="country:United States" data-grid-sort="subdivision:asc;population:desc" data-grid-label="United States">United States</a></li>
                <li><a href="#" data-grid-filter="country:canada" data-grid-query="country:Canada" data-grid-label="Canada">Canada</a></li>
                <li><a href="#" data-grid-filter="population_over_10000" data-grid-query="population:>:10000" data-grid-label="population:Population >:10000">Populations > 10000</a></li>
                <li><a href="#" data-grid-filter="mexico_large">Large Mexico cities</a></li>
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
                <li><a href="#" data-grid="multi2" data-grid-download="csv">Export to CSV</a></li>
                <li><a href="#" data-grid="multi2" data-grid-download="json">Export to JSON</a></li>
                <li><a href="#" data-grid="multi2" data-grid-download="pdf">Export to PDF</a></li>
            </ul>

        </div>

    </div>

    {{-- Results per page --}}
    <div class="col-md-2">

        <div class="form-group">

            <select data-per-page data-grid="multi2" class="form-control">
                <option>Per Page</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
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

        <form data-grid-search data-grid-reset-filter data-grid="multi2" class="form-inline" role="form">

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
                 data-grid="multi2"
                 data-grid-filter="created"
                 data-grid-type="range"
                 data-grid-query="created_at"
                 data-grid-range="start"
                 data-grid-date
                 data-grid-client-date-format="MMM DD, YYYY"
                 data-grid-label="Created At">

                <input type="text" data-format="MMM DD, YYYY" disabled class="form-control" placeholder="Start Date">

                <span class="input-group-addon" style="cursor: pointer;"><i class="fa fa-calendar"></i></span>

            </div>

        </div>

    </div>

    {{-- Date picker : End date --}}
    <div class="col-md-2">

        <div class="form-group">

            <div class="input-group datePicker"
                 data-grid="multi2"
                 data-grid-filter="created"
                 data-grid-type="range"
                 data-grid-query="created_at"
                 data-grid-range="end"
                 data-grid-date
                 data-grid-client-date-format="MMM DD, YYYY"
                 data-grid-label="Created At">

                <input type="text" data-format="MMM DD, YYYY" disabled class="form-control" placeholder="End Date">

                <span class="input-group-addon" style="cursor: pointer;"><i class="fa fa-calendar"></i></span>

            </div>

        </div>

    </div>

    <div class="col-md-3" style="padding-top: 7px;">

        <div class="populationSlider"
             data-grid="multi2"
             data-grid-filter="population"
             data-grid-type="range"
             data-grid-query="population:0:1000000"
             data-grid-label="Population">
        </div>

    </div>
</div>

{{-- Applied filters --}}
<div class="row">

    <div class="applied-filters" data-grid-layout="filters" data-grid="multi2"></div>

</div>

{{-- Results --}}
<div class="row">

    <div class="col-lg-12">

        <div class="table-responsive">

            <ul data-grid-layout="results_alt" data-grid="multi2"></ul>

            <table class="table table-striped table-bordered table-hover" data-grid-layout="results" data-grid="multi2">

                <thead>
                    <tr>
                        <th class="sortable col-md-8" data-grid="multi2" data-grid-sort="title">Track</th>
                        <th class="sortable col-md-4" data-grid-sort-default data-grid="multi2" data-grid-sort="duration">Duration</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>

        </div>

    </div>

</div>

{{-- Pagination --}}
<footer id="pagination" data-grid-layout="pagination" data-grid="multi2"></footer>





<div class="row">

    {{-- Filters button --}}
    <div class="col-md-1">

        <div class="btn-group">

            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
                Filters <span class="caret"></span>
            </button>

            <ul class="dropdown-menu" role="menu" data-grid="multi3" data-grid-group="mainfilters">
                <li><a href="#" data-grid-filter="country:us" data-grid-query="country:United States" data-grid-sort="subdivision:asc;population:desc" data-grid-label="United States">United States</a></li>
                <li><a href="#" data-grid-filter="country:canada" data-grid-query="country:Canada" data-grid-label="Canada">Canada</a></li>
                <li><a href="#" data-grid-filter="population_over_10000" data-grid-query="population:>:10000" data-grid-label="population:Population >:10000">Populations > 10000</a></li>
                <li><a href="#" data-grid-filter="mexico_large">Large Mexico cities</a></li>
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
                <li><a href="#" data-grid="multi3" data-grid-download="csv">Export to CSV</a></li>
                <li><a href="#" data-grid="multi3" data-grid-download="json">Export to JSON</a></li>
                <li><a href="#" data-grid="multi3" data-grid-download="pdf">Export to PDF</a></li>
            </ul>

        </div>

    </div>

    {{-- Results per page --}}
    <div class="col-md-2">

        <div class="form-group">

            <select data-per-page data-grid="multi3" class="form-control">
                <option>Per Page</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
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

        <form data-grid-search data-grid-reset-filter data-grid="multi3" class="form-inline" role="form">

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
                 data-grid="multi3"
                 data-grid-filter="created"
                 data-grid-type="range"
                 data-grid-query="created_at"
                 data-grid-range="start"
                 data-grid-date
                 data-grid-client-date-format="MMM DD, YYYY"
                 data-grid-label="Created At">

                <input type="text" data-format="MMM DD, YYYY" disabled class="form-control" placeholder="Start Date">

                <span class="input-group-addon" style="cursor: pointer;"><i class="fa fa-calendar"></i></span>

            </div>

        </div>

    </div>

    {{-- Date picker : End date --}}
    <div class="col-md-2">

        <div class="form-group">

            <div class="input-group datePicker"
                 data-grid="multi3"
                 data-grid-filter="created"
                 data-grid-type="range"
                 data-grid-query="created_at"
                 data-grid-range="end"
                 data-grid-date
                 data-grid-client-date-format="MMM DD, YYYY"
                 data-grid-label="Created At">

                <input type="text" data-format="MMM DD, YYYY" disabled class="form-control" placeholder="End Date">

                <span class="input-group-addon" style="cursor: pointer;"><i class="fa fa-calendar"></i></span>

            </div>

        </div>

    </div>

    <div class="col-md-3" style="padding-top: 7px;">

        <div class="populationSlider"
             data-grid="multi3"
             data-grid-filter="population"
             data-grid-type="range"
             data-grid-query="population:0:1000000"
             data-grid-label="Population">
        </div>

    </div>
</div>

{{-- Applied filters --}}
<div class="row">

    <div class="applied-filters" data-grid-layout="filters" data-grid="multi3"></div>

</div>

{{-- Results --}}
<div class="row">

    <div class="col-lg-12">

        <div class="table-responsive">

            <ul data-grid-layout="results_alt" data-grid="multi3"></ul>

            <table class="table table-striped table-bordered table-hover" data-grid-layout="results" data-grid="multi3">

                <thead>
                    <tr>
                        <th class="sortable col-md-8" data-grid="multi3" data-grid-sort="title">Track</th>
                        <th class="sortable col-md-4" data-grid-sort-default data-grid="multi3" data-grid-sort="duration">Duration</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>

        </div>

    </div>

</div>

{{-- Pagination --}}
<footer id="pagination" data-grid-layout="pagination" data-grid="multi3"></footer>






@include('templates/multiple/multi1/results')
@include('templates/multiple/multi1/filters')
@include('templates/multiple/multi1/pagination')

@include('templates/multiple/multi2/results')
@include('templates/multiple/multi2/filters')
@include('templates/multiple/multi2/pagination')

@include('templates/multiple/multi3/results')
@include('templates/multiple/multi3/filters')
@include('templates/multiple/multi3/pagination')

@stop
