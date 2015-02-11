<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/

Route::get('/', function()
{
	return View::make('home');
});

Route::get('standard', function()
{
	return View::make('standard');
});

Route::get('infinite', function()
{
	return View::make('infinite');
});

Route::get('group', function()
{
	return View::make('group');
});


// Route::get('advanced', function()
// {
// 	return View::make('advanced');
// });

// Route::get('multiple', function()
// {
// 	return View::make('multiple');
// });

// Route::get('adv', function()
// {
// 	return View::make('adv');
// });

Route::get('source', function()
{
	$columns = array(
		'id',
		'country',
		'subdivision',
		'city',
		'population',
		'created_at',
	);

	$settings = array(
		'sort'        => 'country',
		'direction'   => 'asc',
		'max_results' => 20,
	);

	// // Initiate by a database query
	// return DataGrid::make(DB::table('cities'), $columns, $settings);

	// // Or by an Eloquent model query
	// return DataGrid::make(with(new City)->newQuery(), $columns, $settings);

	// Or by an Eloquent model
	return DataGrid::make(new City, $columns, $settings);
});
