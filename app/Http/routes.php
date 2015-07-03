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
use Cartalyst\DataGrid\Export\Providers\ExportProvider;
use Cartalyst\DataGrid\Laravel\DataHandlers\DatabaseHandler;
use Cartalyst\DataGrid\Laravel\Facades\DataGrid;
use Faker\Factory as Faker;

Route::get('/', function () {
    return view('home');
});

Route::get('standard', function () {
    return view('standard');
});

//Route::get('pushstate', function()
//{
//    return view('pushstate');
//});

Route::get('semantic{hash}', function () {
    return view('semantic');
})->where('hash', '(.*)?');

Route::get('infinite', function () {
    return view('infinite');
});

Route::get('group', function () {
    return view('group');
});

Route::get('songsSource', function () {
//    dd(Input::all());
    $columns = array(
        'track_id',
        'title',
        'duration',
    );

    $settings = array(
        'columns' => $columns,
        'sort' => [
            'column' => 'track_id',
            'direction' => 'asc',
        ],
        'max_results' => 100,
    );

    $handler = new DatabaseHandler(new Songs, $settings);

    // Or by an Eloquent model
    return DataGrid::make($handler);
});


Route::get('source', function () {
//    dd(Input::all());
    $columns = [
        'id',
        'country',
        'subdivision',
        'city',
        'population',
        'created_at',
    ];

    $settings = [
        'columns' => $columns,
        'sort' => [
            'column' => 'country',
            'direction' => 'asc',
        ],
        'max_results' => 20,
    ];

//    $array = [];
//
//    $faker = Faker::create();
//    foreach (range(1, 300) as $index)
//    {
//        $int = rand(strtotime("- 1 year"), time());
//        $array[] = [
//            'country'                  => $faker->country,
//            'subdivision'              => $faker->state,
//            'city'                     => $faker->city,
//            'population'               => $faker->randomNumber(5),
//            'country_code'             => $faker->countryCode,
//            'country_subdivision_code' => $faker->stateAbbr,
//            'created_at'               => date("Y-m-d H:i:s", $int),
//            'updated_at'               => date("Y-m-d H:i:s", $int),
//        ];
//    }

    // Initiate by a database query
//    $handler = new DatabaseHandler(DB::table('cities'), $settings);

    // Or by an Eloquent model query
//    $handler = new DatabaseHandler(with(new City)->newQuery(), $settings)

    $handler = new DatabaseHandler(new City, $settings);

//    $handler = new \Cartalyst\DataGrid\DataHandlers\CollectionHandler($array, $settings);

    $requestProvider = new ExportProvider(app('request'));

    // Or by an Eloquent model
    return DataGrid::make($handler, $requestProvider);
});
