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

    /**
     * Default settings
     *
     * @var array
     */
    var defaults = {

        source: null,

        multiple: false,
        prefetched: false,

        pagination: {
            method: 'single',
            threshold: null,
            throttle: null,
            scroll: null,

            infinite_scroll: false,
            scroll_offset: undefined
        },

        sorting: {
            column: undefined,
            direction: undefined,
            multicolumn: true,
            delimiter: ',',
            asc_class: 'asc',
            desc_class: 'desc'
        },

        delimiter: {
            query: ';',
            expression: ':'
        },

        layouts: {
            results: {
                template: '[data-grid-template="results"]',
                layout: '[data-grid-layout="results"]'
            },
            filters: {
                template: '[data-grid-template="filters"]',
                layout: '[data-grid-layout="filters"]'
            },
            pagination: {
                template: '[data-grid-template="pagination"]',
                layout: '[data-grid-layout="pagination"]'
            }
        },

        template_settings: {
            evaluate    : /<%([\s\S]+?)%>/g,
            interpolate : /<%=([\s\S]+?)%>/g,
            escape      : /<%-([\s\S]+?)%>/g
        },

        filters: {},

        search: {
            live: true,
            timeout: 600
        },

        url: {
            hash: true,
            semantic: false,
            base: ''
        },

        loader: {
            selector: undefined,
            show_effect: 'fadeIn',
            hide_effect: 'fadeOut',
            duration: 200
        },

        formats: {
            timestamp: 'YYYY-MM-DD HH:mm:ss',
            date: 'YYYY-MM-DD'
        },

        callback: undefined
    };

    function DataGrid(grid, options) {

        this.key = grid;
        this.grid = '[data-grid="' + grid + '"]';

        // Options
        this.opt = _.extend({}, defaults);

        _.each(_.keys(options), $.proxy(function(key) {
            this.opt[key] = (key !== 'layouts') ? _.defaults(options[key], defaults[key]) : options[key];
        }, this));

        var source = $(this.grid + '[data-grid-source],' + this.grid + ' [data-grid-source]');
        if (source.length && !_.isEmpty(source.data('grid-source'))) {
            this.opt.source = source.data('grid-source')
        }

        this.applied_filters = [];

        this.sort = [];

        this.is_search_active = false;
        this.search_timeout = null;

        this.pagination = {
            page_index: 1,
            pages: null,
            total: null,
            filtered: null,
            base_throttle: this.opt.pagination.throttle
        };

        this.initial = true;

        // Check our dependencies
        this._checkDependencies();

        this.backbone = Backbone.noConflict();

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
        init: function() {
            this.initLayouts();
            this.listeners();
            this.initRouter();
        },

        /**
         * Initializes layouts
         */
        initLayouts: function() {

            _.templateSettings = this.opt.template_settings;

            this.$body      = $(document.body);
            this.layouts    = {};

            this.setLayout(this.opt.layouts);
        },

        /**
         * Set data-grid layout settings
         *
         * @param  name  string|object
         * @param  options  object
         * @return DataGrid
         */
        setLayout: function(name, options) {

            var layouts = {};

            if (_.isObject(name)) {
                layouts = name;
            } else {
                layouts[name] = options;
            }

            _.each(_.keys(layouts), $.proxy(function(key) {

                if (_.isNull(layouts[key])) {
                    delete this.layouts[key];
                    return;
                }

                var layout      = layouts[key].layout,
                    $layout     = $(this.grid + layout + ',' + this.grid + ' ' + layout),
                    template    = layouts[key].template,
                    $template   = $(this.grid + template + ',' + this.grid + ' ' + template),
                    _default    = _.isUndefined(this.layouts[key]) ? {
                        active: true,
                        action: 'update'
                    } : this.layouts[key];

                if (!$layout.length) {
                    console.error('Element for layout "' + key + '" is not found.');
                    return;
                }

                if (!$template.length) {
                    console.error('Template for layout "' + key + '" is not found.');
                    return;
                }

                // Safety check
                if ($layout.get(0).tagName.toLowerCase() === 'table') {
                    $layout = $layout.find('tbody');
                }

                this.layouts[key] = _.defaults({
                    layout: $layout,
                    template: _.template($template.html()),
                    action: layouts[key].action,
                    active: layouts[key].active
                }, _default);

            }, this));

            return this;
        },

        initRouter: function() {

            var routerOptions   = {},
                router          = this.backbone.Router.extend({
                    routes: {
                        '*path': 'defaultRoute'
                    },

                    defaultRoute: $.proxy(this.onRouteDispatch, this)
                });

            if (this.opt.url.semantic) {
                routerOptions = {
                    root: this.opt.url.base,
                    pushState: true
                };
            }

            if (this.opt.url.hash) {
                $(this).on('dg:hashchange', $.proxy(this.pushHash, this));
            }

            this.router = new router();
            this.backbone.history.start(routerOptions);
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

            if (typeof Backbone === 'undefined') {
                throw new Error('DataGrid Requires Backbone.js v1.0.0 or later to run!');
            }
        },

        /**
         * jQuery.on wrapper for dg:event callbacks
         *
         * @param  event
         * @param  callback
         * @return DataGrid
         */
        on: function(event, callback) {

            if (_.isObject(event)) {
                this.callbackListeners(event);
            } else {
                this.bindCallback(event, callback);
            }

            return this;
        },

        /**
         * Binds single callback.
         *
         * @param  event
         * @param  callback
         */
        bindCallback: function(event, callback) {
            $(this).on(event, $.proxy(function() {
                callback.apply(this, _.rest(arguments));
            }, this));
        },

        /**
         * Filter types and handlers collection
         */
        filter_types: {

            term: {

                /**
                 * Initialises filter listeners.
                 */
                listeners: function() {
                    var term_selector = '[data-grid-filter]' + this.grid + ':not([data-grid-type="range"]),' + this.grid + ' [data-grid-filter]:not([data-grid-type="range"])';

                    this.$body.on('click', term_selector, $.proxy(this.filter_types.term._onFilter, this));

                    // TODO Fix term select event handler
                    this.$body.find('select[data-grid-group]' + this.grid + ',' + this.grid + ' select[data-grid-group]').on('change', $.proxy(this._onSelectFilter, this));
                },

                /**
                 * Extracts filter data from url fragment.
                 */
                extract: function(fragment) {

                    var $filter = $('[data-grid-filter="' + fragment + '"]' + this.grid + ',' + this.grid + ' [data-grid-filter="' + fragment + '"]');

                    // TODO Find out what to do in case we have filter preset, but no filter element
                    if (!_.has(this.opt.filters, fragment) && !$filter.length) {
                        return;
                    }

                    this.filter_types.term.apply.call(this, $filter, false);
                    return true;
                },

                /**
                 * Builds url fragment from filter data.
                 */
                buildFragment: function(filter) {
                    return filter.name;
                },

                /**
                 * Builds ajax request params from filter data.
                 */
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
                 * Handles filter click.
                 */
                _onFilter: function(e) {

                    e.preventDefault();

                    var $filter = $(e.currentTarget),
                        type    = $filter.data('grid-type') || 'term';

                    if (type !== 'term') {
                        return;
                    }

                    this.applyScroll();

                    this.filter_types.term.apply.call(this, $filter);
                },

                /**
                 * Handles select filter change.
                 */
                _onSelectFilter: function(e) {

                    var $select = $(e.currentTarget),
                        $filter = $select.find(':selected'),
                        type    = $filter.data('grid-type') || 'term';

                    if (type !== 'term') {
                        return;
                    }

                    this.applyScroll();

                    this.filter_types.term.apply.call(this, $filter);
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

                    if (!_.isEmpty($filter.data('grid-sort'))) {
                        this.setSort(this._parseSort($filter.data('grid-sort')));
                    }

                    if ($filter.data('grid-filter')) {
                        this.removeFilter($filter.data('grid-filter'));
                        this.resetBeforeApply($filter);
                        this.filter_types.term._apply.call(this, $filter);
                    }

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

                    return _.compact(_.map(query_raw.split(this.opt.delimiter.query), $.proxy(function(expression) {

                        expression = _.trim(expression);

                        if (_.isEmpty(expression)) {
                            return;
                        }

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
                    }, this)));
                }
            },

            range: {

                listeners: function() {
                    var rangeSelector = '[data-grid-type="range"]' + this.grid + ',' + this.grid + ' [data-grid-type="range"]';

                    // TODO Range filter click
                    //this.$body.on('click', rangeSelector, $.proxy(this.filter_types.range._onRange, this));
                    this.$body.on('change', rangeSelector, $.proxy(this.filter_types.range._onRangeChange, this));
                },

                extract: function(fragment) {

                    var delimiter   = this.opt.delimiter.expression,
                        query       = fragment.split(delimiter),
                        name        = query[0],
                        from        = query[1],
                        to          = query[2],
                        $filter     = $('[data-grid-filter="' + name + '"]' + this.grid + ',' + this.grid + ' [data-grid-filter="' + name + '"]');

                    if (!$filter.length || $filter.data('grid-type') !== 'range') {
                        return;
                    }

                    if (_.isUndefined($filter.data('grid-range'))) {
                        $filter.data('grid-query', [name, delimiter, from, delimiter, to].join(''));
                    } else {
                        var $from   = this.$body.find('[data-grid-filter="' + name + '"][data-grid-range="start"]' + this.grid + ',' + this.grid + ' [data-grid-filter="' + name + '"][data-grid-range="start"]'),
                            $to     = this.$body.find('[data-grid-filter="' + name + '"][data-grid-range="end"]' + this.grid + ',' + this.grid + ' [data-grid-filter="' + name + '"][data-grid-range="end"]');

                        if ($from.is(':input')) {
                            $from.val(from);
                        } else {
                            $from.find(':input:first').val(from);
                        }

                        if ($to.is(':input')) {
                            $to.val(to);
                        } else {
                            $to.find(':input:first').val(to);
                        }
                    }

                    this.filter_types.range.apply.call(this, $filter, false);
                    return true;
                },

                buildFragment: function(filter) {
                    var delimiter = this.opt.delimiter.expression;
                    return [filter.name, delimiter, filter.query.from, delimiter, filter.query.to].join('');
                },

                buildParams: function(filter) {

                    var f = {}, q = filter.query;

                    f[q.column] = ['|>=', q.from, '|<=', q.to, '|'].join('');
                    return f;
                },

                _onRange: function(e) {

                    e.preventDefault();

                    var $filter = $(e.currentTarget),
                        type = $filter.data('grid-type') || 'range';

                    if (type !== 'range' || !_.isUndefined($filter.data('grid-range'))) {
                        return;
                    }

                    this.filter_types.range.apply.call(this, $filter);
                },

                _onRangeChange: function(e) {

                    e.preventDefault();

                    var $filter = $(e.currentTarget),
                        type = $filter.data('grid-type');

                    if (type !== 'range') {
                        return;
                    }

                    this.filter_types.range.apply.call(this, $filter);
                },

                /**
                 * Extracts range filters from element.
                 *
                 * @param  $filter  object
                 * @param  refresh  bool
                 * @return void
                 */
                apply: function($filter, refresh) {

                    refresh = refresh !== undefined ? refresh : true;

                    var name        = $filter.data('grid-filter'),
                        label       = $filter.data('grid-label'),
                        delimiter   = this.opt.delimiter.expression,
                        query, column, from, to;

                    if (_.isUndefined($filter.data('grid-range'))) {
                        // Extract single element range (slider or button)
                        query   = $filter.data('grid-query').split(delimiter);
                        column  = query[0];
                        from    = query[1];
                        to      = query[2];
                    } else {

                        // Extract double element range (datepickers)
                        var $from       = this.$body.find('[data-grid-filter="' + name + '"][data-grid-range="start"]' + this.grid + ',' + this.grid + ' [data-grid-filter="' + name + '"][data-grid-range="start"]'),
                            $to         = this.$body.find('[data-grid-filter="' + name + '"][data-grid-range="end"]' + this.grid + ',' + this.grid + ' [data-grid-filter="' + name + '"][data-grid-range="end"]');

                        column      = $from.data('grid-query').split(delimiter)[0];
                        from        = $from.is(':input') ? $from.val() : $from.find(':input:first').val() || $from.data('grid-query').split(delimiter)[1];
                        to          = $to.is(':input') ? $to.val() : $to.find(':input:first').val() || $to.data('grid-query').split(delimiter)[1];
                    }

                    if (_.isEmpty(from) || _.isEmpty(to)) {
                        return;
                    }

                    this.removeFilter(name);
                    this.resetBeforeApply($filter);

                    if (!_.isEmpty($filter.data('grid-sort'))) {
                        this.setSort(this._parseSort($filter.data('grid-sort')));
                    }

                    var date_format = _.isUndefined($filter.data('grid-date-format')) ?
                        null : ($filter.data('grid-date-format') || this.opt.formats.date);

                    if (date_format && window.moment) {
                        from = moment(from).format(date_format);
                        to   = moment(to).format(date_format);
                    }

                    var filter = {
                        name: name,
                        type: 'range',
                        label: label,
                        default: _.isUndefined($filter.data('grid-filter-default')) ? false : true,
                        query: {
                            column: column,
                            from: from,
                            to: to
                        }
                    };

                    this.applyFilter(filter);

                    if (refresh) {
                        this.goToPage(1);
                        this.refresh();
                    }
                }

            },

            search: {

                listeners: function() {
                    this.$body.on('submit', 'form[data-grid-search]' + this.grid + ',' + this.grid + ' ' + 'form[data-grid-search]', $.proxy(this.filter_types.search._onSearch, this));
                },

                extract: function(fragment) {

                    var route   = fragment.split(this.opt.delimiter.expression),
                        $option = $('[data-grid-search]' + this.grid + ',' + this.grid + ' ' + '[data-grid-search]')
                            .find('select:not([data-grid-group]) option[value=' + route[0] + ']');

                    if (route[0] !== 'all' && !$option.length) {
                        return;
                    }

                    var filter;

                    if (route.length === 3) {
                        filter = {
                            name: 'search:' + route[0] + ':' + encodeURI(route[2]).toLowerCase().replace(/%/g, ''),
                            type: 'search',
                            query: [{
                                column: route[0],
                                value: this._cleanup(route[2]),
                                operator: route[1]
                            }]
                        };
                    } else {
                        filter = {
                            name: 'search:' + route[0] + ':' + encodeURI(route[1]).toLowerCase().replace(/%/g, ''),
                            type: 'search',
                            query: [{
                                column: route[0],
                                value: this._cleanup(route[1])
                            }]
                        };
                    }

                    this.applyFilter(filter);
                    return true;
                },

                buildFragment: function (filter) {
                    return [filter.query[0].column, this.opt.delimiter.expression, encodeURI(filter.query[0].value)].join('');
                },

                buildParams: function (filter) {

                    var q = filter.query[0], f = {};
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
                        operator = $form.data('grid-operator');

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

                    var filter = {
                        name: 'search:' + column + ':' + encodeURI(value).toLowerCase().replace(/%/g, ''),
                        type: 'search',
                        query: [{
                            column: column,
                            value: this._cleanup(value),
                            operator: operator
                        }]
                    };

                    $input.val('').data('old', '');

                    this.resetBeforeApply($form);

                    if (!_.isEmpty($form.data('grid-sort'))) {
                        this.setSort(this._parseSort($form.data('grid-sort')));
                    }

                    this.applyFilter(filter);

                    this.goToPage(1);
                    this.refresh();
                }

            },

            live: {

                listeners: function() {
                    if (this.opt.search.live) {
                        this.$body.on('keyup', '[data-grid-search]' + this.grid + ',' + this.grid + ' ' + '[data-grid-search]', $.proxy(this.filter_types.live._onLiveSearch, this));
                    }
                },

                extract: _.noop,

                buildFragment: _.noop,

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
                            query: [{
                                column: column,
                                value: this._cleanup(value),
                                operator: operator
                            }]
                        };

                        $input.data('old', value);

                        this.applyFilter(filter);

                        this.goToPage(1);
                        this.refresh();
                    }, this, $form), this.opt.search.timeout);
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
        callbackListeners: function(events) {

            if (_.isEmpty(events)) {
                return;
            }

            _.each(_.keys(events), $.proxy(function(event) {
                this.bindCallback(event, events[event]);
            }, this));
        },

        /**
         * Initializes all event listeners.
         *
         * @return void
         */
        listeners: function() {

            var grid = this.grid;

            $(this).on('dg:update', $.proxy(this.fetchResults, this));

            // TODO document-wide filter reset handlers
            //this.$body.on('click', '[data-grid-reset]' + grid + ':not([data-grid-filter]):not([data-grid-group]),' + grid + ' [data-grid-reset]:not([data-grid-filter]):not([data-grid-group])', $.proxy(this.onReset, this));

            this.filterListeners();
            this.callbackListeners(this.opt.events);

            this.$body.on('click', '[data-grid-reset-filter]:not(form)' + grid + ',' + grid + ' [data-grid-reset-filter]:not(form)', $.proxy(this.onFilterUnapply, this));

            this.$body.on('click', '[data-grid-sort]:not([data-grid-filter])' + grid + ',' + grid + ' [data-grid-sort]:not([data-grid-filter])', $.proxy(this.onSort, this));
            this.$body.on('click', '[data-grid-page]' + grid + ',' + grid + ' [data-grid-page]', $.proxy(this.onPaginate, this));
            this.$body.on('click', '[data-grid-throttle]' + grid + ',' + grid + ' [data-grid-throttle]', $.proxy(this.onThrottle, this));
            this.$body.on('click', '[data-grid-download]' + grid + ',' + grid + ' [data-grid-download]', $.proxy(this.onDownload, this));

            if (this.opt.pagination.infinite_scroll && this.opt.pagination.method === 'infinite') {

                var offset = this.opt.pagination.scroll_offset || 400;
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

        onRouteDispatch: function(path) {

            var route_array = path ? path.split('/') : [];

            if (this.initial) {
                this.applyDefaults();
                this.initial = false;

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

            var applied = $(e.currentTarget);

            var name = applied.data('grid-reset-filter');

            var $filter = this.$body.find('[data-grid-filter="'+name+'"]' + this.grid + ',' + this.grid + ' [data-grid-filter="'+name+'"]');

            if ($filter.prop('tagName') === 'OPTION') {
                $filter.closest('select').val($filter.closest('select').find('option:first').val());
            }

            // TODO Remove applied filter

            this.removeFilter(name);

            this.refresh();
        },

        /**
         * Handle sort click
         *
         * @return void
         */
        onSort: function(e) {

            e.preventDefault();
            var elem    = $(e.currentTarget);

            this.extractSortsFromClick(elem, e.shiftKey);
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

            this.opt.pagination.throttle += this.pagination.base_throttle;
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
            document.location = this.opt.source + '?' + this.buildAjaxURI(type);
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

                // Parse sorts
                if ((/desc$/g.test(last_item)) || (/asc$/g.test(last_item))) {
                    this.extractSortsFromRoute(last_item);

                    // Remove Sort From parsed_route
                    parsed_route = parsed_route.splice(0, (parsed_route.length - 1));
                    last_item = parsed_route[(parsed_route.length - 1)];
                } else if (options.sorting.column && options.sorting.direction) {
                    // Convert sort to string
                    var str = [options.sorting.column, options.delimiter.expression, options.sorting.direction].join('');
                    this.extractSortsFromRoute(str);
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
                }
            }, this));

            if (this.opt.multiple && current_hash.indexOf(this.key) === -1) {
                if (options.sorting.column && options.sorting.direction) {
                    var str = [options.sorting.column, options.delimiter.expression, options.sorting.direction].join('');
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

            var current_hash   = this._getFragment(),
                path;

            // filters/sorts/page/throttle/threshold
            var filters     = this.buildFilterFragment(),
                sort        = this.buildSortFragment(),
                page        = this.buildPageFragment(),
                throttle    = this.buildThrottleFragment(),
                threshold   = this.buildThresholdFragment(),

                base        = _.compact(_.flatten([filters, sort, page, throttle, threshold])).join('/');

            if (this.opt.multiple) {
                base = base.length ? [this.key, base].join('/') : '';
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

            // TODO Refactor to clean up, improve for better understanding of what is being done

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

            // TODO Avoid re-rendering applied filters on livesearch request
            //if (filter.type !== 'live') {
            //}

            $(this).trigger('dg:applied', filter);
        },

        /**
         * Initialize default filters, sort.
         *
         * @return void
         */
        applyDefaults: function() {

            if (this._getFragment() !== '') {
                return;
            }

            // Init default filters
            _.each($('[data-grid-filter-default]' + this.grid + ', ' + this.grid + ' [data-grid-filter-default]'),
                $.proxy(function(filter) {
                    var $filter = $(filter),
                        type    = $filter.data('grid-type') || 'term';
                    this.filter_types[type].apply.call(this, $filter, false);
                }, this)
            );

            // Check default presets
            _.each(_.keys(this.opt.filters), $.proxy(function(name) {
                if (_.has(this.opt.filters[name], 'default') && this.opt.filters[name].default) {
                    var $filter = $('[data-grid-filter="' + name + '"]' + this.grid + ', ' + this.grid + ' [data-grid-filter="' + name + '"]'),
                        type = this.opt.filters[name].type || 'term';
                    this.filter_types[type].apply.call(this, $filter, false);
                }
            }, this));

            // Init default sort
            var $sort = $('[data-grid-sort-default]' + this.grid + ', ' + this.grid + ' [data-grid-sort-default]');

            if ($sort.length) {
                this.extractSortsFromClick($sort);
            } else if (this.opt.sorting.column && this.opt.sorting.direction) {
                var str = [this.opt.sorting.column, this.opt.delimiter.expression, this.opt.sorting.direction].join('');
                this.extractSortsFromRoute(str);
            }


            this.goToPage(1);
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

            var page = $el.data('grid-page');

            if (this.opt.pagination.method === 'infinite') {
                $el.data('grid-page', ++page);
            }

            this.goToPage(page);
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
         * @param  sorts    array
         * @return void
         */
        setSortDirection: function(sorts) {

            var grid        = this.grid,
                ascClass    = this.opt.sorting.asc_class,
                descClass   = this.opt.sorting.desc_class;

            //$(this).trigger('dg:sorting', this);
            // Remove All Classes from other sorts
            $('[data-grid-sort]:not([data-grid-filter])' + grid + ',' + grid + ' [data-grid-sort]:not([data-grid-filter])')
                .removeClass(ascClass)
                .removeClass(descClass);

            _.each(sorts, $.proxy(function (sort) {

                var remove  = sort.direction === 'asc' ? descClass : ascClass,
                    add     = sort.direction === 'asc' ? ascClass : descClass;

                $('[data-grid-sort^="' + sort.column + '"]' + grid + ',' + grid + ' [data-grid-sort^="' + sort.column + '"]')
                    .removeClass(remove).addClass(add);

            }, this));

            //$(this).trigger('dg:sorted', this);
        },

        resetBeforeApply: function($filter) {

            if ($filter.closest('[data-grid-reset]').length) {
                // Reset all filters
                this.reset();
                return;
            }

            var resetFilter = $filter.parents('[data-grid-reset-filter]'),
                resetGroup  = $filter.parents('[data-grid-reset-group]');

            if (!_.isEmpty($filter.data('grid-reset-filter'))) {
                // Reset filter by name
                this.removeFilter($filter.data('grid-reset-filter'));
            } else if (!_.isUndefined($filter.data('grid-reset-filter')) && !_.isUndefined($filter.data('grid-search'))) {
                // Find search filter and reset
                _.each(_.where(this.applied_filters, {type: 'search'}), $.proxy(function(filter) {
                    this.removeFilter(filter.name);
                }, this));
            }

            if (!_.isEmpty($filter.data('grid-reset-group'))) {
                // Reset filter group by name
                this.removeGroupFilters($filter.data('grid-reset-group'));
            }

            if (!_.isEmpty(resetFilter.data('grid-reset-filter'))) {
                // Reset filter by name from parent
                this.removeFilter(resetFilter.data('grid-reset-filter'));
            }

            if (resetGroup.length) {

                if (!_.isEmpty(resetGroup.data('grid-reset-group'))) {
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
            return _.isObject(_.findWhere(this.applied_filters, {name: filter.name}));
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
         * @param  multi    bool
         * @return void
         */
        extractSortsFromClick: function($el, multi) {

            multi = multi && this.opt.sorting.multicolumn;

            var opt        = this.opt,
                sort_array = $el.data('grid-sort').split(':'),
                column     = _.trim(sort_array[0]),
                direction  = _.trim(sort_array[1]) || 'asc';

            if (!column) {
                return;
            }

            // Reset page for infinite grids
            if (opt.pagination.method === 'infinite') {
                this.goToPage(1);
            }

            var sort = _.findWhere(this.sort, {column: column});

            $(this).trigger('dg:sorting', sort);

            if (!sort) {

                sort = {
                    column: column,
                    direction: direction
                };

                if (multi) {
                    this.sort.push(sort);
                } else {
                    this.sort = [sort];
                }
            } else {

                if (opt.sorting.column === column && sort.direction === opt.sorting.direction || sort.direction === direction) {
                    sort.direction = (sort.direction === 'asc') ? 'desc' : 'asc';

                    if (!multi) {
                        this.sort = [sort];
                    }
                } else {
                    this.sort = _.reject(this.sort, function(s) {return s.column === sort.column;});
                }
            }

            $(this).trigger('dg:sorted', this.sort);
        },

        /**
         * Parses sort expressions.
         *
         * @param sort_raw
         * @returns array
         * @private
         */
        _parseSort: function(sort_raw) {

            return _.compact(_.map(sort_raw.split(this.opt.delimiter.query), $.proxy(function(expression) {

                var sort = expression.split(this.opt.delimiter.expression);

                if (_.isEmpty(_.trim(sort))) {
                    return;
                }

                return {
                    column: _.trim(sort[0]),
                    direction: _.trim(sort[1]) || 'asc'
                };
            }, this)));
        },

        setSort: function (sorts) {
            sorts = (!_.isEmpty(sorts)) ? sorts : [];
            this.sort = sorts;
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
         * @param  sort_route  string
         * @return void
         */
        extractSortsFromRoute: function(sort_route) {

            var sorts = sort_route.split(this.opt.sorting.delimiter);

            _.each(sorts, $.proxy(function(sort) {
                sort = sort.split(this.opt.delimiter.expression);

                this.sort.push({
                    column: _.trim(sort[0]),
                    direction: _.trim(sort[1])
                });
            }, this));
        },

        /**
         * Extracts the current page from the route.
         *
         * @param  page string
         * @return void
         */
        extractPageFromRoute: function(page) {

            var page_array = page.split(this.opt.delimiter.expression);

            if (_.isEmpty(page_array[1]) || page_array[1] <= 0) {
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

            var delimiter = this.opt.delimiter.expression;

            var sorts = _.compact(_.map(this.sort, $.proxy(function(sort) {
                if (sort.column !== this.opt.sorting.column || sort.direction !== this.opt.sorting.direction) {
                    return [sort.column, delimiter, sort.direction].join('');
                }
            }, this)));

            if (sorts.length) {
                return sorts.join(this.opt.sorting.delimiter);
            }
        },

        /**
         * Build page fragment.
         *
         * @return string
         */
        buildPageFragment: function() {

            if (this.pagination.page_index > 1 && this.opt.pagination.method !== 'infinite') {
                return ['page', this.opt.delimiter.expression, this.pagination.page_index].join('');
            }
        },

        /**
         * Build throttle fragment.
         *
         * @return string
         */
        buildThrottleFragment: function() {

            if (defaults.pagination.throttle !== this.opt.pagination.throttle && this.opt.pagination.throttle) {
                return ['throttle', this.opt.delimiter.expression, this.opt.pagination.throttle].join('');
            }
        },

        /**
         * Build threshold fragment.
         *
         * @return string
         */
        buildThresholdFragment: function() {

            if (defaults.pagination.threshold !== this.opt.pagination.threshold && this.opt.pagination.threshold) {
                return ['threshold', this.opt.delimiter.expression, this.opt.pagination.threshold].join('');
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
                url: this.opt.source,
                dataType : 'json',
                data: this.buildAjaxURI()
            })
                .done($.proxy(this.render, this))
                .error($.proxy(this.renderFailed, this));
        },

        /**
         * Handles ajax response rendering
         *
         * @param  response  object
         */
        render: function(response) {

            if (!this.opt.pagination.throttle) {
                defaults.pagination.throttle = response.throttle;
            }

            if (!this.opt.pagination.threshold) {
                defaults.pagination.threshold = response.threshold;
            }

            if (this.pagination.page_index > response.pages) {
                this.pagination.page_index = response.pages;
                this.refresh();

                return false;
            }

            this.pagination.filtered = response.filtered;
            this.pagination.total = response.total;
            this.pagination.pages = response.pages;

            _.each(_.keys(this.layouts), $.proxy(function(key) {

                var active  = _.isUndefined(this.layouts[key].layout.data('grid-layout-disabled'));

                if (!active) {
                    return;
                }

                var layout  = this.layouts[key].layout,
                    data    = this.layouts[key].template({grid: this, response: response}),
                    action  = this.layouts[key].action === 'update' ? 'html' : this.layouts[key].action;

                // Render template
                layout[action](data);
            }, this));

            this.setSortDirection(response.sort);

            this.hideLoader();
            this.is_search_active = false;

            // TODO Don't push state on live search requests
            $(this).trigger('dg:hashchange');

            this.callback();

            $(this).trigger('dg:fetched', response);
        },

        /**
         * Handles ajax failure response
         *
         * @param jqXHR
         * @param textStatus
         * @param errorThrown
         */
        renderFailed: function(jqXHR, textStatus, errorThrown) {
            console.error('fetchResults ' + jqXHR.status, errorThrown);
            this.is_search_active = false;
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
                method: this.opt.pagination.method
            };

            if (this.opt.pagination.threshold) {
                params.threshold = this.opt.pagination.threshold ? this.opt.pagination.threshold : defaults.pagination.threshold;
            }

            if (this.opt.pagination.throttle) {
                params.throttle = this.opt.pagination.throttle ? this.opt.pagination.throttle : defaults.pagination.throttle;
            }

            _.each(this.applied_filters, $.proxy(function(index) {
                if (_.has(this.filter_types,index.type)) {
                    params.filters = _.flatten(params.filters.concat(this.filter_types[index.type].buildParams.call(this, index)));
                }
            }, this));

            if (!_.isEmpty(this.sort)) {
                params.sort = _.map(this.sort, $.proxy(function(s) {
                    return {
                        column: s.column,
                        direction: s.direction
                    }
                }, this));
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

            switch (this.opt.pagination.method) {
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
         * @param  page  int
         * @param  next  int
         * @param  prev  int
         * @param  total  int
         * @return object
         */
        buildRegularPagination: function(page, next, prev, total) {

            var per_page, page_limit;

            per_page = this.calculatePagination();

            if (this.opt.pagination.threshold > this.pagination.filtered) {
                page_limit = this.pagination.filtered;
            } else if (this.pagination.page_index === 1) {
                page_limit = per_page > this.pagination.filtered ? this.pagination.filtered : per_page;
            } else {
                page_limit = this.pagination.total < (per_page * this.pagination.page_index) ? this.pagination.filtered : (per_page * this.pagination.page_index);
            }

            return [{
                page_start: per_page === 0 ? 0 : (this.pagination.page_index === 1 ? this.pagination.filtered > 0 ? 1 : 0 : ( per_page * (this.pagination.page_index - 1 ) + 1)),
                page_limit: page_limit,
                next_page: next,
                previous_page: prev,
                page: page,
                active: true,
                pages: total,
                total: this.pagination.total,
                filtered: this.pagination.filtered,
                throttle: this.opt.pagination.throttle ? this.opt.pagination.throttle : defaults.pagination.throttle,
                threshold: this.opt.pagination.threshold ? this.opt.pagination.threshold : defaults.pagination.threshold,
                per_page: per_page
            }];
        },

        /**
         * Builds the infinite pagination.
         *
         * @param  page  int
         * @param  next  int
         * @param  total  int
         * @return object
         */
        buildInfinitePagination: function(page, next, total) {

            return (next === null) ? null : [{
                page: page,
                total: total,
                infinite: true
            }];
        },

        /**
         * Calculate results per page.
         *
         * @return int
         */
        calculatePagination: function() {

            switch (this.opt.pagination.method) {
                case 'single':
                case 'infinite':
                    return this.opt.pagination.throttle ? this.opt.pagination.throttle : defaults.pagination.throttle;
                case 'group':
                    return Math.ceil(this.pagination.filtered / (this.opt.pagination.throttle ? this.opt.pagination.throttle : defaults.pagination.throttle));
            }
        },

        /**
         * Shows the loading bar.
         *
         * @return void
         */
        showLoader: function() {

            var grid    = this.grid,
                loader  = this.opt.loader.selector,
                effect  = this.opt.loader.show_effect,
                duration= this.opt.loader.duration,
                $loader = this.$body.find(grid + loader + ',' + grid + ' ' + loader);

            if (!$loader.length) {
                return;
            }

            $loader.finish()[effect]({
                duration: duration
            });
        },

        /**
         * Hides the loading bar.
         *
         * @return void
         */
        hideLoader: function() {

            var grid    = this.grid,
                loader  = this.opt.loader.selector,
                effect  = this.opt.loader.hide_effect,
                duration= this.opt.loader.duration,
                $loader = this.$body.find(grid + loader + ',' + grid + ' ' + loader);

            if (!$loader.length) {
                return;
            }

            $loader.finish()[effect]({
                duration: duration
            });
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

            $(this).trigger('dg:resetting');

            // Elements
            this.$body.find('[data-grid-sort]'+ grid).removeClass(options.sorting.asc_class).removeClass(options.sorting.asc_class);
            $search.find('input').val('');
            $search.find('select').prop('selectedIndex', 0);
            this.$body.find('select[data-grid-group]' + grid + ',' + grid +' select[data-grid-group]').find(':eq(0)').prop('selected', true);

            // Filters
            this.applied_filters = [];

            // Sort
            this.sort = [];

            // Pagination
            this.pagination.page_index = 1;

            $(this).trigger('dg:reset');
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

            if (_.isFunction(callback)) {
                callback.call(this);
            }
        },

        /**
         * Applies the scroll feature animation.
         *
         * @return void
         */
        applyScroll: function() {

            var _scroll = this.opt.pagination.scroll;

            if (_.isFunction(_scroll)) {
                _scroll();
            } else if (_scroll) {
                $(document.body).animate({ scrollTop: $(_scroll).offset().top }, 200);
            }
        },

        /**
         * Check for operators.
         *
         * @return bool
         */
        checkOperator: function(value) {
            return />|<|!=|=|<=|>=|<>/.test(value);
        },

        /**
         * Check for date.
         *
         * @return bool
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
            this.opt.pagination.scroll = element;
        },

        /**
         * Returns the throttle.
         *
         * @return int
         */
        getThrottle: function() {
            return this.opt.pagination.throttle;
        },

        /**
         * Sets the throttle.
         *
         * @param  value  int
         * @return void
         */
        setThrottle: function(value) {
            this.opt.pagination.throttle = value;
        },

        /**
         * Returns the threshold.
         *
         * @return int
         */
        getThreshold: function() {
            return this.opt.pagination.threshold;
        },

        /**
         * Sets the threshold.
         *
         * @param  value  int
         * @return void
         */
        setThreshold: function(value) {
            this.opt.pagination.threshold = value;
        }
    };

    /**
     * Data grid init.
     *
     * @param  grid  string
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
