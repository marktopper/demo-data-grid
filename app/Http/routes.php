<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

use App\City;
use Cartalyst\DataGrid\DataGrid;
use Cartalyst\DataGrid\Export\ExportProvider;
use Cartalyst\DataGrid\Laravel\DataHandlers\DatabaseHandler;

Route::get('/', function()
{
    return view('home');
});

Route::get('standard', function()
{
    return view('standard');
});

//Route::get('pushstate', function()
//{
//    return view('pushstate');
//});

Route::get('semantic{hash}', function()
{
    return view('semantic');
})->where('hash', '(.*)?');

Route::get('infinite', function()
{
    return view('infinite');
});

Route::get('group', function()
{
    return view('group');
});

Route::get('source', function()
{
//    dd(Input::all());
    $columns = array(
        'id',
        'country',
        'subdivision',
        'city',
        'population',
        'created_at',
    );

    $settings = array(
        'columns'     => $columns,
        'sort'        => [
            'column'    => 'country',
            'direction' => 'asc',
        ],
        'max_results' => 20,
    );

    // Initiate by a database query
//    $handler = new DatabaseHandler(DB::table('cities'), $settings);

    // Or by an Eloquent model query
//    $handler = new DatabaseHandler(with(new City)->newQuery(), $settings)

    $handler = new DatabaseHandler(new City, $settings);
    $requestProvider = new ExportProvider(app('request'), null, app('view'));

    // Or by an Eloquent model
    return DataGrid::make($handler, $requestProvider);
});
