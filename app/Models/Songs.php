<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class Songs extends Model {

	protected $table = 'songs';

    /**
     * Mutator for the "songs" attribute.
     *
     * @param  string  $songs
     * @return int
     */
    public function getSongsAttribute($songs)
    {
        return (int) $songs;
    }
}
