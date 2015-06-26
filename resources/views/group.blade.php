@extends('layouts.default')

{{-- Page title --}}
@section('title')
group
@stop

{{-- Inline styles --}}
@section('styles')
<link rel="stylesheet" href="{{ URL::asset('assets/css/group.css') }}" >
@stop

{{-- Inline scripts --}}
@section('scripts')
<script>
$(function() {

	// Setup DataGrid
	var grid = $.datagrid('group', {
        source: '{{ URL::to('source') }}',
        pagination: {
            method: 'group',
            threshold: 1000,
            throttle: 20
        },
		sorting: {
			column: 'city',
			direction: 'asc'
		},
        loader: {
            selector: '.loader'
        }
    });
});
</script>
@stop

{{-- Page content --}}
@section('content')

<h1>Group Pagination</h1>

<hr>

<div class="row">

	<div class="col-md-12">

		<form data-grid-search data-grid="group" class="search">

			<input type="text" name="filter" placeholder="Filter All" class="search-input">

			<div class="loader">
				<div>
					<span></span>
				</div>
			</div>

			<button class="search-btn"><i class="fa fa-search"></i></button>

		</form>

	</div>

</div>

<div class="row">

	<div class="col-md-12">

		<div class="applied-filters" data-grid="group" data-grid-layout="filters"></div>

	</div>

</div>

<div class="row">

	<div class="col-md-12">

		<div class="tabbable tabs-right">

			<ul id="pagination" class="nav nav-tabs" data-grid="group" data-grid-layout="pagination"></ul>

		</div>

		<div class="table-responsive">

			<table class="table table-bordered table-hover" data-grid="group" data-grid-layout="results">
				<thead>
					<tr>
						<th class="sortable col-md-4" data-grid="group" data-grid-sort="country">Country</th>
						<th class="sortable col-md-3" data-grid="group" data-grid-sort="subdivision">Subdivision</th>
						<th class="sortable col-md-3" data-grid="group" data-grid-sort="city">City</th>
						<th class="sortable col-md-2" data-grid="group" data-grid-sort="population">Population</th>
					</tr>
				</thead>
				<tbody></tbody>
			</table>

		</div>

	</div>



</div>

@include('templates/group/results')
@include('templates/group/pagination')
@include('templates/group/filters')

@stop
