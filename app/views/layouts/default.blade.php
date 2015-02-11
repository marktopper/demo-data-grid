<!DOCTYPE html>
<html>
	<head>
		<title>
			@section('title')
			Data-Grid Demo
			@show
		</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link href="{{ URL::to('assets/css/bootstrap.min.css') }}" rel="stylesheet" media="screen">
		<link href="{{ URL::to('assets/css/font-awesome.min.css') }}" rel="stylesheet" media="screen">
		<link href="{{ URL::to('assets/css/demo.css') }}" rel="stylesheet" media="screen">

		@yield('styles')

		<!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
		<!--[if lt IE 9]>
		<script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
		<script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
		<![endif]-->
	</head>
	<body>

		<div class="flux clearfix">
			<div class="flux--1"></div>
			<div class="flux--2"></div>
			<div class="flux--3"></div>
			<div class="flux--4"></div>
			<div class="flux--5"></div>
		</div>

		<div class="container">
			<nav class="navbar navbar-inverse" role="navigation">
				<div class="navbar-header">
					<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">
						<span class="sr-only">Toggle navigation</span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
					</button>
					<a class="navbar-brand" href="{{ URL::to('/') }}">Data-Grid</a>
				</div>

				<div class="collapse navbar-collapse navbar-ex1-collapse">
					<ul class="nav navbar-nav">
						<li {{ Request::is('/') ? 'class="active"' : null }}><a href="{{ URL::to('/') }}">Home</a></li>
						<li {{ Request::is('standard') ? 'class="active"' : null }}><a href="{{ URL::to('standard') }}">Standard</a></li>
						<li {{ Request::is('infinite') ? 'class="active"' : null }}><a href="{{ URL::to('infinite') }}">Infinite</a></li>
						<li {{ Request::is('group') ? 'class="active"' : null }}><a href="{{ URL::to('group') }}">Grouped</a></li>
					</ul>

					<ul class="nav navbar-nav navbar-right">
						<li><a target="_blank" href="https://cartalyst.com/manual/data-grid">Manual</a></li>
					</ul>
				</div>
			</nav>

			@yield('content')
		</div>

		<script src="{{ URL::to('assets/js/jquery.min.js') }}"></script>
		<script src="{{ URL::to('assets/js/bootstrap.min.js') }}"></script>
		<script src="{{ URL::asset('packages/cartalyst/data-grid/js/underscore.js') }}"></script>
		<script src="{{ URL::asset('packages/cartalyst/data-grid/js/data-grid.js') }}"></script>

		<script type="text/javascript">
			$('.tip').tooltip();
		</script>

		@yield('scripts')

		<script type="text/javascript">
			var _gaq = _gaq || [];
			_gaq.push(['_setAccount', 'UA-26550564-1']);
			_gaq.push(['_setDomainName', 'cartalyst.com']);
			_gaq.push(['_trackPageview']);

			(function() {
				var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
				ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
				var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
			})();
		</script>
	</body>
</html>
