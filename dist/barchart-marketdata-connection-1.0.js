(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g=(g.Barchart||(g.Barchart = {}));g=(g.RealtimeData||(g.RealtimeData = {}));g.Connection = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function() {
    'use strict';

    var provider = {
        getInstance: function() {
            var instance = window.$ || window.jQuery || window.jquery;

            if (!instance) {
                throw new Error('jQuery is required for the browser-based version of Barchart utilities.');
            }

            provider.getInstance = function() {
                return instance;
            };

            return instance;
        }
    };

    return provider;
}();
},{}],2:[function(require,module,exports){
var Class = require('class.extend');

module.exports = function() {
    'use strict';

    return Class.extend({
        init: function() {

        },

        parse: function(textDocument) {
            if (typeof textDocument !== 'string') {
                throw new Error('The "textDocument" argument must be a string.');
            }

            return this._parse(textDocument);
        },

        _parse: function(textDocument) {
            return null;
        },

        toString: function() {
            return '[XmlDomParserBase]';
        }
    });
}();
},{"class.extend":30}],3:[function(require,module,exports){
var XmlDomParserBase = require('./../XmlDomParserBase');

module.exports = function() {
    'use strict';

    return XmlDomParserBase.extend({
        init: function() {
            if (window.DOMParser) {
                this._xmlDomParser = new DOMParser();
            } else {
                this._xmlDomParser = null;
            }
        },

        _parse: function(textDocument) {
            var xmlDocument;

            if (this._xmlDomParser) {
                xmlDocument = this._xmlDomParser.parseFromString(textDocument, 'text/xml');
            } else {
                xmlDocument = new ActiveXObject('Microsoft.XMLDOM');
                xmlDocument.async = 'false';
                xmlDocument.loadXML(textDocument);
            }

            return xmlDocument;
        },

        toString: function() {
            return '[XmlDomParser]';
        }
    });
}();
},{"./../XmlDomParserBase":2}],4:[function(require,module,exports){
var Connection = require('./websocket/Connection');

module.exports = function() {
    'use strict';

    return Connection;
}();
},{"./websocket/Connection":10}],5:[function(require,module,exports){
var Class = require('class.extend');

module.exports = function() {
	'use strict';

	return Class.extend({
		init: function() {

		},

		connect: function(server, username, password) {
			this._connect(server, username, password);
		},

		_connect: function(server, username, password) {
			return;
		},

		disconnect: function() {
			this._disconnect();
		},

		_disconnect: function() {
			return;
		},

		on: function() {
			this._on.apply(this, arguments);
		},

		_on: function() {
			return;
		},

		off: function() {
			this._off.apply(this, arguments);
		},

		_off: function() {
			return;
		},

		getMarketState: function() {
			return this._getMarketState();
		},

		_getMarketState: function() {
			return null;
		},

		getActiveSymbolCount: function() {
			return this._getActiveSymbolCount();
		},

		_getActiveSymbolCount: function() {
			return null;
		},

		getPassword: function() {
			return this._getPassword();
		},

		_getPassword: function() {
			return null;
		},

		getUsername: function() {
			return this._getUsername();
		},

		_getUsername: function() {
			return null;
		},

		toString: function() {
			return '[ConnectionBase]';
		}
	});
}();
},{"class.extend":30}],6:[function(require,module,exports){
var ProfileProvider = require('./http/ProfileProvider');

module.exports = function() {
	'use strict';

	return ProfileProvider;
}();
},{"./http/ProfileProvider":8}],7:[function(require,module,exports){
var Class = require('class.extend');

module.exports = function() {
	'use strict';

	return Class.extend({
		init: function() {

		},

		loadProfileData: function(symbols, callback) {
			return this._loadProfileData(symbols, callback);
		},

		_loadProfileData: function(symbols, callback) {
			return null;
		},

		toString: function() {
			return '[ProfileProviderBase]';
		}
	});
}();
},{"class.extend":30}],8:[function(require,module,exports){
var ProfileProviderBase = require('./../../ProfileProviderBase');

var jQueryProvider = require('./../../../common/jQuery/jQueryProvider');

module.exports = function() {
    'use strict';

    var $ = jQueryProvider.getInstance();

    return ProfileProviderBase.extend({
        init: function() {

        },

        _loadProfileData: function(symbols, callback) {
            $.ajax({
                url: 'proxies/instruments/?lookup=' + symbols.join(','),
                dataType: 'json'
            }).done(function(json) {
                var instrumentData = [ ];

                if (json.status === 200) {
                    instrumentData = json.instruments;
                } else {
                    instrumentData = [ ];
                }

                callback(instrumentData);
            });
        },

        toString: function() {
            return '[ProfileProvider]';
        }
    });
}();
},{"./../../../common/jQuery/jQueryProvider":1,"./../../ProfileProviderBase":7}],9:[function(require,module,exports){
var Connection = require('./Connection');

module.exports = function() {
	'use strict';

	return Connection;
}();
},{"./Connection":4}],10:[function(require,module,exports){
var ConnectionBase = require('./../../ConnectionBase');
var MarketState = require('./../../../marketState/MarketState');
var parseMessage = require('./../../../messageParser/parseMessage');

var jQueryProvider = require('./../../../common/jQuery/jQueryProvider');

module.exports = function() {
	'use strict';

	var _API_VERSION = 4;

	var $ = jQueryProvider.getInstance();

	var Connection = function() {
		var __state = 'DISCONNECTED';
		var __isConsumerDisconnect = false;

		var __marketState = new MarketState();
		var __connection = null;

		var __marketDepthSymbols = {};
		var __marketUpdateSymbols = {};
		var __cumulativeVolumeSymbols = {};

		var __tasks = [];
		var __commands = [];
		var __feedMessages = [];
		var __networkMessages = [];

		var __listeners = {
			events: [],
			marketDepth: {},
			marketUpdate: {},
			cumulativeVolume: {},
			timestamp: []
		};

		var __loginInfo = {
			username: null,
			password: null,
			server: null
		};

		function addTask(id, symbol) {
			var task = __tasks.pop();

			if (!task) {
				__tasks.push({ id: id, symbols: [symbol] });
			} else if (task.id == id) {
				task.symbols.push(symbol);
				__tasks.push(task);
			} else {
				__tasks.push(task);
				__tasks.push({id: id, symbols: [symbol]});
			}
		}

		function broadcastEvent(eventId, message) {
			var listeners;

			switch (eventId) {
				case 'events':
					listeners = __listeners.events;
					break;
				case 'marketDepth':
					listeners = __listeners.marketDepth[message.symbol];
					break;
				case 'marketUpdate':
					listeners = __listeners.marketUpdate[message.symbol];
					break;
				case 'timestamp':
					listeners = __listeners.timestamp;
					break;
			}

			if (!listeners)
				return;

			for (var i = 0; i < listeners.length; i++) {
				var listener = listeners[i];

				listener(message);
			}
		}

		function connect(server, username, password) {
			if (__connection)
				return;

			/* don't try to reconnect if explicitly told to disconnect */
			if(__isConsumerDisconnect === true){
				return;
			}

			__loginInfo.username = username;
			__loginInfo.password = password;
			__loginInfo.server = server;

			if (window.WebSocket) {
				__state = 'DISCONNECTED';
				__connection = new WebSocket("wss://" + __loginInfo.server + "/jerq");

				__connection.onclose = function(evt) {
					console.warn(new Date() + ' connection closed.');

					__connection = null;

					if (__state != 'LOGGED_IN')
						return;

					__state = 'DISCONNECTED';

					broadcastEvent('events', { event: 'disconnect' });

					setTimeout(function() {
						// Retry the connection
						// Possible there are some timing issues. Theoretically, is a user is
						// adding a symbol at the exact same time that this triggers, the new symbol
						// coould go unheeded, or *just* the new symbol, and the old symbols
						// would be ignored.

						__connection = null;

						connect(__loginInfo.server, __loginInfo.username, __loginInfo.password);

						var marketUpdateSymbols = [ ];

						for (var s in __marketUpdateSymbols) {
							marketUpdateSymbols.push(s);
						}

						for (var s in __cumulativeVolumeSymbols) {
							marketUpdateSymbols.push(s);
						}

						marketUpdateSymbols.sort();

						var previousUpdateSymbol = null;

						for (var i = 0; i < marketUpdateSymbols.length; i++) {
							var currentUpdateSymbol = marketUpdateSymbols[i];

							if (currentUpdateSymbol !== previousUpdateSymbol) {
								addTask('MU_GO', currentUpdateSymbol);

								previousUpdateSymbol = currentUpdateSymbol;
							}
						}

						for (var k in __marketDepthSymbols) {
							addTask('MD_GO', k);
						}

					}, 5000);
				};

				__connection.onmessage = function(evt) {
					__networkMessages.push(evt.data);
				};

				__connection.onopen = function(evt) {
					console.log(new Date() + ' connection open.');
				};
			}
			else {
				console.warn('Websockets are not supported by this browser. Invoking refreshing quotes.');
				setTimeout(refreshQuotes, 1000);
			}
		}

		function disconnect() {
			__state = 'DISCONNECTED';

			if (__connection !== null) {
				__connection.send("LOGOUT\r\n");
				__connection.close();
				__connection = null;
			}

			__tasks = [];
			__commands = [];
			__feedMessages = [];

			__marketDepthSymbols = {};
			__marketUpdateSymbols = {};
		}

		function handleNetworkMessage(msg) {
			if (__state == 'DISCONNECTED')
				__state = 'CONNECTING';

			if (__state == 'CONNECTING') {
				var lines = msg.split("\n");
				for (var i = 0; i < lines.length; i++) {
					if (lines[i] == '+++') {
						__state = 'LOGGING_IN';
						__commands.push('LOGIN ' + __loginInfo.username + ':' + __loginInfo.password + " VERSION=" + _API_VERSION + "\r\n");
						return;
					}
				}
			}

			if (__state == 'LOGGING_IN') {
				if (msg.substr(0, 1) == '+') {
					__state = 'LOGGED_IN';
					broadcastEvent('events', { event : 'login success'} );
				}
				else if (msg.substr(0, 1) == '-') {
					disconnect();
					__state = 'LOGIN_FAILED';
					broadcastEvent('events', { event : 'login fail'} );
				}
			}

			if (__state == 'LOGGED_IN') {
				__feedMessages.push(msg);
			}
		}

		function getMarketState() {
			return __marketState;
		}

		function getPassword() {
			return __loginInfo.password;
		}

		function getUsername() {
			return __loginInfo.username;
		}

		function off() {
			if (arguments.length < 2)
				throw new Error("Bad number of arguments. Must pass in an eventId and handler.");

			var eventId = arguments[0];
			var handler = arguments[1];

			var symbol;

			if (arguments.length > 2) {
				symbol = arguments[2];
			} else {
				symbol = null;
			}

			var removeHandler = function(listeners) {
				var found = false;

				listeners = listeners || [ ];

				for (var i = listeners.length - 1; !(i < 0); i--) {
					if (listeners[i] == handler) {
						listeners.splice(i, 1);

						found = true;
					}
				}

				return found && listeners.length === 0;
			};

			var unsubscribe = function(trackingMap, taskName, listenerMap, additionalListenerMaps) {
				if (removeHandler(listenerMap[symbol])) {
					delete listenerMap[symbol];
					delete trackingMap[symbol];

					var stop = true;

					for (var i = 0; i < additionalListenerMaps.length; i++) {
						if (additionalListenerMaps[i][symbol]) {
							stop = false;

							break;
						}
					}

					if (stop) {
						addTask(taskName, symbol);
					}
				}
			};

			switch (eventId) {
				case 'events': {
					removeHandler(__listeners.events);

					break;
				}
				case 'marketDepth': {
					if (arguments.length < 3)
						throw new Error("Invalid arguments. Invoke as follows: off('marketDepth', handler, symbol)");

					unsubscribe(__marketDepthSymbols, "MD_STOP", __listeners.marketDepth, [ ]);

					break;
				}
				case 'marketUpdate': {
					if (arguments.length < 3)
						throw new Error("Invalid arguments. Invoke as follows: off('marketUpdate', handler, symbol)");

					unsubscribe(__marketUpdateSymbols, "MD_STOP", __listeners.marketUpdate, [ __listeners.cumulativeVolume ]);

					break;
				}
				case 'cumulativeVolume': {
					if (arguments.length < 3)
						throw new Error("Invalid arguments. Invoke as follows: off('cumulativeVolume', handler, symbol)");

					unsubscribe(__cumulativeVolumeSymbols, "MD_STOP", __listeners.cumulativeVolume, [ __listeners.marketUpdate ]);

					getMarketState().getCumulativeVolume(symbol, function(container) {
						container.off('events', handler);
					});

					break;
				}
				case 'timestamp': {
					removeHandler(__listeners.timestamp);

					break;
				}
			}
		}

		function on() {
			if (arguments.length < 2)
				throw new Error("Bad number of arguments. Must pass in an eventId and handler.");

			var eventId = arguments[0];
			var handler = arguments[1];

			var symbol;

			if (arguments.length > 2) {
				symbol = arguments[2];
			} else {
				symbol = null;
			}

			var addHandler = function(listeners) {
				listeners = listeners || [ ];

				var add = true;

				for (var i = 0; i < listeners.length; i++) {
					if (listeners[i] == handler) {
						add = false;
						break;
					}
				}

				var updatedListeners;

				if (add) {
					updatedListeners = listeners.slice(0);
					updatedListeners.push(handler);
				} else {
					updatedListeners = listeners;
				}

				return updatedListeners;
			};

			var subscribe = function(trackingMap, taskName, listenerMap, additionalListenerMaps) {
				listenerMap[symbol] = addHandler(listenerMap[symbol]);

				if (!trackingMap[symbol]) {
					trackingMap[symbol] = true;

					var start = true;

					for (var i = 0; i < additionalListenerMaps.length; i++) {
						if (additionalListenerMaps[i][symbol]) {
							start = false;

							break;
						}
					}

					if (start) {
						addTask(taskName, symbol);
					}
				}
			};

			switch (eventId) {
				case 'events': {
					__listeners.events = addHandler(__listeners.events);

					break;
				}
				case 'marketDepth': {
					if (arguments.length < 3)
						throw new Error("Invalid arguments. Invoke as follows: on('marketDepth', handler, symbol)");

					subscribe(__marketDepthSymbols, "MD_GO", __listeners.marketDepth, [ ]);

					if (getMarketState().getBook(symbol))
						handler({ type: 'INIT', symbol: symbol });

					break;
				}
				case 'marketUpdate': {
					if (arguments.length < 3)
						throw new Error("Invalid arguments. Invoke as follows: on('marketUpdate', handler, symbol)");

					subscribe(__marketUpdateSymbols, "MU_GO", __listeners.marketUpdate, [ __listeners.cumulativeVolume ]);

					if (getMarketState().getQuote(symbol))
						handler({ type: 'INIT', symbol: symbol });

					break;
				}
				case 'cumulativeVolume': {
					if (arguments.length < 3)
						throw new Error("Invalid arguments. Invoke as follows: on('cumulativeVolume', handler, symbol)");

					subscribe(__marketUpdateSymbols, "MU_GO", __listeners.cumulativeVolume, [ __listeners.marketUpdate ]);

					getMarketState().getCumulativeVolume(symbol, function(container) {
						container.on('events', handler);
					});

					break;
				}
				case 'timestamp': {
					__listeners.timestamp = addHandler(__listeners.timestamp);

					break;
				}
			}
		}

		function onNewMessage(msg) {
			var message;
			try {
				message = parseMessage(msg);
				if (message.type) {
					__marketState.processMessage(message);

					switch (message.type) {
						case 'BOOK':
							broadcastEvent('marketDepth', message);
							break;
						case 'TIMESTAMP':
							broadcastEvent('timestamp', __marketState.getTimestamp());
							break;
						default:
							broadcastEvent('marketUpdate', message);
							break;
					}
				}
				else
					console.log(msg);
			}
			catch (e) {
				console.error(e);
				console.log(message);
			}
		}

		function processCommands() {
			var cmd = __commands.shift();
			while (cmd) {
				console.log(cmd);
				__connection.send(cmd);
				cmd = __commands.shift();
			}
			setTimeout(processCommands, 200);
		}

		function processFeedMessages() {
			var done = false;
			var suffixLength = 9;

			while (!done) {
				var s = __feedMessages.shift();
				if (!s)
					done = true;
				else {
					var skip = false;

					var msgType = 1; // Assume DDF message containing \x03

					var idx = -1;
					var idxETX = s.indexOf('\x03');
					var idxNL = s.indexOf('\x0A');

					if ((idxNL > -1) && ((idxETX < 0) || (idxNL < idxETX))) {
						idx = idxNL;
						msgType = 2;
					}
					else if (idxETX > -1)
						idx = idxETX;

					if (idx > -1) {
						var epos = idx + 1;
						if (msgType == 1) {
							if (s.length < idx + suffixLength + 1) {
								if (__feedMessages.length > 0)
									__feedMessages[0] = s + __feedMessages[0];
								else {
									__feedMessages.unshift(s);
									done = true;
								}

								skip = true;
							}
							else if (s.substr(idx + 1, 1) == '\x14')
								epos += suffixLength + 1;
						}

						if (!skip) {
							var s2 = s.substring(0, epos);
							if (msgType == 2)
								s2 = s2.trim();
							else {
								idx = s2.indexOf('\x01');
								if (idx > 0)
									s2 = s2.substring(idx);
							}

							if (s2.length > 0)
								onNewMessage(s2);

							s = s.substring(epos);
							if (s.length > 0) {
								if (__feedMessages.length > 0)
									__feedMessages[0] = s + __feedMessages[0];
								else
									__feedMessages.unshift(s);
							}
						}
					}
					else {
						if (s.length > 0) {
							if (__feedMessages.length > 0)
								__feedMessages[0] = s + __feedMessages[0];
							else {
								__feedMessages.unshift(s);
								done = true;
							}
						}
					}
				}

				if (__feedMessages.length === 0)
					done = true;
			}

			setTimeout(processFeedMessages, 125);
		}

		function pumpMessages() {
			var msg = __networkMessages.shift();
			while (msg) {
				if (msg)
					handleNetworkMessage(msg);

				msg = __networkMessages.shift();
			}

			setTimeout(pumpMessages, 125);
		}

		function pumpTasks() {
			if (__state == 'LOGGED_IN') {
				while (__tasks.length > 0) {
					var task = __tasks.shift();
					var cmd = '';
					var suffix = '';
					switch (task.id) {
						case 'MD_GO':
							cmd = 'GO';
							suffix = 'Bb';
							break;
						case 'MU_GO':
							cmd = 'GO';
							suffix = 'Ssc';
							break;
						case 'MD_STOP':
							cmd = 'STOP';
							suffix = 'Bb';
							break;
						case 'MU_STOP':
							cmd = 'STOP';
							suffix = 'Ssc';
							break;
					}

					var s = cmd + ' ';
					for (var i = 0; i < task.symbols.length; i++) {
						if (i > 0)
							s += ',';
						s += task.symbols[i] + '=' + suffix;
					}

					__commands.push(s);
				}
			}

			setTimeout(pumpTasks, 250);
		}

		function refreshQuotes() {
			var symbols = [];
			for (var k in __marketUpdateSymbols) {
				symbols.push(k);
			}

			//TO DO: verify that this proxy gets market depth and then add that list

			$.ajax({
				url: 'quotes.php?username=' + __loginInfo.username + '&password=' + __loginInfo.password + '&symbols=' + symbols.join(',')
			}).done(function(xml) {
				$(xml).find('QUOTE').each(function() {
					onNewMessage('%' + this.outerHTML);
				});
			});
			setTimeout(refreshQuotes, 5000);
		}

		function getActiveSymbolCount() {
			var list = {};
			for (var k in __marketUpdateSymbols) {
				if (__marketUpdateSymbols[k] === true)
					list[k] = true;
			}

			for (var k in __marketDepthSymbols) {
				if (__marketDepthSymbols[k] === true)
					list[k] = true;
			}

			return Object.keys(list).length;
		}

		setTimeout(processCommands, 200);
		setTimeout(pumpMessages, 125);
		setTimeout(pumpTasks, 250);
		setTimeout(processFeedMessages, 125);

		return {
			connect : function(server, username, password){
				/* always reset when told to connect */
				__isConsumerDisconnect = false;

				connect(server, username, password);
				return this;
			},
			disconnect: function(){
				/* set to true so we know not to reconnect */
				__isConsumerDisconnect = true;

				disconnect();
				return this;
			},
			getMarketState: getMarketState,
			getPassword : getPassword,
			getUsername : getUsername,
			off: off,
			on: on,
			getActiveSymbolCount: getActiveSymbolCount
		};
	};

	return ConnectionBase.extend({
		init: function() {
			this._wrapppedConnection = new Connection();
		},

		_connect: function(server, username, password) {
			this._wrapppedConnection.connect(server, username, password);
		},

		_disconnect: function() {
			this._wrapppedConnection.disconnect();
		},

		_on: function() {
			this._wrapppedConnection.on.apply(this._wrapppedConnection, arguments);
		},

		_off: function() {
			this._wrapppedConnection.off.apply(this._wrapppedConnection, arguments);
		},

		_getMarketState: function() {
			return this._wrapppedConnection.getMarketState();
		},

		_getActiveSymbolCount: function() {
			return this._wrapppedConnection.getActiveSymbolCount();
		},

		_getPassword: function() {
			return this._wrapppedConnection.getPassword();
		},

		_getUsername: function() {
			return this._wrapppedConnection.getUsername();
		},

		toString: function() {
			return '[ConnectionBase]';
		}
	});
}();
},{"./../../../common/jQuery/jQueryProvider":1,"./../../../marketState/MarketState":12,"./../../../messageParser/parseMessage":15,"./../../ConnectionBase":5}],11:[function(require,module,exports){
module.exports = function() {
	'use strict';

	var EVENT_TYPE_UPDATE = 'update';
	var EVENT_TYPE_RESET = 'reset';

	var CumulativeVolume = function(symbol, tickIncrement) {
		this.symbol = symbol;

		var handlers = [ ];

		var priceLevels = { };
		var highPrice = null;
		var lowPrice = null;

		var addPriceVolume = function(priceString, priceValue) {
			return priceLevels[priceString] = {
				price: priceValue,
				volume: 0
			};
		};

		this.on = function(eventType, handler) {
			if (eventType !== 'events') {
				return;
			}

			var i = handlers.indexOf(handler);

			if (i < 0) {
				var copy = handlers.slice(0);

				copy.push(handler);

				handlers = copy;
				
				var priceLevels = this.toArray();
				
				for (var j = 0; j < priceLevels; j++) {
					sendPriceVolumeUpdate(this, handler, priceLevels[j]);
				}
			}
		};

		this.off = function(eventType, handler) {
			if (eventType !== 'events') {
				return;
			}

			var i = handlers.indexOf(handler);

			if (!(i < 0)) {
				var copy = handlers.slice(0);

				copy.splice(i, 1);

				handlers = copy;
			}
		};

		this.getVolume = function(price) {
			var priceString = price.toString();
			var priceLevel = priceLevels[priceString];

			if (priceLevel) {
				return priceLevel.volume;
			} else {
				return 0;
			}
		};

		this.incrementVolume = function(priceValue, volume) {
			if (highPrice && lowPrice) {
				if (priceValue > highPrice) {
					for (var p = highPrice + tickIncrement; p < priceValue; p += tickIncrement) {
						broadcastPriceVolumeUpdate(this, handlers, addPriceVolume(p.toString(), p));
					}

					highPrice = priceValue;
				} else if (priceValue < lowPrice) {
					for (var p = lowPrice - tickIncrement; p > priceValue; p -= tickIncrement) {
						broadcastPriceVolumeUpdate(this, handlers, addPriceVolume(p.toString(), p));
					}

					lowPrice = priceValue;
				}
			} else {
				lowPrice = highPrice = priceValue;
			}

			var priceString = priceValue.toString();
			var priceLevel = priceLevels[priceString];

			if (!priceLevel) {
				priceLevel = addPriceVolume(priceString, priceValue);
			}

			priceLevel.volume += volume;

			broadcastPriceVolumeUpdate(this, handlers, priceLevel);
		};

		this.reset = function() {
			priceLevels = { };
			highPrice = null;
			lowPrice = null;

			for (var i = 0; i < handlers.length; i++) {
				var handler = handlers[i];

				handler({ container: this, event: EVENT_TYPE_RESET });
			}
		};

		this.toArray = function() {
			var array = [ ];

			for (var p in priceLevels) {
				var priceLevel = priceLevels[p];

				array.push({
					price: priceLevel.price,
					volume: priceLevel.volume
				});
			}

			array.sort(function(a, b) {
				return a.price - b.price;
			});

			return array;
		};

		this.dispose = function() {
			priceLevels = { };
			highPrice = null;
			lowPrice = null;

			handlers = [ ];
		};
	};

	var sendPriceVolumeUpdate = function(container, handler, priceLevel) {
		try {
			handler({
				container: container,
				event: EVENT_TYPE_UPDATE,
				price: priceLevel.price,
				volume: priceLevel.volume
			});
		} catch(e) {
			console.error('An error was thrown by a cumulative volume observer.', e);
		}
	};

	var broadcastPriceVolumeUpdate = function(container, handlers, priceLevel) {
		for (var i = 0; i < handlers.length; i++) {
			sendPriceVolumeUpdate(container, handlers[i], priceLevel);
		}
	};

	return CumulativeVolume;
}();
},{}],12:[function(require,module,exports){
var CumulativeVolume = require('./CumulativeVolume');
var Profile = require('./Profile');
var Quote = require('./Quote');

var dayCodeToNumber = require('./../util/convertDayCodeToNumber');
var ProfileProvider = require('./../connection/ProfileProvider');

module.exports = function() {
	'use strict';

	var MarketState = function() {
		var _book = {};
		var _quote = {};
		var _cvol = {};

		var _timestamp;

		var _profileProvider = new ProfileProvider();

		var loadProfiles = function(symbols, callback) {
			var wrappedCallback = function(instrumentData) {
				for (var i = 0; i < instrumentData.length; i++) {
					var instrumentDataItem = instrumentData[i];

					if (instrumentDataItem.status === 200) {
						new Profile(
							instrumentDataItem.lookup,
							instrumentDataItem.symbol_description,
							instrumentDataItem.exchange_channel,
							instrumentDataItem.base_code.toString(), // bug in DDF, sends '0' to '9' as 0 to 9, so a JSON number, not string
							instrumentDataItem.point_value,
							instrumentDataItem.tick_increment
						);
					}
				}

				callback();
			};

			_profileProvider.loadProfileData(symbols, wrappedCallback);
		};

		var _getCreateBook = function(symbol) {
			if (!_book[symbol]) {
				_book[symbol] = {
					symbol : symbol,
					bids : [],
					asks : []
				};
			}
			return _book[symbol];
		};

		var _getCreateCumulativeVolume = function(symbol) {
			if (!_cvol[symbol]) {
				_cvol[symbol] = {
					container: null,
					callbacks: [ ]
				};
			}

			return _cvol[symbol];
		};

		var _getCreateQuote = function(symbol) {
			if (!_quote[symbol]) {
				_quote[symbol] = new Quote();
				_quote[symbol].symbol = symbol;
			}
			return _quote[symbol];
		};


		var _processMessage = function(message) {
			var symbol = message.symbol;

			if (message.type == 'TIMESTAMP') {
				_timestamp = message.timestamp;
				return;
			}

			// Process book messages first, they don't need profiles, etc.
			if (message.type == 'BOOK') {
				var b = _getCreateBook(symbol);
				b.asks = message.asks;
				b.bids = message.bids;
				return;
			}

			if (message.type == 'REFRESH_CUMULATIVE_VOLUME') {
				var cv = _getCreateCumulativeVolume(symbol);

				var container = cv.container;

				if (container) {
					container.reset();
				} else {
					cv.container = container = new CumulativeVolume(symbol, message.tickIncrement);

					var callbacks = cv.callbacks || [ ];

					for (var i = 0; i < callbacks.length; i++) {
						var callback = callbacks[i];

						callback(container);
					}

					cv.callbacks = null;
				}

				var priceLevels = message.priceLevels;

				for (var i = 0; i < priceLevels.length; i++) {
					var priceLevel = priceLevels[i];

					container.incrementVolume(priceLevel.price, priceLevel.volume);
				}

				return;
			}

			var p = Profile.prototype.Profiles[symbol];
			if ((!p) && (message.type != 'REFRESH_QUOTE')) {
				console.warn('No profile found for ' + symbol);
				console.log(message);
				return;
			}

			var q = _getCreateQuote(symbol);

			if ((!q.day) && (message.day)) {
				q.day = message.day;
				q.dayNum = dayCodeToNumber(q.day);
			}

			if ((q.day) && (message.day)) {
				var dayNum = dayCodeToNumber(message.day);

				if ((dayNum > q.dayNum) || ((q.dayNum - dayNum) > 5)) {
					// Roll the quote
					q.day = message.day;
					q.dayNum = dayNum;
					q.flag = 'p';
					q.bidPrice = 0.0;
					q.bidSize = undefined;
					q.askPrice = undefined;
					q.askSize = undefined;
					if (q.settlementPrice)
						q.previousPrice = q.settlementPrice;
					else if (q.lastPrice)
						q.previousPrice = q.lastPrice;
					q.lastPrice = undefined;
					q.tradePrice = undefined;
					q.tradeSize = undefined;
					q.numberOfTrades = undefined;
					q.openPrice = undefined;
					q.highPrice = undefined;
					q.lowPrice = undefined;
					q.volume = undefined;
				}
			}

			switch (message.type) {
				case 'HIGH': {
					q.highPrice = message.value;
					break;
				}
				case 'LOW': {
					q.lowPrice = message.value;
					break;
				}
				case 'OPEN': {
					q.flag = undefined;
					q.openPrice = message.value;
					q.highPrice = message.value;
					q.lowPrice = message.value;
					q.lastPrice = message.value;

					var cv = _cvol[symbol];

					if (cv && cv.container) {
						cv.container.reset();
					}

					break;
				}
				case 'OPEN_INTEREST': {
					q.openInterest = message.value;
					break;
				}
				case 'REFRESH_DDF': {
					switch (message.subrecord) {
						case '1':
						case '2':
						case '3': {
							q.message = message;
							if (message.openPrice === null)
								q.openPrice = undefined;
							else if (message.openPrice)
								q.openPrice = message.openPrice;

							if (message.highPrice === null)
								q.highPrice = undefined;
							else if (message.highPrice)
								q.highPrice = message.highPrice;

							if (message.lowPrice === null)
								q.lowPrice = undefined;
							else if (message.lowPrice)
								q.lowPrice = message.lowPrice;

							if (message.lastPrice === null)
								q.lastPrice = undefined;
							else if (message.lastPrice)
								q.lastPrice = message.lastPrice;

							if (message.bidPrice === null)
								q.bidPrice = undefined;
							else if (message.bidPrice)
								q.bidPrice = message.bidPrice;

							if (message.askPrice === null)
								q.askPrice = undefined;
							else if (message.askPrice)
								q.askPrice = message.askPrice;

							if (message.previousPrice === null)
								q.previousPrice = undefined;
							else if (message.previousPrice)
								q.previousPrice = message.previousPrice;

							if (message.settlementPrice === null) {
								q.settlementPrice = undefined;
								if (q.flag == 's')
									q.flag = undefined;
							}
							else if (message.settlementPrice)
								q.settlementPrice = message.settlementPrice;

							if (message.volume === null)
								q.volume = undefined;
							else if (message.volume)
								q.volume = message.volume;

							if (message.openInterest === null)
								q.openInterest = undefined;
							else if (message.openInterest)
								q.openInterest = message.openInterest;

							if (message.subsrecord == '1')
								q.lastUpdate = message.time;

							break;
						}
					}
					break;
				}
				case 'REFRESH_QUOTE': {
					p = new Profile(symbol, message.name, message.exchange, message.unitcode, message.pointValue, message.tickIncrement);

					q.message = message;
					q.flag = message.flag;
					q.mode = message.mode;
					q.lastUpdate = message.lastUpdate;
					q.bidPrice = message.bidPrice;
					q.bidSize = message.bidSize;
					q.askPrice = message.askPrice;
					q.askSize = message.askSize;
					q.lastPrice = message.lastPrice;
					q.tradeSize = message.tradeSize;
					q.numberOfTrades = message.numberOfTrades;
					q.previousPrice = message.previousPrice;
					q.settlementPrice = message.settlementPrice;
					q.openPrice = message.openPrice;
					q.highPrice = message.highPrice;
					q.lowPrice = message.lowPrice;
					q.volume = message.volume;
					q.openInterest = message.openInterest;

					if (message.tradeTime)
						q.time = message.tradeTime;
					else if (message.timeStamp)
						q.time = message.timeStamp;
					break;
				}
				case 'SETTLEMENT': {
					q.lastPrice = message.value;
					q.settlement = message.value;
					if (message.element == 'D')
						q.flag = 's';
					break;
				}
				case 'TOB': {
					q.bidPrice = message.bidPrice;
					q.bidSize = message.bidSize;
					q.askPrice = message.askPrice;
					q.askSize = message.askSize;
					if (message.time)
						q.time = message.time;

					break;
				}
				case 'TRADE': {
					q.tradePrice = message.tradePrice;
					q.lastPrice = message.tradePrice;
					if (message.tradeSize) {
						q.tradeSize = message.tradeSize;
						q.volume += message.tradeSize;
					}

					q.ticks.push({price: q.tradePrice, size: q.tradeSize});
					while (q.ticks.length > 50) {
						q.ticks.shift();
					}

					if (!q.numberOfTrades)
						q.numberOfTrades = 0;

					q.numberOfTrades++;

					if (message.time)
						q.time = message.time;

					q.flag = undefined;

					var cv = _cvol[symbol];

					if (cv && cv.container && message.tradePrice && message.tradeSize) {
						cv.container.incrementVolume(q.tradePrice, q.tradeSize);
					}

					// TO DO: Add Time and Sales Tracking
					break;
				}
				case 'TRADE_OUT_OF_SEQUENCE': {
					if (message.tradeSize) {
						q.volume += message.tradeSize;
					}

					var cv = _cvol[symbol];

					if (cv && cv.container && message.tradePrice && message.tradeSize) {
						cv.container.incrementVolume(q.tradePrice, q.tradeSize);
					}

					break;
				}
				case 'VOLUME': {
					q.volume = message.value;
					break;
				}
				case 'VOLUME_YESTERDAY':
					break;
				case 'VWAP':
					q.vwap1 = message.value;
					break;
				default:
					console.error('Unhandled Market Message:');
					console.log(message);
					break;
			}
		};

		return {
			getBook: function(symbol) {
				return _book[symbol];
			},
			getCumulativeVolume: function(symbol, callback) {
				var cv = _getCreateCumulativeVolume(symbol);

				if (cv.container) {
					callback(cv.container);
				} else {
					cv.callbacks.push(callback);
				}
			},
			getProfile: function(symbol, callback) {
				var p = Profile.prototype.Profiles[symbol];

				if (!p) {
					loadProfiles([symbol], function() {
						p = Profile.prototype.Profiles[symbol];
						callback(p);
					});
				}
				else
					callback(p);
			},
			getQuote: function(symbol) {
				return _quote[symbol];
			},
			getTimestamp: function() {
				return _timestamp;
			},
			processMessage : _processMessage
		};
	};

	MarketState.CumulativeVolume = CumulativeVolume;
	MarketState.Profile = Profile;
    MarketState.Quote = Quote;

    return MarketState;
}();
},{"./../connection/ProfileProvider":6,"./../util/convertDayCodeToNumber":18,"./CumulativeVolume":11,"./Profile":13,"./Quote":14}],13:[function(require,module,exports){
var parseSymbolType = require('./../util/parseSymbolType');
var priceFormatter = require('./../util/priceFormatter');

module.exports = function() {
	'use strict';

	var Profile = function(symbol, name, exchange, unitCode, pointValue, tickIncrement) {
		this.symbol = symbol;
		this.name = name;
		this.exchange = exchange;
		this.unitCode = unitCode;
		this.pointValue = pointValue;
		this.tickIncrement = tickIncrement;

		var info = parseSymbolType(this.symbol);

		if (info) {
			if (info.type === 'future') {
				this.root = info.root;
				this.month = info.month;
				this.year = info.year;
			}
		}

		Profile.prototype.Profiles[symbol] = this;
	};

	Profile.prototype.Profiles = { };

	Profile.prototype.PriceFormatter = function(fractionSeparator, specialFractions, thousandsSeparator) {
		var format = priceFormatter(fractionSeparator, specialFractions, thousandsSeparator).format;

		Profile.prototype.formatPrice = function(price) {
			return format(price, this.unitCode);
		};
	};

	Profile.prototype.PriceFormatter('-', true);

	return Profile;
}();
},{"./../util/parseSymbolType":19,"./../util/priceFormatter":20}],14:[function(require,module,exports){
module.exports = function() {
	'use strict';

	return function() {
		this.symbol = null;
		this.message = null;
		this.flag = null;
		this.mode = null;
		this.day = null;
		this.dayNum = 0;
		this.session = null;
		this.lastUpdate = null;
		this.bidPrice = null;
		this.bidSize = null;
		this.askPrice = null;
		this.askSize = null;
		this.lastPrice = null;
		this.tradePrice = null;
		this.tradeSize = null;
		this.numberOfTrades = null;
		this.vwap1 = null; // Exchange Provided
		this.vwap2 = null; // Calculated
		this.settlementPrice = null;
		this.openPrice = null;
		this.highPrice = null;
		this.lowPrice = null;
		this.volume = null;
		this.openInterest = null;
		this.previousPrice = null;
		this.time = null;
		this.ticks = [];
	};
}();
},{}],15:[function(require,module,exports){
var XmlDomParser = require('./../common/xml/XmlDomParser');

var parseValue = require('./parseValue');
var parseTimestamp = require('./parseTimestamp');

module.exports = function() {
	'use strict';

	return function(msg) {
		var message = {
			message : msg,
			type : null
		};

		switch (msg.substr(0, 1)) {
			case '%': { // Jerq Refresh Messages
				var xmlDocument;

				try {
					var xmlDomParser = new XmlDomParser();
					xmlDocument = xmlDomParser.parse(msg.substring(1));
				}
				catch (e) {
					xmlDocument = undefined;
				}

				if (xmlDocument) {
					var node = xmlDocument.firstChild;

					switch (node.nodeName) {
						case 'BOOK': {
							message.symbol = node.attributes.getNamedItem('symbol').value;
							message.unitcode = node.attributes.getNamedItem('basecode').value;
							message.askDepth = parseInt(node.attributes.getNamedItem('bidcount').value);
							message.bidDepth = parseInt(node.attributes.getNamedItem('bidcount').value);
							message.asks = [];
							message.bids = [];

							var ary1, ary2;

							if ((node.attributes.getNamedItem('askprices')) && (node.attributes.getNamedItem('asksizes'))) {
								ary1 = node.attributes.getNamedItem('askprices').value.split(',');
								ary2 = node.attributes.getNamedItem('asksizes').value.split(',');

								for (var i = 0; i < ary1.length; i++) {
									message.asks.push({ "price" : parseValue(ary1[i], message.unitcode), "size" : parseInt(ary2[i])});
								}
							}

							if ((node.attributes.getNamedItem('bidprices')) && (node.attributes.getNamedItem('bidsizes'))) {
								ary1 = node.attributes.getNamedItem('bidprices').value.split(',');
								ary2 = node.attributes.getNamedItem('bidsizes').value.split(',');

								for (var i = 0; i < ary1.length; i++) {
									message.bids.push({ "price" : parseValue(ary1[i], message.unitcode), "size" : parseInt(ary2[i])});
								}
							}

							message.type = 'BOOK';
							break;
						}
						case 'QUOTE': {
							for (var i = 0; i < node.attributes.length; i++) {
								switch (node.attributes[i].name) {
									case 'symbol':
										message.symbol = node.attributes[i].value;
										break;
									case 'name':
										message.name = node.attributes[i].value;
										break;
									case 'exchange':
										message.exchange = node.attributes[i].value;
										break;
									case 'basecode':
										message.unitcode = node.attributes[i].value;
										break;
									case 'pointvalue':
										message.pointValue = parseFloat(node.attributes[i].value);
										break;
									case 'tickincrement':
										message.tickIncrement = parseInt(node.attributes[i].value);
										break;
									case 'flag':
										message.flag = node.attributes[i].value;
										break;
									case 'lastupdate': {
										var v = node.attributes[i].value;
										message.lastUpdate = new Date(parseInt(v.substr(0, 4)), parseInt(v.substr(4, 2)) - 1, parseInt(v.substr(6, 2)), parseInt(v.substr(8, 2)), parseInt(v.substr(10, 2)), parseInt(v.substr(12, 2)));
										break;
									}
									case 'bid':
										message.bidPrice = parseValue(node.attributes[i].value, message.unitcode);
										break;
									case 'bidsize':
										message.bidSize = parseInt(node.attributes[i].value);
										break;
									case 'ask':
										message.askPrice = parseValue(node.attributes[i].value, message.unitcode);
										break;
									case 'asksize':
										message.askSize = parseInt(node.attributes[i].value);
										break;
									case 'mode':
										message.mode = node.attributes[i].value;
										break;
								}

								var sessions = {};

								for (var j = 0; j < node.childNodes.length; j++) {
									if (node.childNodes[j].nodeName == 'SESSION') {
										var s = {};
										var attributes = node.childNodes[j].attributes;

										if (attributes.getNamedItem('id'))
											s.id = attributes.getNamedItem('id').value;
										if (attributes.getNamedItem('day'))
											s.day = attributes.getNamedItem('day').value;
										if (attributes.getNamedItem('last'))
											s.lastPrice = parseValue(attributes.getNamedItem('last').value, message.unitcode);
										if (attributes.getNamedItem('previous'))
											s.previousPrice = parseValue(attributes.getNamedItem('previous').value, message.unitcode);
										if (attributes.getNamedItem('open'))
											s.openPrice = parseValue(attributes.getNamedItem('open').value, message.unitcode);
										if (attributes.getNamedItem('high'))
											s.highPrice = parseValue(attributes.getNamedItem('high').value, message.unitcode);
										if (attributes.getNamedItem('low'))
											s.lowPrice = parseValue(attributes.getNamedItem('low').value, message.unitcode);
										if (attributes.getNamedItem('tradesize'))
											s.tradeSize = parseInt(attributes.getNamedItem('tradesize').value);
										if (attributes.getNamedItem('numtrades'))
											s.numberOfTrades = parseInt(attributes.getNamedItem('numtrades').value);
										if (attributes.getNamedItem('settlement'))
											s.settlementPrice = parseValue(attributes.getNamedItem('settlement').value, message.unitcode);
										if (attributes.getNamedItem('volume'))
											s.volume = parseInt(attributes.getNamedItem('volume').value);
										if (attributes.getNamedItem('openinterest'))
											s.openInterest = parseInt(attributes.getNamedItem('openinterest').value);
										if (attributes.getNamedItem('timestamp')) {
											var v = attributes.getNamedItem('timestamp').value;
											s.timeStamp = new Date(parseInt(v.substr(0, 4)), parseInt(v.substr(4, 2)) - 1, parseInt(v.substr(6, 2)), parseInt(v.substr(8, 2)), parseInt(v.substr(10, 2)), parseInt(v.substr(12, 2)));
										}
										if (attributes.getNamedItem('tradetime')) {
											var v = attributes.getNamedItem('tradetime').value;
											s.tradeTime = new Date(parseInt(v.substr(0, 4)), parseInt(v.substr(4, 2)) - 1, parseInt(v.substr(6, 2)), parseInt(v.substr(8, 2)), parseInt(v.substr(10, 2)), parseInt(v.substr(12, 2)));
										}

										if (s.id)
											sessions[s.id] = s;
									}
								}

								var premarket = typeof(sessions.combined.lastPrice) === 'undefined';
								var postmarket = !premarket && typeof(sessions.combined.settlementPrice) !== 'undefined';

								var session = premarket ? sessions.previous : sessions.combined;

								if (session.lastPrice)
									message.lastPrice = session.lastPrice;
								if (session.previousPrice)
									message.previousPrice = session.previousPrice;
								if (session.openPrice)
									message.openPrice = session.openPrice;
								if (session.highPrice)
									message.highPrice = session.highPrice;
								if (session.lowPrice)
									message.lowPrice = session.lowPrice;
								if (session.tradeSize)
									message.tradeSize = session.tradeSize;
								if (session.numberOfTrades)
									message.numberOfTrades = session.numberOfTrades;
								if (session.settlementPrice)
									message.settlementPrice = session.settlementPrice;
								if (session.volume)
									message.volume = session.volume;
								if (session.openInterest)
									message.openInterest = session.openInterest;
								if (session.id === 'combined' && sessions.previous.openInterest)
									message.openInterest = sessions.previous.openInterest;
								if (session.timeStamp)
									message.timeStamp = session.timeStamp;
								if (session.tradeTime)
									message.tradeTime = session.tradeTime;

								// 2016/10/29, BRI. We have a problem where we don't "roll" quotes
								// for futures. For example, LEZ16 doesn't "roll" the settlementPrice
								// to the previous price -- so, we did this on the open message (2,0A).
								// Eero has another idea. Perhaps we are setting the "day" improperly
								// here. Perhaps we should base the day off of the actual session
								// (i.e. "session" variable) -- instead of taking it from the "combined"
								// session.

								if (sessions.combined.day)
									message.day = sessions.combined.day;
								if (premarket && typeof(message.flag) === 'undefined')
									message.flag = 'p';

								var p = sessions.previous;

								message.previousPreviousPrice = p.previousPrice;
								message.previousSettlementPrice = p.settlementPrice;
								message.previousOpenPrice = p.openPrice;
								message.previousHighPrice = p.highPrice;
								message.previousLowPrice = p.lowPrice;
								message.previousTimeStamp = p.timeStamp;

								if (sessions.combined.day) {
									var sessionFormT = 'session_' + sessions.combined.day + '_T';

									if (sessions.hasOwnProperty(sessionFormT)) {
										var t = sessions[sessionFormT];

										var lastPriceT = t.lastPrice;

										if (lastPriceT) {
											var tradeTimeT = t.tradeTime;
											var tradeSizeT = t.tradeSize;

											message.lastPriceT = lastPriceT;

											if (tradeTimeT) {
												var noon = new Date(tradeTimeT.getFullYear(), tradeTimeT.getMonth(), tradeTimeT.getDate(), 12, 0, 0, 0);

												message.sessionT = tradeTimeT.getTime() > noon.getTime();
											}

											if (tradeTimeT)
												message.tradeTime = tradeTimeT; // might be a problem (we've split lastPrice and lastPriceT -- we might need to split times)
											if (tradeSizeT)
												message.tradeSize = tradeSizeT;

											if (premarket || postmarket) {
												message.session = 'T';

												if (premarket) {
													if (t.volume)
														message.volume = t.volume;
													if (t.previousPrice)
														message.previousPrice = t.previousPrice;
												}
											}
										}
									}
								}
							}

							message.type = 'REFRESH_QUOTE';
							break;
						}
						case 'CV': {
							message.symbol = node.attributes.getNamedItem('symbol').value;
							message.unitCode = node.attributes.getNamedItem('basecode').value;
							message.tickIncrement = parseValue(node.attributes.getNamedItem('tickincrement').value, message.unitCode);

							var priceLevelsRaw = node.attributes.getNamedItem('data').value || '';
							var priceLevels = priceLevelsRaw.split(':');

							for (var i = 0; i < priceLevels.length; i++) {
								var priceLevelRaw = priceLevels[i];
								var priceLevelData = priceLevelRaw.split(',');

								priceLevels[i] = {
									price: parseValue(priceLevelData[0], message.unitCode),
									volume: parseInt(priceLevelData[1])
								};
							}

							priceLevels.sort(function(a, b) {
								return a.price - b.price;
							});

							message.priceLevels = priceLevels;
							message.type = 'REFRESH_CUMULATIVE_VOLUME';
							break;
						}
						default:
							console.log(msg);
							break;
					}
				}

				break;
			}
			case '\x01': { // DDF Messages
				switch (msg.substr(1, 1)) {
					case '#': {
						// TO DO: Standardize the timezones for Daylight Savings
						message.type = 'TIMESTAMP';
						message.timestamp = new Date(parseInt(msg.substr(2, 4)), parseInt(msg.substr(6, 2)) - 1, parseInt(msg.substr(8, 2)), parseInt(msg.substr(10, 2)), parseInt(msg.substr(12, 2)), parseInt(msg.substr(14, 2)));
						break;
					}
					case '2': {
						message.record = '2';
						var pos = msg.indexOf(',', 0);
						message.symbol = msg.substring(2, pos);
						message.subrecord = msg.substr(pos + 1, 1);
						message.unitcode = msg.substr(pos + 3, 1);
						message.exchange = msg.substr(pos + 4, 1);
						message.delay = parseInt(msg.substr(pos + 5, 2));
						switch (message.subrecord) {
							case '0': {
								// TO DO: Error Handling / Sanity Check
								var pos2 = msg.indexOf(',', pos + 7);
								message.value = parseValue(msg.substring(pos + 7, pos2), message.unitcode);
								message.element = msg.substr(pos2 + 1, 1);
								message.modifier = msg.substr(pos2 + 2, 1);

								switch (message.element) {
									case 'A':
										message.type = 'OPEN';
										break;
									case 'C':
										if (message.modifier == '1')
											message.type = 'OPEN_INTEREST';
										break;
									case 'D':
									case 'd':
										if (message.modifier == '0')
											message.type = 'SETTLEMENT';
										break;
									case 'V':
										if (message.modifier == '0')
											message.type = 'VWAP';
										break;
									case '0': {
										if (message.modifier == '0') {
											message.tradePrice = message.value;
											message.type = 'TRADE';
										}
										break;
									}
									case '5':
										message.type = 'HIGH';
										break;
									case '6':
										message.type = 'LOW';
										break;
									case '7': {
										if (message.modifier == '1')
											message.type ='VOLUME_YESTERDAY';
										else if (message.modifier == '6')
											message.type ='VOLUME';
										break;
									}
								}

								message.day = msg.substr(pos2 + 3, 1);
								message.session = msg.substr(pos2 + 4, 1);
								message.time = parseTimestamp(msg.substr(msg.indexOf('\x03') + 1, 9));
								break;
							}
							case '1':
							case '2':
							case '3':
							case '4': {
								var ary = msg.substring(pos + 8).split(',');
								message.openPrice = parseValue(ary[0], message.unitcode);
								message.highPrice = parseValue(ary[1], message.unitcode);
								message.lowPrice = parseValue(ary[2], message.unitcode);
								message.lastPrice = parseValue(ary[3], message.unitcode);
								message.bidPrice = parseValue(ary[4], message.unitcode);
								message.askPrice = parseValue(ary[5], message.unitcode);
								message.previousPrice = parseValue(ary[7], message.unitcode);
								message.settlementPrice = parseValue(ary[10], message.unitcode);
								message.volume = (ary[13].length > 0) ? parseInt(ary[13]) : undefined;
								message.openInterest = (ary[12].length > 0) ? parseInt(ary[12]) : undefined;
								message.day = ary[14].substr(0, 1);
								message.session = ary[14].substr(1, 1);
								message.time = parseTimestamp(msg.substr(msg.indexOf('\x03') + 1, 9));
								message.type = 'REFRESH_DDF';
								break;
							}
							case '7': {
								var pos2 = msg.indexOf(',', pos + 7);
								message.tradePrice = parseValue(msg.substring(pos + 7, pos2), message.unitcode);

								pos = pos2 + 1;
								pos2 = msg.indexOf(',', pos);
								message.tradeSize = parseInt(msg.substring(pos, pos2));
								pos = pos2 + 1;
								message.day = msg.substr(pos, 1);
								message.session = msg.substr(pos + 1, 1);
								message.time = parseTimestamp(msg.substr(msg.indexOf('\x03') + 1, 9));
								message.type = 'TRADE';
								break;
							}
							case '8': {
								var pos2 = msg.indexOf(',', pos + 7);
								message.bidPrice = parseValue(msg.substring(pos + 7, pos2), message.unitcode);
								pos = pos2 + 1;
								pos2 = msg.indexOf(',', pos);
								message.bidSize = parseInt(msg.substring(pos, pos2));
								pos = pos2 + 1;
								pos2 = msg.indexOf(',', pos);
								message.askPrice = parseValue(msg.substring(pos, pos2), message.unitcode);
								pos = pos2 + 1;
								pos2 = msg.indexOf(',', pos);
								message.askSize = parseInt(msg.substring(pos, pos2));
								pos = pos2 + 1;
								message.day = msg.substr(pos, 1);
								message.session = msg.substr(pos + 1, 1);
								message.time = parseTimestamp(msg.substr(msg.indexOf('\x03') + 1, 9));
								message.type = 'TOB';
								break;
							}
							case 'Z': {
								var pos2 = msg.indexOf(',', pos + 7);
								message.tradePrice = parseValue(msg.substring(pos + 7, pos2), message.unitcode);

								pos = pos2 + 1;
								pos2 = msg.indexOf(',', pos);
								message.tradeSize = parseInt(msg.substring(pos, pos2));
								pos = pos2 + 1;
								message.day = msg.substr(pos, 1);
								message.session = msg.substr(pos + 1, 1);
								message.time = parseTimestamp(msg.substr(msg.indexOf('\x03') + 1, 9));
								message.type = 'TRADE_OUT_OF_SEQUENCE';
								break;
							}
						}
						break;
					}
					case '3': {
						var pos = msg.indexOf(',', 0);
						message.symbol = msg.substring(2, pos);
						message.subrecord = msg.substr(pos + 1, 1);
						switch (message.subrecord) {
							case 'B': {
								message.unitcode = msg.substr(pos + 3, 1);
								message.exchange = msg.substr(pos + 4, 1);
								message.bidDepth = ((msg.substr(pos + 5, 1) == 'A') ? 10 : parseInt(msg.substr(pos + 5, 1)));
								message.askDepth = ((msg.substr(pos + 6, 1) == 'A') ? 10 : parseInt(msg.substr(pos + 6, 1)));
								message.bids = [];
								message.asks = [];
								var ary = msg.substring(pos + 8).split(',');
								for (var i = 0; i < ary.length; i++) {
									var ary2 = ary[i].split(/[A-Z]/);
									var c = ary[i].substr(ary2[0].length, 1);
									if (c <= 'J')
										message.asks.push({"price" : parseValue(ary2[0], message.unitcode), "size" : parseInt(ary2[1])});
									else
										message.bids.push({"price" : parseValue(ary2[0], message.unitcode), "size" : parseInt(ary2[1])});
								}

								message.type = 'BOOK';
								break;
							}
							default:
								break;
						}

						break;
					}
					default: {
						message.type = 'UNKNOWN';
						break;
					}
				}
			}
		}

		return message;
	};
}();
},{"./../common/xml/XmlDomParser":3,"./parseTimestamp":16,"./parseValue":17}],16:[function(require,module,exports){
module.exports = function() {
	'use strict';

	return function(bytes) {
		if (bytes.length !== 9)
			return null;

		var year = (bytes.charCodeAt(0) * 100) + bytes.charCodeAt(1) - 64;
		var month = bytes.charCodeAt(2) - 64 - 1;
		var day = bytes.charCodeAt(3) - 64;
		var hour = bytes.charCodeAt(4) - 64;
		var minute = bytes.charCodeAt(5) - 64;
		var second = bytes.charCodeAt(6) - 64;
		var ms = (0xFF & bytes.charCodeAt(7)) + ((0xFF & bytes.charCodeAt(8)) << 8);

		// 2016/02/17. JERQ is providing us with date and time values that
		// are meant to be interpreted in the exchange's local timezone.
		//
		// This is interesting because different time values (e.g. 14:30 and
		// 13:30) can refer to the same moment (e.g. EST for US equities and
		// CST for US futures).
		//
		// Furthermore, when we use the timezone-sensitive Date object, we
		// create a problem. The represents (computer) local time. So, for
		// server applications, it is recommended that we use UTC -- so
		// that the values (hours) are not changed when JSON serialized
		// to ISO-8601 format. Then, the issue is passed along to the
		// consumer (which must ignore the timezone too).

		return new Date(year, month, day, hour, minute, second, ms);
	};
}();
},{}],17:[function(require,module,exports){
var utilities = require('barchart-marketdata-utilities');

module.exports = function() {
	'use strict';

	return utilities.priceParser;
}();
},{"barchart-marketdata-utilities":23}],18:[function(require,module,exports){
module.exports = function() {
	'use strict';

	return function(dayCode) {
		var d = parseInt(dayCode, 31);

		if (d > 9) {
			d++;
		} else if (d == 0) {
			d = 10;
		}

		return d;
	};
}();
},{}],19:[function(require,module,exports){
module.exports = function() {
	'use strict';

	return function(symbol) {
		if (symbol.substring(0, 3) == '_S_') {
			return {
				'type' : 'future_spread'
			};
		}

		var re1 = /[0-9]$/;

		// If we end in a number, then we are a future

		if (re1.test(symbol)) {
			var re2 = /^(.{1,3})([A-Z])([0-9]{1,4})$/i;
			var ary = re2.exec(symbol);
			var year = parseInt(ary[3]);
			if (year < 10)
				year += 2010;
			else if (year < 100)
				year += 2000;

			return {
				type: 'future',
				symbol: ary[0],
				root: ary[1],
				month: ary[2],
				year: year
			};
		}

		return null;
	};
}();
},{}],20:[function(require,module,exports){
var utilities = require('barchart-marketdata-utilities');

module.exports = function() {
	'use strict';

	return utilities.priceFormatter;
}();
},{"barchart-marketdata-utilities":23}],21:[function(require,module,exports){
module.exports = function() {
	'use strict';

	return {
		unitCodeToBaseCode: function(unitCode) {
			switch (unitCode) {
				case '2':
					return -1;
				case '3':
					return -2;
				case '4':
					return -3;
				case '5':
					return -4;
				case '6':
					return -5;
				case '7':
					return -6;
				case '8':
					return 0;
				case '9':
					return 1;
				case 'A':
					return 2;
				case 'B':
					return 3;
				case 'C':
					return 4;
				case 'D':
					return 5;
				case 'E':
					return 6;
				case 'F':
					return 7;
				default:
					return 0;
			}
		},

		baseCodeToUnitCode: function(baseCode) {
			switch (baseCode) {
				case -1:
					return '2';
				case -2:
					return '3';
				case -3:
					return '4';
				case -4:
					return '5';
				case -5:
					return '6';
				case -6:
					return '7';
				case 0:
					return '8';
				case 1:
					return '9';
				case 2:
					return 'A';
				case 3:
					return 'B';
				case 4:
					return 'C';
				case 5:
					return 'D';
				case 6:
					return 'E';
				case 7:
					return 'F';
				default:
					return 0;
			}
		}
	};
}();
},{}],22:[function(require,module,exports){
var lodashIsNaN = require('lodash.isnan');

module.exports = function() {
	'use strict';

	return function(value, digits, thousandsSeparator) {
		if (value === '' || value === undefined || value === null || lodashIsNaN(value)) {
			return '';
		}

		var returnRef = value.toFixed(digits);

		if (thousandsSeparator && !(value > -1000 && value < 1000)) {
			var length = returnRef.length;
			var negative = value < 0;

			var found = digits === 0;
			var counter = 0;

			var buffer = [];

			for (var i = (length - 1); !(i < 0); i--) {
				if (counter === 3 && !(negative && i === 0)) {
					buffer.unshift(thousandsSeparator);

					counter = 0;
				}

				var character = returnRef.charAt(i);

				buffer.unshift(character);

				if (found) {
					counter = counter + 1;
				} else if (character === '.') {
					found = true;
				}
			}

			returnRef = buffer.join('');
		}

		return returnRef;
	};

	/*
	 // An alternative to consider ... seems about 15% faster ... not to
	 // mention much less lengthy ... but, has a problem with more than
	 // three decimal places ... regular expression needs work ...

	 return function(value, digits, thousandsSeparator) {
	 	if (typeof value === 'number' && (value || value === 0)) {
	 		return value.toFixed(digits).replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator || ',');
	 	} else {
	 		return '';
		}
	 };
	 */
}();
},{"lodash.isnan":31}],23:[function(require,module,exports){
var convert = require('./convert');
var decimalFormatter = require('./decimalFormatter');
var monthCodes = require('./monthCodes');
var priceFormatter = require('./priceFormatter');
var symbolFormatter = require('./symbolFormatter');
var symbolParser = require('./symbolParser');
var priceParser = require('./priceParser');
var timeFormatter = require('./timeFormatter');

module.exports = function() {
	'use strict';

	return {
		convert: convert,
		decimalFormatter: decimalFormatter,
		monthCodes: monthCodes,
		priceFormatter: priceFormatter,
		symbolParser: symbolParser,
		priceParser: priceParser,
		symbolFormatter: symbolFormatter,
		timeFormatter: timeFormatter
	};
}();
},{"./convert":21,"./decimalFormatter":22,"./monthCodes":24,"./priceFormatter":25,"./priceParser":26,"./symbolFormatter":27,"./symbolParser":28,"./timeFormatter":29}],24:[function(require,module,exports){
module.exports = function() {
	'use strict';

	var monthMap = { };
	var numberMap = { };

	var addMonth = function (code, name, number) {
		monthMap[code] = name;
		numberMap[code] = number;
	};

	addMonth("F", "January", 1);
	addMonth("G", "February", 2);
	addMonth("H", "March", 3);
	addMonth("J", "April", 4);
	addMonth("K", "May", 5);
	addMonth("M", "June", 6);
	addMonth("N", "July", 7);
	addMonth("Q", "August", 8);
	addMonth("U", "September", 9);
	addMonth("V", "October", 10);
	addMonth("X", "November", 11);
	addMonth("Z", "December", 12);
	addMonth("Y", "Cash", 0);

	return {
		getCodeToNameMap: function() {
			return monthMap;
		},

		getCodeToNumberMap: function() {
			return numberMap;
		}
	};
}();
},{}],25:[function(require,module,exports){
var lodashIsNaN = require('lodash.isnan');
var decimalFormatter = require('./decimalFormatter');

module.exports = function() {
	'use strict';

	function frontPad(value, digits) {
		return ['000', Math.floor(value)].join('').substr(-1 * digits);
	}

	return function(fractionSeparator, specialFractions, thousandsSeparator) {
		var format;

		function getWholeNumberAsString(value) {
			var val = Math.floor(value);

			if ((val === 0) && (fractionSeparator === ''))
				return '';
			else
				return val;
		}

		function formatDecimal(value, digits) {
			return decimalFormatter(value, digits, thousandsSeparator);
		}

		if (fractionSeparator == '.') { // Decimals
			format = function(value, unitcode) {
				switch (unitcode) {
					case '2':
						return formatDecimal(value, 3);
					case '3':
						return formatDecimal(value, 4);
					case '4':
						return formatDecimal(value, 5);
					case '5':
						return formatDecimal(value, 6);
					case '6':
						return formatDecimal(value, 7);
					case '7':
						return formatDecimal(value, 8);
					case '8':
						return formatDecimal(value, 0);
					case '9':
						return formatDecimal(value, 1);
					case 'A':
						return formatDecimal(value, 2);
					case 'B':
						return formatDecimal(value, 3);
					case 'C':
						return formatDecimal(value, 4);
					case 'D':
						return formatDecimal(value, 5);
					case 'E':
						return formatDecimal(value, 6);
					default:
						if (value === '' || value === undefined || value === null || lodashIsNaN(value))
							return '';
						else
							return value;
				}
			};
		} else {
			format = function(value, unitcode) {
				if (value === '' || value === undefined || value === null || lodashIsNaN(value))
					return '';

				var sign = (value >= 0) ? '' : '-';
				value = Math.abs(value);

				// Well, damn it, sometimes code that is beautiful just doesn't work quite right.
				// return [sign, Math.floor(value), fractionSeparator, frontPad((value - Math.floor(value)) * 8, 1)].join('');
				// will fail when Math.floor(value) is 0 and the fractionSeparator is '', since 0.500 => 04 instead of just 4

				switch (unitcode) {
					case '2':
						return [sign, getWholeNumberAsString(value), fractionSeparator, frontPad((value - Math.floor(value)) * 8, 1)].join('');
					case '3':
						return [sign, getWholeNumberAsString(value), fractionSeparator, frontPad((value - Math.floor(value)) * 16, 2)].join('');
					case '4':
						return [sign, getWholeNumberAsString(value), fractionSeparator, frontPad((value - Math.floor(value)) * 32, 2)].join('');
					case '5':
						return [sign, getWholeNumberAsString(value), fractionSeparator, frontPad((value - Math.floor(value)) * (specialFractions ? 320 : 64), (specialFractions ? 3 : 2))].join('');
					case '6':
						return [sign, getWholeNumberAsString(value), fractionSeparator, frontPad((value - Math.floor(value)) * (specialFractions ? 320 : 128), 3)].join('');
					case '7':
						return [sign, getWholeNumberAsString(value), fractionSeparator, frontPad((value - Math.floor(value)) * (specialFractions ? 320 : 256), 3)].join('');
					case '8':
						return sign + formatDecimal(value, 0);
					case '9':
						return sign + formatDecimal(value, 1);
					case 'A':
						return sign + formatDecimal(value, 2);
					case 'B':
						return sign + formatDecimal(value, 3);
					case 'C':
						return sign + formatDecimal(value, 4);
					case 'D':
						return sign + formatDecimal(value, 5);
					case 'E':
						return sign + formatDecimal(value, 6);
					default:
						return sign + value;
				}
			};
		}

		return {
			format: format
		};
	};
}();
},{"./decimalFormatter":22,"lodash.isnan":31}],26:[function(require,module,exports){
module.exports = function() {
	'use strict';

	var replaceExpressions = { };

	function getReplaceExpression(thousandsSeparator) {
		if (!replaceExpressions.hasOwnProperty(thousandsSeparator)) {
			replaceExpressions[thousandsSeparator] = new RegExp(thousandsSeparator, 'g');
		}

		return replaceExpressions[thousandsSeparator];
	}

	return function(str, unitcode, thousandsSeparator) {
		if (str.length < 1) {
			return undefined;
		} else if (str === '-') {
			return null;
		}

		if (thousandsSeparator) {
			str = str.replace(getReplaceExpression(thousandsSeparator), '');
		}

		if (str.indexOf('.') > 0) {
			return parseFloat(str);
		}

		var sign = (str.substr(0, 1) == '-') ? -1 : 1;

		if (sign === -1) {
			str = str.substr(1);
		}

		switch (unitcode) {
			case '2': // 8ths
				return sign * (((str.length > 1) ? parseInt(str.substr(0, str.length - 1)) : 0) + (parseInt(str.substr(-1)) / 8));
			case '3': // 16ths
				return sign * (((str.length > 2) ? parseInt(str.substr(0, str.length - 2)) : 0) + (parseInt(str.substr(-2)) / 16));
			case '4': // 32ths
				return sign * (((str.length > 2) ? parseInt(str.substr(0, str.length - 2)) : 0) + (parseInt(str.substr(-2)) / 32));
			case '5': // 64ths
				return sign * (((str.length > 2) ? parseInt(str.substr(0, str.length - 2)) : 0) + (parseInt(str.substr(-2)) / 64));
			case '6': // 128ths
				return sign * (((str.length > 3) ? parseInt(str.substr(0, str.length - 3)) : 0) + (parseInt(str.substr(-3)) / 128));
			case '7': // 256ths
				return sign * (((str.length > 3) ? parseInt(str.substr(0, str.length - 3)) : 0) + (parseInt(str.substr(-3)) / 256));
			case '8':
				return sign * parseInt(str);
			case '9':
				return sign * (parseInt(str) / 10);
			case 'A':
				return sign * (parseInt(str) / 100);
			case 'B':
				return sign * (parseInt(str) / 1000);
			case 'C':
				return sign * (parseInt(str) / 10000);
			case 'D':
				return sign * (parseInt(str) / 100000);
			case 'E':
				return sign * (parseInt(str) / 1000000);
			default:
				return sign * parseInt(str);
		}
	};
}();
},{}],27:[function(require,module,exports){
module.exports = function() {
	'use strict';

	return {
		format: function(symbol) {
			var returnRef;

			if (symbol !== null && typeof symbol === 'string') {
				returnRef = symbol.toUpperCase();
			} else {
				returnRef = symbol;
			}

			return returnRef;
 		}
	};
}();
},{}],28:[function(require,module,exports){
module.exports = function() {
	'use strict';

	var percentRegex = /(\.RT)$/;

	return {
		displayUsingPercent: function(symbol) {
			return percentRegex.test(symbol);
		}
	};
}();
},{}],29:[function(require,module,exports){
module.exports = function() {
	'use strict';

	return function(useTwelveHourClock, short) {
		var formatTime;

		if (useTwelveHourClock) {
			if (short) {
				formatTime = formatTwelveHourTimeShort;
			} else {
				formatTime = formatTwelveHourTime;
			}
		} else {
			if (short) {
				formatTime = formatTwentyFourHourTimeShort;
			} else {
				formatTime = formatTwentyFourHourTime;
			}
		}

		var formatters = {
			format: function(q) {
				var t = q.time;

				if (!t) {
					return '';
				} else if (!q.lastPrice || q.flag || q.sessionT) {
					return formatters.formatDate(t);
				} else {
					return formatters.formatTime(t, q.timezone);
				}
			},

			formatTime: function(date, timezone) {
				var returnRef;

				if (date) {
					returnRef = formatTime(date);

					if (timezone) {
						returnRef = returnRef + ' ' + timezone;
					}
				} else {
					returnRef = '';
				}

				return returnRef;
			},

			formatDate: function(date) {
				if (date) {
					return leftPad(date.getMonth() + 1) + '/' + leftPad(date.getDate()) + '/' + leftPad(date.getFullYear());
				} else {
					return '';
				}
			}
		};

		return formatters;
	};

	function formatTwelveHourTime(t) {
		var hours = t.getHours();
		var period;

		if (hours === 0) {
			hours = 12;
			period = 'AM';
		} else if (hours === 12) {
			hours = hours;
			period = 'PM';
		} else if (hours > 12) {
			hours = hours - 12;
			period = 'PM';
		} else {
			hours = hours;
			period = 'AM';
		}

		return leftPad(hours) + ':' + leftPad(t.getMinutes()) + ':' + leftPad(t.getSeconds()) + ' ' + period;
	}

	function formatTwelveHourTimeShort(t) {
		var hours = t.getHours();
		var period;

		if (hours === 0) {
			hours = 12;
			period = 'A';
		} else if (hours === 12) {
			hours = hours;
			period = 'P';
		} else if (hours > 12) {
			hours = hours - 12;
			period = 'P';
		} else {
			hours = hours;
			period = 'A';
		}

		return leftPad(hours) + ':' + leftPad(t.getMinutes()) + period;
	}

	function formatTwentyFourHourTime(t) {
		return leftPad(t.getHours()) + ':' + leftPad(t.getMinutes()) + ':' + leftPad(t.getSeconds());
	}

	function formatTwentyFourHourTimeShort(t) {
		return leftPad(t.getHours()) + ':' + leftPad(t.getMinutes());
	}

	function leftPad(value) {
		return ('00' + value).substr(-2);
	}
}();
},{}],30:[function(require,module,exports){
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
 
  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;
 
    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };

  //I only added this line
  module.exports = Class;
})();

},{}],31:[function(require,module,exports){
(function (global){
/**
 * lodash 3.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var numberTag = '[object Number]';

/** Used for built-in method references. */
var objectProto = global.Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is `NaN`.
 *
 * **Note:** This method is not the same as [`isNaN`](https://es5.github.io/#x15.1.2.4)
 * which returns `true` for `undefined` and other non-numeric values.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 * @example
 *
 * _.isNaN(NaN);
 * // => true
 *
 * _.isNaN(new Number(NaN));
 * // => true
 *
 * isNaN(undefined);
 * // => true
 *
 * _.isNaN(undefined);
 * // => false
 */
function isNaN(value) {
  // An `NaN` primitive is the only value that is not equal to itself.
  // Perform the `toStringTag` check first to avoid errors with some ActiveX objects in IE.
  return isNumber(value) && value != +value;
}

/**
 * Checks if `value` is classified as a `Number` primitive or object.
 *
 * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are classified
 * as numbers, use the `_.isFinite` method.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isNumber(3);
 * // => true
 *
 * _.isNumber(Number.MIN_VALUE);
 * // => true
 *
 * _.isNumber(Infinity);
 * // => true
 *
 * _.isNumber('3');
 * // => false
 */
function isNumber(value) {
  return typeof value == 'number' ||
    (isObjectLike(value) && objectToString.call(value) == numberTag);
}

module.exports = isNaN;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[9])(9)
});