<?php namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider {

	/**
	 * Bootstrap any application services.
	 *
	 * @return void
	 */
	public function boot()
	{
        $this->configureDomPdf();
	}

	/**
	 * Register any application services.
	 *
	 * @return void
	 */
	public function register()
	{
		//
	}

    /**
     * Configure Dom Pdf.
     *
     * @return void
     */
    protected function configureDomPdf()
    {
        $configFile = base_path() . '/vendor/dompdf/dompdf/dompdf_config.inc.php';

        if ($this->app['files']->exists($configFile)) {
            if (! defined('DOMPDF_ENABLE_AUTOLOAD')) {
                define('DOMPDF_ENABLE_AUTOLOAD', false);
            }

            require_once $configFile;
        }
    }

}
