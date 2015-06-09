/**
 * Part of the Data Grid package.
 *
 * NOTICE OF LICENSE
 *
 * Licensed under the Cartalyst PSL License.
 *
 * This source file is subject to the Cartalyst PSL License that is
 * bundled with this package in the LICENSE file.
 *
 * @package    Data Grid
 * @version    4.0.0
 * @author     Cartalyst LLC
 * @license    Cartalyst PSL
 * @copyright  (c) 2011-2015, Cartalyst LLC
 * @link       http://cartalyst.com
 */

;(function ($, window, document, undefined)
{
    'use strict';


    // Workaround for utf-8 params issue in Safari
    // TODO Fix Chrome encoded uri ugliness
    Backbone.History.prototype.decodeFragment = function(fragment) {
        return fragment;
    };

    /**
     * Default settings
     *
     * @var array
     */
    var defaults = {
        source: null,
        threshold: null,
        throttle: null,
        method: 'single',
        multiple: true,
        sort: {},
        sort_classes: {
            asc: 'asc',
            desc: 'desc'
        },
        delimiter: {
            query: ';',
            expression: ':'
        },
        sections: {
            results: '[data-grid-section="results"]',
            filters: '[data-grid-section="filters"]',
            pagination: '[data-grid-section="pagination"]'
        },
        template_settings: {
            evaluate    : /<%([\s\S]+?)%>/g,
            interpolate : /<%=([\s\S]+?)%>/g,
            escape      : /<%-([\s\S]+?)%>/g
        },
        filters: {},
        live_search: true,
        scroll: null,
        search_timeout: 800,
        hash: true,
        pushstate: false,
        root: '',
        loader: undefined,
        loader_class: undefined,
        db_timestamp_format: 'YYYY-MM-DD HH:mm:ss',
        db_date_format: 'YYYY-MM-DD',
        prefetched: false,
        callback: undefined
    };

    function DataGrid(grid, options) {

        this.key = grid;
        this.grid = '[data-grid="' + grid + '"]';

        // Options
        this.opt = $.extend({}, defaults, options);

        this.applied_filters = [];

        this.default_column = '';
        this.default_direction = '';

        this.is_search_active = false;
        this.search_timeout = null;

        this.current_sort = {
            column: null,
            direction: null,
            index: 0
        };

        this.pagination = {
            page_index: 1,
            pages: null,
            total: null,
            filtered: null,
            base_throttle: null
        };

        // Setup Base Throttle
        this.pagination.base_throttle = this.opt.throttle;

        var sections = this.opt.sections;

        // Our Main Elements
        this.$results    = $(sections.results + this.grid).length > 0 ? $(sections.results + this.grid) : $(this.grid + ' ' + sections.results);
        this.$pagination = $(sections.pagination + this.grid).length > 0 ? $(sections.pagination + this.grid) : $(this.grid + ' ' + sections.pagination);
        this.$filters    = $(sections.filters + this.grid).length > 0 ? $(sections.filters + this.grid) : $(this.grid + ' ' + sections.filters);
        this.$body       = $(document.body);

        // Source
        this.source = this.$results.data('source') || this.opt.source;

        // Safety Check
        if (this.$results.get(0).tagName.toLowerCase() === 'table') {
            this.$results = this.$results.find('tbody');
        }

        this.initial = true;

        // Check our dependencies
        this._checkDependencies();

        this.backbone = Backbone.noConflict();

        var router = this.backbone.Router.extend({
            routes: {
                '*path': 'defaultRoute'
            },

            defaultRoute: $.proxy(this.onRouteDispatch, this)
        });

        this.router = new router();

        // Initialize Data Grid
        // _.defer is needed to catch chained listeners before the first events are triggered
        _.defer($.proxy(this.init, this));

        return this;
    }

    DataGrid.prototype = {

        /**
         * Initializes Data Grid.
         *
         * @return void
         */
        init: function () {
            this.listeners();
            this.initRouter();
        },

        /**
         * Checks the Data Grid dependencies.
         *
         * @return void
         */
        _checkDependencies: function () {

            if (typeof window._ === 'undefined') {
                throw new Error('Underscore is not defined. DataGrid Requires UnderscoreJS v1.6.0 or later to run!');
            }

            var grid = this.grid;

            // Set _ templates interpolate
            _.templateSettings = this.opt.template_settings;

            var results_template       = $('[data-template="results"]' + grid).html();
            var pagination_template    = $('[data-template="pagination"]' + grid).html();
            var filters_template       = $('[data-template="filters"]' + grid).html();
            var empty_results_template = $('[data-template="no_results"]' + grid).html();
            var empty_filters_template = $('[data-template="no_filters"]' + grid).html();

            if (results_template === undefined) {
                console.error('results template not found.');
            }

            if (pagination_template === undefined) {
                console.error('pagination template not found.');
            }

            if (filters_template === undefined) {
                console.error('filters template not found.');
            }

            // Allow empty no_results template
            if (empty_results_template === undefined) {
                empty_results_template = '';
            }

            // Allow empty no_filters template
            if (empty_filters_template === undefined) {
                empty_filters_template = '';
            }

            // Cache the Underscore Templates
            this.tmpl = {
                results:       _.template(results_template),
                pagination:    _.template(pagination_template),
                filters:       _.template(filters_template),
                empty_results: _.template(empty_results_template),
                empty_filters: _.template(empty_filters_template)
            };
        },

        /**
         * jQuery.on wrapper for dg:event callbacks
         *
         * @param event
         * @param callback
         */
        on: function(event, callback) {
            $(this).on(event, $.proxy(function() {
                callback.apply(this, _.rest(arguments));
            }, this));
        },

        /**
         * Filter types and handlers collection
         */
        filter_types: {

            term: {

                listeners: function() {
                    var term_selector = '[data-grid-filter]' + this.grid + ':not([data-grid-type="range"]),' + this.grid + ' [data-grid-filter]:not([data-grid-type="range"])';

                    this.$body.on('click', term_selector, $.proxy(this.filter_types.term._onFilter, this));
                    this.$body.on('change', 'select[data-grid-group]' + this.grid + ',' + this.grid + ' select[data-grid-group]', $.proxy(this._onSelectFilter, this));
                },

                extract: function(fragment) {

                    var $filter = $('[data-grid-filter="' + fragment + '"]' + this.grid + ',' + this.grid + ' [data-grid-filter="' + fragment + '"]');

                    if (!_.has(this.opt.filters, fragment) && !$filter.length) {
                        return;
                    }

                    this.filter_types.term.apply.call(this, $filter, false);
                    return true;
                },

                buildFragment: function(filter) {
                    return filter.name;
                },

                buildParams: function(filter) {

                    return _.map(filter.query, $.proxy(function(q) {

                        var f = {};

                        if (q.operator) {
                            f[q.column] = ['|', q.operator, this._cleanup(q.value), '|'].join('');
                        } else {
                            f[q.column] = this._cleanup(q.value);

                        }
                        return f;
                    }, this));
                },

                /**
                 * Handle filter click
                 */
                _onFilter: function(e) {

                    e.preventDefault();

                    var $filter = $(e.currentTarget),
                        type = $filter.data('grid-type') || 'term';

                    if (type !== 'term') {
                        return;
                    }

                    this.applyScroll();

                    if (this.opt.method === 'infinite') {
                        this.$results.empty();
                        this.pagination.page_index = 1;
                    }

                    this.filter_types.term.apply.call(this, $filter);
                },

                /**
                 * Handle select filter change
                 *
                 * @return void
                 */
                _onSelectFilter: function(e) {

                    var $select = $(e.currentTarget),
                        $option = $select.find(':selected');

                    this.filter_types.term.apply.call(this, $option);
                },

                /**
                 * Extracts filters from element.
                 *
                 * @param  $filter  object
                 * @param  refresh  bool
                 * @return void
                 */
                apply: function($filter, refresh) {

                    refresh = refresh !== undefined ? refresh : true;

                    this.resetBeforeApply($filter);

                    if (!$filter.data('grid-filter')) {
                        if (refresh) {
                            this.goToPage(1);
                            this.refresh();
                        }
                        return;
                    }

                    this.filter_types.term._apply.call(this, $filter);

                    if (refresh) {
                        this.goToPage(1);
                        this.refresh();
                    }

                },

                _apply: function($filter) {

                    var filter 	= {
                        name: $filter.data('grid-filter'),
                        type: 'term',
                        label: $filter.data('grid-label') || '',
                        default: _.isUndefined($filter.data('grid-filter-default')) ? false : true
                    };

                    if (this.isFilterApplied(filter)) {
                        return;
                    }

                    if (_.has(this.opt.filters, filter.name)) {
                        filter = _.extend(filter, this.opt.filters[filter.name]);
                    } else {
                        var query_raw = $filter.data('grid-query') || '';

                        if (query_raw.length) {
                            filter.query = this.filter_types.term._parseQuery.call(this, query_raw);
                        }
                    }

                    this.applyFilter(filter);
                },

                _parseQuery: function(query_raw) {

                    return _.map(query_raw.split(this.opt.delimiter.query), $.proxy(function(expression) {

                        expression = $.trim(expression);

                        if (expression.length) {

                            var query = expression.split(this.opt.delimiter.expression);

                            if (query.length === 3) {
                                return {
                                    column: query[0],
                                    value: this._cleanup(query[2]),
                                    operator: this.checkOperator(query[1]) ? query[1] : null
                                };
                            } else if (query.length === 2) {
                                return {
                                    column: query[0],
                                    value: this._cleanup(query[1])
                                };
                            }
                        }
                    }, this));
                }
            },

            range: {
                listeners: function() {
                    var rangeSelector = '[data-grid-filter][data-grid-type="range"]' + this.grid + ',' + this.grid + ' [data-grid-filter][data-grid-type="range"]'
                    this.$body.on('click', rangeSelector, $.proxy(this.filter_types.range._onRange, this));
                },

                extract: function(fragment) {

                },

                buildFragment: function(filter) {
                    return ['/', filter.name, this.opt.delimiter.expression, filter.from, this.opt.delimiter.expression, filter.to].join('');
                },

                buildParams: function(filter) {

                },

                _onRange: function(e) {
                    // TODO Extract range filter
                }
            },

            search: {

                listeners: function() {
                    this.$body.on('submit', '[data-grid-search]' + this.grid + ',' + this.grid + ' ' + '[data-grid-search]', $.proxy(this.filter_types.search._onSearch, this));
                },

                extract: function(fragment) {

                    var route   = fragment.split(this.opt.delimiter.expression),
                        $option = $('[data-grid-search]' + this.grid + ',' + this.grid + ' ' + '[data-grid-search]')
                            .find('select:not([data-grid-group]) option[value=' + route[0] + ']');

                    if (!$option.length) {
                        return;
                    }

                    var filter;

                    if (route.length === 3) {
                        filter = {
                            name: 'search:' + route[0] + ':' + encodeURI(route[2]).toLowerCase().replace(/%/g, ''),
                            type: 'search',
                            query: {
                                column: route[0],
                                value: this._cleanup(route[2]),
                                operator: route[1]
                            }
                        };
                    } else {
                        filter = {
                            name: 'search:' + route[0] + ':' + encodeURI(route[1]).toLowerCase().replace(/%/g, ''),
                            type: 'search',
                            query: {
                                column: route[0],
                                value: this._cleanup(route[1])
                            }
                        };
                    }

                    this.applyFilter(filter);
                },

                buildFragment: function (filter) {
                    return [filter.query.column, this.opt.delimiter.expression, encodeURI(filter.query.value)].join('');
                },

                buildParams: function (filter) {

                    var q = filter.query, f = {};
                    if ('all' === q.column) {
                        f = (q.operator) ?
                            ['|', q.operator, this._cleanup(q.value), '|'].join('') : this._cleanup(q.value);
                    } else {
                        f[q.column] = (q.operator) ?
                            ['|', q.operator, this._cleanup(q.value), '|'].join('') : this._cleanup(q.value);
                    }

                    return f;
                },

                /**
                 * Handle search form submit
                 */
                _onSearch: function(e) {

                    var $form = $(e.currentTarget);
                    e.preventDefault();

                    this.filter_types.search.apply.call(this, $form);
                },

                /**
                 * Apply filter from search form
                 */
                apply: function($form) {

                    var $input = $form.find('input'),
                        $select = $form.find('select:not([data-grid-group])'),
                        column = $select.val() || 'all',
                        value = $.trim($input.val()),
                        old = $input.data('old'),
                        operator = $form.data('operator');

                    this.is_search_active = true;

                    clearTimeout(this.search_timeout);

                    if (!value.length) {
                        return;
                    }

                    if ($select.length) {
                        $select.prop('selectedIndex', 0);
                    }

                    // Remove live search filter
                    this.applied_filters = _.reject(this.applied_filters, function(f) {return f.type === 'live';});

                    // TODO Reset search keywords

                    var filter = {
                        name: 'search:' + column + ':' + encodeURI(value).toLowerCase().replace(/%/g, ''),
                        type: 'search',
                        query: {
                            column: column,
                            value: this._cleanup(value),
                            operator: operator
                        }
                    };

                    // Clear results for infinite grids
                    if (this.opt.method === 'infinite') {
                        this.$results.empty();
                    }

                    $input.val('').data('old', '');

                    this.applyFilter(filter);

                    this.goToPage(1);
                    this.refresh();
                }

            },

            live: {

                listeners: function() {
                    if (this.opt.live_search) {
                        this.$body.on('keyup', '[data-grid-search]' + this.grid + ',' + this.grid + ' ' + '[data-grid-search]', $.proxy(this.filter_types.live._onLiveSearch, this));
                    }
                },

                extract: $.noop,

                buildFragment: $.noop,

                buildParams: function(filter) {
                    return this.filter_types.search.buildParams.call(this, filter);
                },

                /**
                 * Handle live search
                 */
                _onLiveSearch: function(e) {

                    if (e.keyCode === 13) {
                        return;
                    }

                    var elem = $(e.currentTarget);
                    e.preventDefault();

                    this.filter_types.live.apply.call(this, elem);
                },

                /**
                 * Apply live search filter
                 */
                apply: function($form) {

                    if (this.is_search_active) {
                        return;
                    }

                    clearTimeout(this.search_timeout);

                    this.search_timeout = setTimeout($.proxy(function($form) {

                        var $input = $form.find('input'),
                            $select = $form.find('select:not([data-grid-group])'),
                            column = $select.val() || 'all',
                            value = $.trim($input.val()),
                            old = $input.data('old'),
                            operator = $form.data('operator');

                        if (old) {
                            // Remove the old term from the applied filters
                            this.applied_filters = _.reject(this.applied_filters, function(f) {return f.type === 'live';});

                            if (!value.length) {

                                // Reset back grid view if keyword has been deleted
                                this.goToPage(1);
                                this.refresh();

                                return;
                            }
                        }

                        var filter = {
                            name: 'live',
                            type: 'live',
                            query: {
                                column: column,
                                value: this._cleanup(value),
                                operator: operator
                            }
                        };

                        $input.data('old', value);

                        // Clear results for infinite grids
                        if (this.opt.method === 'infinite') {
                            this.$results.empty();
                        }

                        this.applyFilter(filter);

                        this.goToPage(1);
                        this.refresh();
                    }, this, $form), this.opt.search_timeout);
                }
            }
        },

        /**
         * Initializes filter event listeners.
         *
         * @return void
         */
        filterListeners: function() {

            _.each(_.keys(this.filter_types), $.proxy(function(type) {
                this.filter_types[type].listeners.call(this);
            }, this));
        },

        /**
         * Initializes custom event listeners.
         *
         * @return void
         */
        callbackListeners: function() {

            _.each(_.keys(this.opt.events), $.proxy(function(event) {
                this.on(event, this.opt.events[event]);
            }, this));
        },

        /**
         * Initializes all event listeners.
         *
         * @return void
         */
        listeners: function() {

            var grid    = this.grid

            $(this).on('dg:update', this.fetchResults);

            // TODO document-wide filter reset handlers
            //this.$body.on('click', '[data-grid-reset]' + grid + ':not([data-grid-filter]):not([data-grid-group]),' + grid + ' [data-grid-reset]:not([data-grid-filter]):not([data-grid-group])', $.proxy(this.onReset, this));

            this.filterListeners();
            this.callbackListeners();

            this.$filters.on('click', '[data-grid-reset-filter]', $.proxy(this.onFilterUnapply, this));

            this.$body.on('click', '[data-grid-sort]' + grid + ',' + grid + ' [data-grid-sort]', $.proxy(this.onSort, this));
            this.$pagination.on('click', '[data-grid-page]', $.proxy(this.onPaginate, this));
            this.$pagination.on('click', '[data-grid-throttle]', $.proxy(this.onThrottle, this));
            this.$body.on('click', '[data-grid-download]', $.proxy(this.onDownload, this));

            if (this.opt.infinite_scroll && this.opt.method === 'infinite') {

                var offset = this.opt.scroll_offset || 400;
                var throttled = _.throttle($.proxy(function() {
                    if ($(window).scrollTop() >= $(document).height() - $(window).height() - offset) {
                        var page = this.pagination.page_index + 1;

                        if (page <= this.pagination.pages) {
                            this.goToPage(page);
                            this.refresh();
                        }
                    }
                }, this), 800);

                $(window).scroll(throttled);
            }
        },

        initRouter: function() {
            var routerOptions = {};

            if (this.opt.pushstate) {
                routerOptions = {
                    root: this.opt.root,
                    pushState:true
                };
            }

            if (this.opt.hash) {
                $(this).on('dg:hashchange', this.pushHash);
            }

            this.backbone.history.start(routerOptions);
        },

        onRouteDispatch: function(path) {

            var route_array = path ? path.split('/') : [];

            if (this.initial) {
                this.applyDefaults();
                this.initial = false;

                // TODO Decide whether defaults should be applied to view and hash on pref
                if (this.opt.prefetched) {
                    this.opt.prefetched = false;
                    return;
                }

                if (_.isEmpty(route_array)) {
                    this.refresh();
                } else {
                    this.updateOnHash(route_array);
                }
            } else {
                this.reset();
                this.updateOnHash(route_array);
            }
        },

        /**
         * Handle reset click
         *
         * @return void
         */
        onReset: function(e) {

            e.preventDefault();

            this.reset();
            this.refresh();
        },

        /**
         * Handle applied filter remove
         *
         * @return void
         */
        onFilterUnapply: function(e) {

            e.preventDefault();

            var elem = $(e.currentTarget);

            var name = elem.data('grid-reset-filter');

            var $filter = this.$body.find('[data-grid-filter="'+name+'"]' + this.grid + ',' + this.grid + ' [data-grid-filter="'+name+'"]');

            if ($filter.prop('tagName') === 'OPTION') {
                $filter.closest('select').val($filter.closest('select').find('option:first').val());
            }

            this.removeFilter(name);

            if (this.opt.method === 'infinite') {
                this.$results.empty();
            }

            this.refresh();
        },

        /**
         * Handle sort click
         *
         * @return void
         */
        onSort: function(e) {

            e.preventDefault();
            var elem = $(e.currentTarget);

            if (this.opt.method === 'infinite') {
                this.$results.empty();
            }

            this.extractSortsFromClick(elem);
            this.refresh();
        },

        /**
         * Handle page click
         *
         * @return void
         */
        onPaginate: function(e) {

            var page = $(e.currentTarget);

            $(this).trigger('dg:switching', this, page);

            e.preventDefault();

            this.applyScroll();
            this.handlePageChange(page);

            $(this).trigger('dg:switched', this, page);
        },

        /**
         * Handle throttle click
         *
         * @return void
         */
        onThrottle: function(e) {

            e.preventDefault();

            this.opt.throttle += this.pagination.base_throttle;
            this.refresh();
        },

        /**
         * Handle download
         *
         * @return void
         */
        onDownload: function(e) {

            e.preventDefault();

            var type = $(e.target).data('grid-download');
            document.location = this.source + '?' + this.buildAjaxURI(type);
        },

        _getFragment: function() {
            return this.backbone.history.getFragment();
        },

        /**
         * Update on hash change.
         *
         * @param  routes
         * @return void
         */
        updateOnHash: function(routes) {

            var options        = this.opt,
                current_route  = '/' + routes.join('/'),
                current_hash   = this._getFragment(),
                sort_column    = _.has(options.sort, 'column'),
                sort_direction = _.has(options.sort, 'direction'),
                last_item;

            if (this.opt.multiple) {
                routes = _.compact(current_route.split('/grid/'));
            } else {
                routes = [current_route];
            }

            _.each(routes, $.proxy(function(route) {

                var parsed_route = _.compact(route.split('/'));

                if (this.opt.multiple && parsed_route[0] !== this.key) {
                    return;
                }

                // Build Array For Sorts
                last_item = parsed_route[(parsed_route.length - 1)];

                if (/^threshold/g.test(last_item)) {

                    this.extractThresholdFromRoute(last_item);
                    parsed_route = parsed_route.splice(0, (parsed_route.length - 1));
                    last_item = parsed_route[(parsed_route.length - 1)];
                }

                if (/^throttle/g.test(last_item)) {

                    this.extractThrottleFromRoute(last_item);
                    parsed_route = parsed_route.splice(0, (parsed_route.length - 1));
                    last_item = parsed_route[(parsed_route.length - 1)];
                }

                // Use test to return true/false
                if (/^page/g.test(last_item)) {

                    // Remove Page From parsed_route
                    this.extractPageFromRoute(last_item);
                    parsed_route = parsed_route.splice(0, (parsed_route.length - 1));
                    last_item = parsed_route[(parsed_route.length - 1)];

                } else {
                    this.pagination.page_index = 1;
                }

                if ((/desc$/g.test(last_item)) || (/asc$/g.test(last_item))) {
                    this.extractSortsFromRoute(last_item);
                    // Remove Sort From parsed_route
                    parsed_route = parsed_route.splice(0, (parsed_route.length - 1));
                } else if (sort_column && sort_direction) {
                    // Convert sort to string
                    var str = [options.sort.column, options.delimiter.expression, options.sort.direction].join('');
                    this.extractSortsFromRoute(str);
                } else {
                    this.current_sort.direction = '';
                    this.current_sort.column    = '';
                }

                // Build Array For Filters
                if (parsed_route.length) {
                    if (this.opt.multiple) {
                        parsed_route = parsed_route.splice(1);
                    }
                    // Rebuild applied filters collection.
                    this.extractFiltersFromRoute(parsed_route);
                } else {
                    // Reset applied filters if none are set via the hash
                    this.applied_filters = [];
                    this.$filters.html(this.tmpl.empty_filters());
                }
            }, this));

            if (this.opt.multiple && current_hash.indexOf(this.key) === -1) {
                if (sort_column && sort_direction) {
                    var str = options.sort.column + options.delimiter.expression + options.sort.direction;
                    this.extractSortsFromRoute(str);
                }
            }

            this.refresh();
        },

        /**
         * Push hash state.
         *
         * @return void
         */
        pushHash: function() {

            var current_hash   = this._getFragment() || '',
                path;

            // filters/sorts/page/throttle/threshold
            var filters     = this.buildFilterFragment(),
                sort        = this.buildSortFragment(),
                page        = this.buildPageFragment(),
                throttle    = this.buildThrottleFragment(),
                threshold   = this.buildThresholdFragment(),

                base        = _.compact(_.flatten([filters, sort, page, throttle, threshold])).join('/');

            if (_.isEmpty(filters) || _.isEmpty(sort) || this.pagination.page_index < 1 && base.length) {
                base = '';
            } else if (this.opt.multiple) {
                base = base.length ? [this.key, base].join('/') : '';
            }

            if (this.opt.multiple) {
                path = this._buildMultiplePath(base, _.compact(current_hash.split('grid/')));
            } else {
                path = base;
            }

            if (path !== '') {
                if (current_hash !== path) {
                    this.backbone.history.navigate(path, {trigger: false});
                }
            } else if (current_hash !== '') {
                this.backbone.history.navigate('', {trigger: false});
            }
        },

        _buildMultiplePath: function (base, routes_array) {

            // TODO Refactor to clean up, improve for better understanding what is being done

            var parsed_route, key, final_path = '', appended, path,
                route_index = -1;

            _.each(routes_array, $.proxy(function(route) {

                parsed_route = route.split('/');
                key = parsed_route[0];

                // hash exists
                if (key === this.key) {
                    // keep track of hash index for building the new hash
                    route_index = _.indexOf(routes_array, route);

                    // remove existing hash
                    routes_array = _.without(routes_array, route);
                }
            }, this));

            routes_array = _.compact(routes_array);

            for (var i = 0; i < routes_array.length; i++) {
                if (i === route_index) {
                    final_path += base !== '' ? 'grid/' + base : '';
                    appended = true;
                }

                final_path += 'grid/' + routes_array[i];
            }

            final_path += ! appended && base !== '' ? 'grid/' + base : '';

            path = _.isEmpty(routes_array) ? base : final_path;

            if (path.length > 1 && path.substr(0, 4) !== 'grid') {
                path = 'grid/' + path;
            }

            return path;
        },

        /**
         * Apply a filter.
         *
         * @param  filter   object
         * @return void
         */
        applyFilter: function(filter) {

            if (this.isFilterApplied(filter)) {
                return;
            }

            $(this).trigger('dg:applying', filter);

            // Apply filters to our global filters collection.
            this.applied_filters.push(filter);

            // Avoid re-rendering applied filters on livesearch request
            if (filter.type !== 'live') {

                // Render our filters
                this.$filters.html(this.tmpl.filters({
                    grid: this,
                    filters: _.reject(this.applied_filters, function(f) {return f.type === 'live';})
                }));
            }

            $(this).trigger('dg:applied', filter);
        },

        /**
         * Initialize default filters, sort.
         *
         * @return void
         */
        applyDefaults: function() {

            if (this._getFragment() === '') {

                // Init default filters
                _.each($('[data-grid-filter-default]' + this.grid + ', ' + this.grid + ' [data-grid-filter-default]'),
                    $.proxy(function(filter) {
                        var $filter = $(filter),
                            type    = $filter.data('grid-type') || 'term';
                        this.filter_types[type].apply.call(this, $filter, false);
                    }, this)
                );

                // Check default presets
                _.each(this.opt.filters, $.proxy(function(name) {
                    if (_.has(this.opt.filters[name], 'default') && this.opt.filters[name].default) {
                        var $filter = $('[data-grid-filter="' + name + '"]' + this.grid + ', ' + this.grid + ' [data-grid-filter="' + name + '"]');
                        this.filter_types[type].apply.call(this, $filter, false);
                    }
                }, this));

                // Init default sort
                var $sort = $('[data-grid-sort-default]' + this.grid + ', ' + this.grid + ' [data-grid-sort-default]');

                if ($sort.length) {
                    this.extractSortsFromClick($sort);
                }

                this.goToPage(1);
            }
        },

        /**
         * Remove filter by name.
         *
         * @param  name     string
         * @return void
         */
        removeFilter: function(name) {

            var filter = _.findWhere(this.applied_filters, {name: name});

            if (!filter) {
                return;
            }

            $(this).trigger('dg:removing', filter);

            this.applied_filters = _.reject(this.applied_filters, function(f) {return f.name === name});

            // TODO Trigger view component update
            if (this.applied_filters.length > 0) {
                this.$filters.html(this.tmpl.filters({ filters: this.applied_filters }));
            } else {
                this.$filters.html(this.tmpl.empty_filters);
            }

            this.goToPage(1);

            $(this).trigger('dg:removed', filter);
        },

        /**
         * Remove filters by its' group name.
         *
         * @param  group    string
         * @return void
         */
        removeGroupFilters: function(group) {

            var $group = $('[data-grid-group="' + group + '"]');

            if (!$group.length) {
                return;
            }

            $(this).trigger('dg:removing_group', group);

            _.each($group.find('[data-grid-filter]'), $.proxy(function(filter) {
                this.removeFilter($(filter).data('grid-filter'));
            }, this));

            $(this).trigger('dg:removed_group', $group);
        },

        /**
         * Handles the page change from the pagination.
         *
         * @param  $el  object
         * @return void
         */
        handlePageChange: function($el) {

            var index;

            if (this.opt.method === 'infinite') {
                index = $el.data('grid-page');
                $el.data('grid-page', ++index);
            } else {
                index = $el.data('grid-page');
            }

            this.goToPage(index);

            this.refresh();
        },

        /**
         * Navigates to the given page.
         *
         * @param  page int
         * @return void
         */
        goToPage: function(page) {
            this.pagination.page_index = isNaN(page = parseInt(page, 10)) ? 1 : page;
        },

        /**
         * Sets the sort direction on the given element.
         *
         * @param  $el          object
         * @param  direction    string
         * @return void
         */
        setSortDirection: function($el, direction) {

            $(this).trigger('dg:sorting', this);

            var grid        = this.grid,
                options     = this.opt,
                $sorts      = $('[data-grid-sort]' + grid + ',' + grid + ' [data-grid-sort]'),
                ascClass    = options.sort_classes.asc,
                descClass   = options.sort_classes.desc,
                remove      = direction === 'asc' ? descClass : ascClass,
                add         = direction === 'asc' ? ascClass : descClass;

            // Remove All Classes from other sorts
            $sorts.not($el).removeClass(ascClass);
            $sorts.not($el).removeClass(descClass);

            $el.removeClass(remove).addClass(add);

            $(this).trigger('dg:sorted', this);
        },

        resetBeforeApply: function($filter) {

            var resetFilter = $filter.closest('[data-grid-reset-filter]'),
                resetGroup  = $filter.closest('[data-grid-reset-group]');


            if ($filter.data('grid-reset') || $filter.closest('[data-grid-reset]').length) {
                // Reset all filters
                this.reset();
            }

            if (($filter.data('grid-reset-filter') || '').length) {
                // Reset filter by name
                this.removeFilter($filter.data('grid-reset-filter'));
            }

            if (($filter.data('grid-reset-group') || '').length) {
                // Reset filter group by name
                this.removeGroupFilters($filter.data('grid-reset-group'));
            }

            if ((resetFilter.data('grid-reset-filter') || '').length) {
                // Reset filter by name from parent
                this.removeFilter(resetFilter.data('grid-reset-filter'));
            }

            if (resetGroup.length) {

                if ((resetGroup.data('grid-reset-group') || '').length) {
                    // Reset filter group by name from parent
                    this.removeGroupFilters(resetGroup.data('grid-reset-group'));
                } else {
                    var $group = $filter.closest('[data-grid-group]'),
                        group  = $group.data('grid-group');

                    // Reset parent filter group
                    this.removeGroupFilters(group);
                }
            }
        },

        isFilterApplied: function(filter) {
            return !! _.findWhere(this.applied_filters, {name: filter.name});
        },

        /**
         * Clean up value
         *
         * @param  val      string
         * @return string
         */
        _cleanup: function(val) {
            return $.trim(val);
        },

        /**
         * Extracts sorts from click.
         *
         * @param  $el      object
         * @return void
         */
        extractSortsFromClick: function($el) {

            // TODO Refactor to unify method

            var sort_array = $el.data('grid-sort').split(':'),
                direction  = 'asc';

            // Reset page for infinite grids
            if (this.opt.method === 'infinite') {
                this.goToPage(1);
            }

            if (this.current_sort.column === sort_array[0] && this.current_sort.index < 3 && this.current_sort.column !== this.opt.sort.column) {
                this.current_sort.index++;
            } else {
                if (sort_array[0] !== this.default_column && this.default_column !== '') {
                    this.current_sort.index = 1;
                } else {
                    this.current_sort.index = 3;
                }
            }

            if (sort_array[0] === this.default_column && this.default_column !== '') {
                this.current_sort.index = 1;
            }

            if (typeof sort_array[1] !== 'undefined') {
                direction = sort_array[1];
            }

            if (sort_array[0] === this.current_sort.column) {
                if (this.current_sort.direction === 'asc' && this.current_sort.index !== 3) {
                    this.current_sort.direction = 'desc';
                } else if (this.current_sort.index !== 3) {
                    this.current_sort.direction = 'asc';
                } else {
                    this.current_sort.direction = '';
                }
            } else if (sort_array[0] === this.default_column && this.default_column !== '') {
                this.current_sort.column = this.default_column;
                this.current_sort.direction = (this.default_direction === 'asc' ? 'desc' : 'asc');
            } else {
                this.current_sort.column = sort_array[0];
                this.current_sort.direction = direction;
            }
        },

        /**
         * Extracts filters from route.
         *
         * @param  route_array  array
         * @return void
         */
        extractFiltersFromRoute: function(route_array) {

            this.applied_filters = [];

            var extracted = false;

            _.each(route_array, $.proxy(function(fragment) {

                for (var type in this.filter_types) {

                    if (_.has(this.filter_types, type)) {
                        extracted = this.filter_types[type].extract.call(this, fragment) || false;
                    }

                    if (extracted) {
                        break;
                    }
                }
            }, this));
        },

        /**
         * Extracts sorts from route.
         *
         * @param  sort string
         * @return void
         */
        extractSortsFromRoute: function(sort) {

            sort = sort.split(this.opt.delimiter.expression);

            var column    = sort[0],
                direction = sort[1];

            // Setup Sort and put index at 1
            if (this.current_sort.column !== column) {
                this.current_sort.index = 1;
            }

            this.current_sort.column = column;
            this.current_sort.direction = direction;
        },

        /**
         * Extracts the current page from the route.
         *
         * @param  page string
         * @return void
         */
        extractPageFromRoute: function(page) {

            var page_array = page.split(this.opt.delimiter.expression);

            if (page_array[1] === '' || page_array[1] <= 0) {
                this.pagination.page_index = 1;
            } else {
                this.pagination.page_index = parseInt(page_array[1], 10);
            }
        },

        /**
         * Extracts threshold from route.
         *
         * @param  threshold    string
         * @return void
         */
        extractThresholdFromRoute: function(threshold) {
            threshold = threshold.split(this.opt.delimiter.expression)[1];
            this.setThreshold(threshold);
        },

        /**
         * Extracts throttle from route.
         *
         * @param  throttle string
         * @return void
         */
        extractThrottleFromRoute: function(throttle) {
            throttle = throttle.split(this.opt.delimiter.expression)[1];
            this.setThrottle(throttle);
        },

        /**
         * Build filter fragment.
         *
         * @return string
         */
        buildFilterFragment: function() {

            return _.flatten(_.map(this.applied_filters, $.proxy(function(index) {
                if (_.has(this.filter_types, index.type)) {
                    return this.filter_types[index.type].buildFragment.call(this, index);
                }
            }, this)));
        },

        /**
         * Build sort fragment.
         *
         * @return string
         */
        buildSortFragment: function() {

            var column          = this.current_sort.column,
                direction       = this.current_sort.direction,
                delimiter       = this.opt.delimiter.expression;

            if (!!column && !!direction) {
                if (column !== this.opt.sort.column || direction !== this.opt.sort.direction) {
                    return [column, delimiter, direction].join('');
                }
            }
        },

        /**
         * Build page fragment.
         *
         * @return string
         */
        buildPageFragment: function() {

            if (this.pagination.page_index > 1 && this.opt.method !== 'infinite') {
                return ['page', this.opt.delimiter.expression, this.pagination.page_index].join('');
            }
        },

        /**
         * Build throttle fragment.
         *
         * @return string
         */
        buildThrottleFragment: function() {

            if (defaults.throttle !== this.opt.throttle && this.opt.throttle) {
                return ['throttle', this.opt.delimiter.expression, this.opt.throttle].join('');
            }
        },

        /**
         * Build threshold fragment.
         *
         * @return string
         */
        buildThresholdFragment: function() {

            if (defaults.threshold !== this.opt.threshold && this.opt.threshold) {
                return ['threshold', this.opt.delimiter.expression, this.opt.threshold].join('');
            }
        },

        /**
         * Grabs all the results from the server.
         *
         * @return void
         */
        fetchResults: function() {

            $(this).trigger('dg:fetching', this);

            this.showLoader();

            $.ajax({
                url: this.source,
                dataType : 'json',
                data: this.buildAjaxURI()
            })
                .done($.proxy(function(response) {

                    if (!this.opt.throttle) {
                        defaults.throttle = response.throttle;
                    }

                    if (!this.opt.threshold) {
                        defaults.threshold = response.threshold;
                    }

                    if (this.pagination.page_index > response.pages) {
                        this.pagination.page_index = response.pages;
                        this.refresh();

                        return false;
                    }

                    this.pagination.filtered = response.filtered;
                    this.pagination.total = response.total;

                    // Keep infinite results to append load more
                    if (this.opt.method !== 'infinite') {
                        this.$results.empty();
                    }

                    if (this.opt.method === 'single' || this.opt.method === 'group') {
                        this.$results.html(this.tmpl.results(response));
                    } else {
                        this.$results.append(this.tmpl.results(response));
                    }

                    this.$pagination.html(this.tmpl.pagination(this.buildPagination(response)));

                    this.pagination.pages = response.pages;

                    if (!response.results.length) {
                        this.$results.html(this.tmpl.empty_results());
                    }

                    if (!this.applied_filters.length) {
                        this.$filters.html(this.tmpl.empty_filters());
                    }

                    if (response.sort !== '') {

                        var sortEl = $('[data-grid-sort^="' + response.sort + '"]' + this.grid + ',' + this.grid + ' [data-grid-sort^="' + response.sort + '"]');

                        if (this.buildSortFragment()) {
                            this.current_sort.column = response.sort;
                            this.current_sort.direction = response.direction;
                        }

                        if (this.opt.sort.column === undefined) {
                            this.default_column = response.default_column;
                            this.default_direction = response.direction;
                        }

                        this.setSortDirection(sortEl, response.direction);
                    }

                    this.hideLoader();

                    // TODO Don't push state on live search requests
                    $(this).trigger('dg:hashchange');

                    this.callback();

                    $(this).trigger('dg:fetched', response);

                    this.is_search_active = false;
                }, this))
                .error($.proxy(function(jqXHR, textStatus, errorThrown)
                {

                    console.error('fetchResults ' + jqXHR.status, errorThrown);
                    this.is_search_active = false;

                }, this));
        },

        /**
         * Builds the ajax uri.
         *
         * @return string
         */
        buildAjaxURI: function(download) {

            var params = {
                filters: [],
                page: this.pagination.page_index,
                method: this.opt.method
            };

            if (this.opt.threshold) {
                params.threshold = this.opt.threshold ? this.opt.threshold : defaults.threshold;
            }

            if (this.opt.throttle) {
                params.throttle = this.opt.throttle ? this.opt.throttle : defaults.throttle;
            }

            _.each(this.applied_filters, $.proxy(function(index) {
                if (_.has(this.filter_types,index.type)) {
                    params.filters = _.flatten(params.filters.concat(this.filter_types[index.type].buildParams.call(this, index)));
                }
            }, this));

            if (this.current_sort.column !== '' && this.current_sort.direction !== '') {
                params.sort = this.current_sort.column;
                params.direction = this.current_sort.direction;
            } else if (this.opt.sort.column !== undefined && this.opt.sort.direction !== undefined) {
                params.sort = this.opt.sort.column;
                params.direction = this.opt.sort.direction;
            }

            if (download) {
                params.download = download;
            }

            return $.param(params);
        },

        /**
         * Builds the pagination.
         *
         * @param  json object
         * @return object
         */
        buildPagination: function(json) {

            var page  = json.page,
                next  = json.next_page,
                prev  = json.previous_page,
                total = json.pages;

            switch (this.opt.method) {
                case 'single':
                case 'group':
                    return this.buildRegularPagination(page, next, prev, total);
                case 'infinite':
                    return this.buildInfinitePagination(page, next, total);
            }
        },

        /**
         * Builds regular pagination.
         *
         * @param  page     int
         * @param  next     int
         * @param  prev     int
         * @param  total    int
         * @return object
         */
        buildRegularPagination: function(page, next, prev, total) {

            var params, per_page, page_limit;

            per_page = this.calculatePagination();

            if (this.opt.threshold > this.pagination.filtered) {
                page_limit = this.pagination.filtered;
            } else if (this.pagination.page_index === 1) {
                page_limit = per_page > this.pagination.filtered ? this.pagination.filtered : per_page;
            } else {
                page_limit = this.pagination.total < (per_page * this.pagination.page_index) ? this.pagination.filtered : (per_page * this.pagination.page_index);
            }

            params = {
                page_start: per_page === 0 ? 0 : ( this.pagination.page_index === 1 ? this.pagination.filtered > 0 ? 1 : 0 : ( per_page * (this.pagination.page_index - 1 ) + 1)),
                page_limit: page_limit,
                next_page: next,
                previous_page: prev,
                page: page,
                active: true,
                pages: total,
                total: this.pagination.total,
                filtered: this.pagination.filtered,
                throttle: this.opt.throttle ? this.opt.throttle : defaults.throttle,
                threshold: this.opt.threshold ? this.opt.threshold : defaults.threshold,
                per_page: per_page
            };

            return {
                pagination: [params]
            };
        },

        /**
         * Builds the infinite pagination.
         *
         * @param  page     int
         * @param  next     int
         * @param  total    int
         * @return object
         */
        buildInfinitePagination: function(page, next, total) {

            if (next === null) {
                return {
                    pagination: null
                };
            }

            return {
                pagination: [{
                    page: page,
                    total: total,
                    infinite: true
                }]
            };
        },

        /**
         * Calculate results per page.
         *
         * @return int
         */
        calculatePagination: function() {

            switch (this.opt.method) {
                case 'single':
                case 'infinite':
                    return this.opt.throttle ? this.opt.throttle : defaults.throttle;
                case 'group':
                    return Math.ceil(this.pagination.filtered / (this.opt.throttle ? this.opt.throttle : defaults.throttle));
            }
        },

        /**
         * Shows the loading bar.
         *
         * @return void
         */
        showLoader: function() {

            var grid   = this.grid,
                loader = this.opt.loader;

            if (this.opt.loader_class) {
                this.$body.find(grid + loader + ',' + grid + ' ' + loader).addClass(this.opt.loader_class);
            }

            this.$body.find(grid + loader + ',' + grid + ' ' + loader).finish();
        },

        /**
         * Hides the loading bar.
         *
         * @return void
         */
        hideLoader: function() {

            var grid   = this.grid,
                loader = this.opt.loader;

            if (this.opt.loader_class) {
                this.$body.find(grid + loader + ',' + grid + ' ' + loader).removeClass(this.opt.loader_class);
            }

            this.$body.find(grid + loader + ',' + grid + ' ' + loader).finish();
        },

        /**
         * Resets Data Grid.
         *
         * @return void
         */
        reset: function() {

            var grid    = this.grid,
                options = this.opt,
                $search = this.$body.find('[data-grid-search]'+ grid);

            // Elements
            this.$body.find('[data-grid-sort]'+ grid).removeClass(options.sort_classes.asc).removeClass(options.sort_classes.desc);
            $search.find('input').val('');
            $search.find('select').prop('selectedIndex', 0);
            this.$body.find('select[data-grid-group]' + grid + ',' + grid +' select[data-grid-group]').find(':eq(0)').prop('selected', true);

            // Filters
            this.applied_filters = [];

            // Sort
            this.current_sort.index = 0;
            this.current_sort.direction = '';
            this.current_sort.column = '';

            // Pagination
            this.pagination.page_index = 1;

            // Remove all rendered content
            this.$filters.html(this.tmpl.empty_filters());

            if (this.opt.method === 'infinite') {
                this.$results.empty();
            }
        },

        /**
         * Refreshes Data Grid
         *
         * @return void
         */
        refresh: function() {
            $(this).trigger('dg:update');
        },

        /**
         * Data grid callback.
         *
         * @return void
         */
        callback: function() {

            var callback = this.opt.callback;

            if (callback !== undefined && $.isFunction(callback)) {
                callback.call(this);
            }
        },

        /**
         * Applies the scroll feature animation.
         *
         * @return void
         */
        applyScroll: function() {

            var _scroll = this.opt.scroll;

            if ($.isFunction(_scroll)) {
                _scroll();
            } else if (_scroll) {
                $(document.body).animate({ scrollTop: $(_scroll).offset().top }, 200);
            }
        },

        /**
         * Check for operators.
         *
         */
        checkOperator: function(value) {
            return />|<|!=|=|<=|>=|<>/.test(value);
        },

        /**
         * Check for date.
         *
         */
        checkDate: function(value) {
            return /[0-9]{4}-[0-9]{2}-[0-9]{2}/g.test(value);
        },

        /**
         * Sets the scroll value.
         *
         * @param  element  string
         * @return void
         */
        setScroll: function(element) {
            this.opt.scroll = element;
        },

        /**
         * Returns the throttle.
         *
         * @return int
         */
        getThrottle: function() {
            return this.opt.throttle;
        },

        /**
         * Sets the throttle.
         *
         * @param  value    int
         * @return void
         */
        setThrottle: function(value) {
            this.opt.throttle = value;
        },

        /**
         * Returns the threshold.
         *
         * @return int
         */
        getThreshold: function() {
            return this.opt.threshold;
        },

        /**
         * Sets the threshold.
         *
         * @param  value    int
         * @return void
         */
        setThreshold: function(value) {
            this.opt.threshold = value;
        }
    };

    /**
     * Data grid init.
     *
     * @param  grid     string
     * @param  options  object
     * @return DataGrid
     */
    $.datagrid = function(grid, options) {
        return new DataGrid(grid, options);
    };

    /**
     * Data grid prototype
     *
     * @type object
     */
    $.datagrid.prototype = DataGrid.prototype;

})(jQuery, window, document);
