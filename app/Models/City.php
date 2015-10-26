<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class City extends Model {

	protected $table = 'cities';

    /**
     * Mutator for the "population" attribute.
     *
     * @param  string  $population
     * @return int
     */
    public function getPopulationAttribute($population)
    {
        return (int) $population;
    }
}
