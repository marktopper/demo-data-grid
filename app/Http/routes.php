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
use App\Songs;
use Faker\Factory as Faker;
use Cartalyst\DataGrid\Laravel\Facades\DataGrid;
use Cartalyst\DataGrid\Export\Providers\ExportProvider;
use Cartalyst\DataGrid\Laravel\DataHandlers\DatabaseHandler;

Route::get('/', function () {
    return view('home');
});

Route::get('standard', function () {
    return view('standard');
});

Route::get('semantic{hash}', function () {
    return view('semantic');
})->where('hash', '(.*)?');

Route::get('infinite', function () {
    return view('infinite');
});

Route::get('group', function () {
    return view('group');
});

Route::get('songs', function () {
    $columns = [
        'track_id',
        'title',
        'duration',
    ];

    $settings = [
        'columns' => $columns,
        'sort' => [
            'column'    => 'track_id',
            'direction' => 'asc',
        ],
        'max_results' => 100,
    ];

    $handler = new DatabaseHandler(new Songs, $settings);

    return DataGrid::make($handler);
});


Route::get('source', function () {
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
            'column'    => 'country',
            'direction' => 'asc',
        ],
        'max_results' => 20,
    ];

    /**
     * Collection Handler
     */

    // $array = [];

    // $faker = Faker::create();

    // foreach (range(1, 300) as $index)
    // {
    //     $int = rand(strtotime("- 1 year"), time());
    //     $array[] = [
    //         'country'                  => $faker->country,
    //         'subdivision'              => $faker->state,
    //         'city'                     => $faker->city,
    //         'population'               => $faker->randomNumber(5),
    //         'country_code'             => $faker->countryCode,
    //         'country_subdivision_code' => $faker->stateAbbr,
    //         'created_at'               => date("Y-m-d H:i:s", $int),
    //         'updated_at'               => date("Y-m-d H:i:s", $int),
    //     ];
    // }

    // $handler = new \Cartalyst\DataGrid\DataHandlers\CollectionHandler($array, $settings);

    /**
     * Database Handler
     */

    // Database query
    // $handler = new DatabaseHandler(DB::table('cities'), $settings);

    // Eloquent model query
    // $handler = new DatabaseHandler(with(new City)->newQuery(), $settings);

    // Eloquent model
    $handler = new DatabaseHandler(new City, $settings);

    $requestProvider = new ExportProvider(app('request'));

    return DataGrid::make($handler, $requestProvider);
});
