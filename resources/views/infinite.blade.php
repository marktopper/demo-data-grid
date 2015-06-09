@extends('layouts.default')

{{-- Page title --}}
@section('title')
Infinite
@stop

{{-- Inline styles --}}
@section('styles')
<link rel="stylesheet" href="{{ URL::asset('assets/css/infinite.css') }}" >
@stop

{{-- Inline scripts --}}
@section('scripts')
<script>
$(function()
{
	// Setup DataGrid
	var grid = $.datagrid('infinite', '.infinite', '#pagination', '.applied-filters',
	{
		loader: '.loader',
		method: 'infinite',
		// infinite_scroll: true, // Optional, will auto load more results on scroll
		// scroll_offset: 1000,   // Optional, defaults to 400 from bottom
		throttle: 21,
		sort: {
			column: 'city',
			direction: 'asc'
		}
	});
});
</script>
@stop

{{-- Page content --}}
@section('content')

<h1>Infinite Pagination</h1>

<hr>

<div class="row">

	<div class="col-md-12">

		<form data-search data-grid="infinite" class="search">

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

		<div class="applied-filters" data-grid="infinite"></div>

	</div>

</div>

<div class="row">

	<div class="col-md-12">

		<ul class="infinite grid cf" data-source="{{ URL::to('source') }}" data-grid="infinite"></ul>

	</div>

</div>

<footer id="pagination" class="row" data-grid="infinite"></footer>

@include('templates/infinite/results')
@include('templates/infinite/pagination')
@include('templates/infinite/filters')
@include('templates/infinite/no_results')

@stop
