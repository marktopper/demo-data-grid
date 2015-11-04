<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="description" content="{{ trans('app.description') }}">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>{{ trans('app.title') }}</title>

	<!-- Page styles -->
	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:regular,bold,italic,thin,light,bolditalic,black,medium&amp;lang=en">
	<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">

	<link rel="stylesheet" href="css/app.css">

</head>
<body>

	<div class="mdl-layout mdl-js-layout mdl-layout--fixed-header">

		@include('partials/header')

		@include('partials/sidebar')

		<div class="demo-content mdl-layout__content">

			@yield('page')

			@include('partials/footer')

		</div>

	</div>

	<script src="js/all.js"></script>
</body>
</html>
