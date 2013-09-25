var utils = require('./../public/src/utils.js'),
	RDB = require('./redis.js'),
	async = require('async'),
	path = require('path'),
	fs = require('fs'),
	winston = require('winston'),
	nconf = require('nconf');

(function (Meta) {

	Meta.configs = {
		init: function (callback) {
			Meta.configs.list(function (err, config) {
				if (!err) {
					Meta.config = config;
					callback();
				} else {
					winston.error(err);
				}
			});
		},
		list: function (callback) {
			RDB.hgetall('config', function (err, config) {
				if (!err) {
					config = config || {};
					config.status = 'ok';
					callback(err, config);
				} else {
					callback(new Error('could-not-read-config'));
				}
			});
		},
		get: function (field, callback) {
			RDB.hget('config', field, callback);
		},
		getFields: function (fields, callback) {
			RDB.hmgetObject('config', fields, callback);
		},
		set: function (field, value, callback) {
			RDB.hset('config', field, value, function (err, res) {
				if (callback) {
					callback(err, res);
				}
			});
		},
		setOnEmpty: function (field, value, callback) {
			this.get(field, function (err, curValue) {
				if (!curValue) {
					Meta.configs.set(field, value, callback);
				} else {
					callback();
				}
			});
		},
		remove: function (field) {
			RDB.hdel('config', field);
		}
	};

	Meta.themes = {
		get: function (callback) {
			var themePath = path.join(__dirname, '../node_modules');
			fs.readdir(themePath, function (err, files) {
				async.filter(files, function (file, next) {
					fs.stat(path.join(themePath, file), function (err, fileStat) {
						if (err) {
							next(false);
						}

						next((fileStat.isDirectory() && file.slice(0, 13) === 'nodebb-theme-'));
					});
				}, function (themes) {
					async.map(themes, function (theme, next) {
						var config = path.join(themePath, theme, 'theme.json');

						if (fs.existsSync(config)) {
							fs.readFile(config, function (err, file) {
								var configObj = JSON.parse(file.toString());
								if (!configObj.screenshot) {
									configObj.screenshot = nconf.get('relative_path') + '/images/themes/default.png';
								}

								next(err, configObj);
							});
						} else {
							next();
						}
					}, function (err, themes) {
						themes = themes.filter(function (theme) {
							return (theme !== undefined);
						});
						callback(null, themes);
					});
				});
			});
		}
	};

	Meta.title = {
		build: function (urlFragment, current_user, callback) {
			var self = this,
				user = require('./user');

			async.parallel({
				title: function (next) {
					self.parseFragment(urlFragment, next);
				},
				notifCount: function (next) {
					user.notifications.getUnreadCount(current_user, next);
				}
			}, function (err, values) {
				var title;

				if (err) {
					title = Meta.config.title || 'NodeBB';
				} else {
					title = (values.title ? values.title + ' | ' : '') + (Meta.config.title || 'NodeBB');
				}

				callback(null, title, values.notifCount);
			});
		},
		parseFragment: function (urlFragment, callback) {
			if (urlFragment === '') {
				callback(null, 'Index');
			} else if (urlFragment === 'recent') {
				callback(null, 'Recent Topics');
			} else if (urlFragment === 'unread') {
				callback(null, 'Unread Topics');
			} else if (urlFragment === 'users') {
				callback(null, 'Registered Users');
			} else if (/^category\/\d+\/?/.test(urlFragment)) {
				var cid = urlFragment.match(/category\/(\d+)/)[1];

				require('./categories').getCategoryField(cid, 'name', function (err, name) {
					callback(null, name);
				});
			} else if (/^topic\/\d+\/?/.test(urlFragment)) {
				var tid = urlFragment.match(/topic\/(\d+)/)[1];

				require('./topics').getTopicField(tid, 'title', function (err, title) {
					callback(null, title);
				});
			} else {
				callback(null);
			}
		}
	};

	Meta.js = {
		scripts: [
			'vendor/jquery/js/jquery.js',
			'vendor/jquery/js/jquery-ui-1.10.3.custom.min.js',
			'vendor/jquery/js/jquery.timeago.js',
			'vendor/bootstrap/js/bootstrap.min.js',
			'src/app.js',
			'vendor/requirejs/require.js',
			'vendor/bootbox/bootbox.min.js',
			'src/templates.js',
			'src/ajaxify.js',
			'src/translator.js',
			'src/jquery.form.js',
			'src/utils.js'
		],
		minFile: path.join(__dirname, '..', 'public/src/nodebb.min.js'),
		get: function (callback) {
			var mtime,
				jsPaths = this.scripts.map(function (jsPath) {
					return path.join(__dirname, '..', '/public', jsPath);
				});

			if (process.env.NODE_ENV !== 'development') {
				async.parallel({
					mtime: function (next) {
						async.map(jsPaths, fs.stat, function (err, stats) {
							async.reduce(stats, 0, function (memo, item, callback) {
								mtime = +new Date(item.mtime);
								callback(null, mtime > memo ? mtime : memo);
							}, next);
						});
					},
					minFile: function (next) {
						if (!fs.existsSync(Meta.js.minFile)) {
							winston.warn('No minified client-side library found');
							return next(null, 0);
						}

						fs.stat(Meta.js.minFile, function (err, stat) {
							next(err, +new Date(stat.mtime));
						});
					}
				}, function (err, results) {
					if (results.minFile > results.mtime) {
						winston.info('No changes to client-side libraries -- skipping minification');
						callback(null, [path.relative(path.join(__dirname, '../public'), Meta.js.minFile)]);
					} else {
						Meta.js.minify(function () {
							callback(null, [path.relative(path.join(__dirname, '../public'), Meta.js.minFile)]);
						});
					}
				});
			} else {
				callback(null, this.scripts);
			}
		},
		minify: function (callback) {
			var uglifyjs = require('uglify-js'),
				jsPaths = this.scripts.map(function (jsPath) {
					return path.join(__dirname, '..', '/public', jsPath);
				}),
				minified;

			winston.info('Minifying client-side libraries');
			minified = uglifyjs.minify(jsPaths);
			fs.writeFile(Meta.js.minFile, minified.code, function (err) {
				if (!err) {
					winston.info('Minified client-side libraries');
					callback();
				} else {
					winston.error('Problem minifying client-side libraries, exiting.');
					process.exit();
				}
			});
		}
	};

	Meta.db = {
		getFile: function (callback) {
			var multi = RDB.multi();

			multi.config('get', 'dir');
			multi.config('get', 'dbfilename');
			multi.exec(function (err, results) {
				if (err) {
					return callback(err);
				} else {
					results = results.reduce(function (memo, config) {
						memo[config[0]] = config[1];
						return memo;
					}, {});

					var dbFile = path.join(results.dir, results.dbfilename);
					callback(null, dbFile);
				}
			});
		}
	};
}(exports));