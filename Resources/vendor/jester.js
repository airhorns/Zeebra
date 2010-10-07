// Jester version 1.6
// Compatible, tested with Underscore 1.0.1
// Released under the MIT License.

Ti.include('/vendor/date.js');
Ti.include('/vendor/objtree.js');
Ti.include('/vendor/underscore.js');

var Jester = {};
Jester.Resource = function(){};

Jester.AjaxHandler = function(url, options) {
	if(typeof(Ajax) != 'undefined') {
		return new Ajax.Request(url, options).transport;
	} else {
		return false;
	}
};


Jester.singleOrigin = true;

// Doing it this way forces the validation of the syntax but gives flexibility enough to rename the new class.
Jester.Constructor = function(model){
  return (function CONSTRUCTOR() {
    this.klass = CONSTRUCTOR;
    this.initialize.apply(this, arguments);
    this.after_initialization.apply(this, arguments);
  }).toString().replace(/CONSTRUCTOR/g, model);
};

// universal Jester callback holder for remote JSON loading
var jesterCallback = null;

_.extend(Jester.Resource, {
  model: function(model, options)
  {
    var new_model = null;
    new_model = eval(model + " = " + Jester.Constructor(model));
    _.extend(new_model, Jester.Resource);
    new_model.prototype = new Jester.Resource();

    // We delay instantiating XML.ObjTree() so that it can be listed at the end of this file instead of the beginning
    if (!Jester.Tree) {
      Jester.Tree = new XML.ObjTree();
      Jester.Tree.attr_prefix = "@";
    }
    if (!options) options = {};

    var default_options = {
      format:   "json",
      singular: _(model).underscore(),
      name:     model,
      defaultParams: {}
    };

    options              = _.extend(default_options, options);
    options.format       = options.format.toLowerCase();
    options.plural       = _(options.singular).pluralize(options.plural);
    options.singular_xml = options.singular.replace(/_/g, "-");
    options.plural_xml   = options.plural.replace(/_/g, "-");
    options.remote       = false;

    // Establish prefix
	var default_prefix;
	if(_.isUndefined(Jester.defaultPrefix)) {
		if(_.isUndefined(window)) {
			default_prefix = "http://localhost/";
		} else {
			default_prefix = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
		}
	} else {
		default_prefix = Jester.defaultPrefix;
	}
	
	
    if (options.prefix && options.prefix.match(/^https?:/))
      options.remote = true;

    if (!options.prefix)
      options.prefix = default_prefix;

    if (!options.prefix.match(/^(https?|file):/))
      options.prefix = default_prefix + (options.prefix.match(/^\//) ? "" : "/") + options.prefix;

    options.prefix = options.prefix.replace(/\b\/+$/,"");

    // Establish custom URLs
    options.urls = _.extend(this._default_urls(options), options.urls);

    // Assign options to model
    new_model.name = model;
    new_model.options = options;
    for(var opt in options)
      new_model["_" + opt] = options[opt];

    // Establish custom URL helpers
    for (var url in options.urls)
      eval('new_model._' + url + '_url = function(params) {return this._url_for("' + url + '", params);}');

    if (options.checkNew)
      this.buildAttributes(new_model, options);

	
    if (typeof(window) != 'undefined') {
      window[model] = new_model;
	}

    return new_model;
  },

  buildAttributes: function(model, options) {
    model = model || this;
    var async = options.asynchronous;

    if (async == null)
      async = true;

    var buildWork = bind(model, function(doc) {
      if (this._format == "json")
        this._attributes = this._attributesFromJSON(doc);
      else
        this._attributes = this._attributesFromTree(doc[this._singular_xml]);
    });
    model.requestAndParse(options.format, buildWork, model._new_url(), {asynchronous: async});
  },

  loadRemoteJSON : function(url, callback, user_callback) {
    // tack on user_callback if there is one, and only if it's really a function
    if (typeof(user_callback) == "function")
      jesterCallback = function(doc) {user_callback(callback(doc));};
    else
      jesterCallback = callback;

    var script = document.createElement("script");
    script.type = "text/javascript";

    if (url.indexOf("?") == -1)
      url += "?";
    else
      url += "&";
    url += "callback=jesterCallback";
    script.src = url;
	
    document.firstChild.appendChild(script);
  },

  requestAndParse : function(format, callback, url, options, user_callback, remote) {
    if (remote && format == "json" && user_callback && Jester.singleOrigin == true)
      return this.loadRemoteJSON(url, callback, user_callback);

    parse_and_callback = null;
    if (format.toLowerCase() == "json") {
      parse_and_callback = function(transport) {
        if (transport.status == 500) return callback(null);
        eval("var attributes = " + transport.responseText); // hashes need this kind of eval
        return callback(attributes);
      };
    } else {
      parse_and_callback = function(transport) {
        if (transport.status == 500) return callback(null);
        return callback(Jester.Tree.parseXML(transport.responseText));
      };
    }

    // most parse requests are going to be a GET
    if (!(options.postBody || options.parameters || options.postbody || options.method == "post")) {
      options.method = "get";
    }

    return this.request(parse_and_callback, url, options, user_callback);
  },

  // Helper to aid in handling either async or synchronous requests
  request : function(callback, url, options, user_callback) {
    if (user_callback) {
      options.asynchronous = true;
      // if an options hash was given instead of a callback
      if (typeof(user_callback) == "object") {
        for (var x in user_callback)
        options[x] = user_callback[x];
        user_callback = options.onComplete;
      }
    }
    else
      user_callback = function(arg){return arg;};

    if (options.asynchronous) {
      options.onComplete = function(transport, json) {user_callback(callback(transport), json);};
      return Jester.AjaxHandler(url, options); 
    }
    else
    {
      options.asynchronous = false; // Make sure it's set, to avoid being overridden.
      return callback(Jester.AjaxHandler(url, options));
    }
  },

  find : function(id, params, callback) {
    // allow a params hash to be omitted and a callback function given directly
    if (!callback && typeof(params) == "function") {
      callback = params;
      params = null;
    }

    var findAllWork = bind(this, function(doc) {
      if (!doc) return null;

      var collection = this._loadCollection(doc);

      if (!collection) return null;

      // This is better than requiring the controller to support a "limit" parameter
      if (id == "first")
        return collection[0];

      return collection;
    });

    var findOneWork = bind(this, function(doc) {
      if (!doc) 
		return null;

      var base = this._loadSingle(doc);
      // if there were no properties, it was probably not actually loaded
      if (!base || base._properties.length == 0) 
		return null;

      // even if the ID didn't come back, we obviously knew the ID to search with, so set it
      if (!_(base._properties).include("id"))
		base._setAttribute("id", parseInt(id));

      return base;
    });
	var url;
    if (id == "first" || id == "all") {
      url = this._list_url(params);
      return this.requestAndParse(this._format, findAllWork, url, {}, callback, this._remote);
    } else {
      if (isNaN(parseInt(id))) return null;
      if (!params) params = {};
      params.id = id;

      url = this._show_url(params);
      return this.requestAndParse(this._format, findOneWork, url, {}, callback, this._remote);
    }
  },

  build : function(attributes) {
    return new this(attributes);
  },

  create : function(attributes, params, callback) {
    // allow a params hash to be omitted and a callback function given directly
    if (!callback && typeof(params) == "function") {
      callback = params;
      params = null;
    }

    var base = new this(attributes);

    createWork = bind(this, function(saved) {
      return callback(base);
    });

    if (callback) {
      return base.save(createWork);
    }
    else {
      base.save();
      return base;
    }
  },

  // Destroys a REST object.  Can be used as follows:
  // object.destroy() - when called on an instance of a model, destroys that instance
  // Model.destroy(1) - destroys the Model object with ID 1
  // Model.destroy({parent: 3, id: 1}) - destroys the Model object with Parent ID 3 and ID 1
  //
  // Any of these forms can also be passed a callback function as an additional parameter and it works as you expect.
  destroy : function(params, callback) {
    if (typeof(params) == "function") {
      callback = params;
      params = null;
    }
    if (typeof(params) == "number") {
      params = {id: params};
    }
    params.id = params.id || this.id;
    if (!params.id) return false;

    var destroyWork = bind(this, function(transport) {
      if (transport.status == 200) {
        if (!params.id || this.id == params.id)
          this.id = null;
        return this;
      }
      else
        return false;
    });

    return this.request(destroyWork, this._destroy_url(params), {method: "delete"}, callback);
  },

  _interpolate: function(string, params) {
    if (!params) return string;
    var result = string;
    _(params).each(function(value, key) {
      var re = new RegExp(":" + key, "g");
      if (result.match(re)) {
        result = result.replace(re, value);
        delete params[key];
      }
    });
    return result;
  },

  _url_for : function(action, params) {
    if (!this._urls[action]) return "";
    // if an integer is sent, it's assumed just the ID is a parameter
    if (typeof(params) == "number") params = {id: params};

    params = _(_(this._defaultParams).clone()).extend(params);
    var url = this._interpolate(this._prefix + this._urls[action], params);
    return url + (params && !(true == _(params).isEmpty()) ? "?" + _(params).toQueryString() : "");
  },

  _default_urls : function(options) {
  	var urls = {
      'show' : "/" + options.plural + "/:id." + options.format,
      'list' : "/" + options.plural + "." + options.format,
      'new' : "/" + options.plural + "/new." + options.format
    };

    urls.create = urls.list;
    urls.destroy = urls.update = urls.show;

    return urls;
  },

  // Converts a JSON hash returns from ActiveRecord::Base#to_json into a hash of attribute values
  // Does not handle associations, as AR's #to_json doesn't either
  // Also, JSON doesn't include room to store types, so little auto-transforming is done here (just on 'id')
  _attributesFromJSON : function(json) {
    if (!json || json.constructor != Object) return false;
    if (json.attributes) json = json.attributes;

    var attributes = {};
    var i = 0;
    for (var attr in json) {
      var value = json[attr];
      if (attr == "id")
        value = parseInt(value);
      else if (attr.match(/(created_at|created_on|updated_at|updated_on)/)) {
        var date = Date.parse(value);
        if (date && !isNaN(date)) value = date;
      }
      attributes[attr] = value;
      i += 1;
    }
    if (i == 0) return false; // empty hashes should just return false

    return attributes;
  },

  // Converts the XML tree returned from a single object into a hash of attribute values
  _attributesFromTree : function(elements) {
    var attributes = {};
	x = 0;
    for (var attr in elements) {
	x++;
      // pull out the value
      var value = elements[attr];
      if (elements[attr] && elements[attr]["@type"]) {
        if (elements[attr]["#text"])
          value = elements[attr]["#text"];
        else
          value = undefined;
      }

      // handle empty value (pass it through)
      if (!value) {}

      // handle scalars
      else if (typeof(value) == "string") {
        // perform any useful type transformations
        if (elements[attr]["@type"] == "integer") {
          var num = parseInt(value);
          if (!isNaN(num)) value = num;
        }
        else if (elements[attr]["@type"] == "boolean")
          value = (value == "true");
        else if (elements[attr]["@type"] == "datetime") {
          var date = Date.parse(value);
          if (!isNaN(date)) value = date;
        }
      }
      // handle arrays (associations)
      else {
        var relation = value; // rename for clarity in the context of an association

        // first, detect if it's has_one/belongs_to, or has_many
        var i = 0;
        var singular = null;
        var has_many = false;
        for (var val in relation) {
          if (i == 0)
            singular = val;
          i += 1;
        }

        // has_many
        if (relation[singular] && typeof(relation[singular]) == "object" && i == 1) {
          value = [];
          var plural = attr;
          var name = _(_(singular).camelize()).capitalize();

          // force array
          if (!(elements[plural][singular].length > 0))
            elements[plural][singular] = [elements[plural][singular]];
			_(elements[plural][singular]).each(_.bind(function(single) {
				  // if the association hasn't been modeled, do a default modeling here
				  // hosted object's prefix and format are inherited, singular and plural are set
				  // from the XML
				  if (eval("typeof(" + name + ")") == "undefined") {
				    Jester.Resource.model(name, {prefix: this._prefix, singular: singular, plural: plural, format: this._format});
				  }
				  var base = eval(name + ".build(this._attributesFromTree(single))");
				  value.push(base);
			}, this));
        }
        // has_one or belongs_to
        else {
          singular = attr;
          name = _(singular).capitalize();

          // if the association hasn't been modeled, do a default modeling here
          // hosted object's prefix and format are inherited, singular is set from the XML
          if (eval("typeof(" + name + ")") == "undefined") {
            Jester.Resource.model(name, {prefix: this._prefix, singular: singular, format: this._format});
          }
          value = eval(name + ".build(this._attributesFromTree(value))");
        }
      }

      // transform attribute name if needed
      attribute = attr.replace(/-/g, "_");
      attributes[attribute] = value;
      if(x == 5)
		break;
    }

    return attributes;
  },

  _loadSingle : function(doc) {
    var attributes;
    if (this._format == "json")
      attributes = this._attributesFromJSON(doc);
    else
      attributes = this._attributesFromTree(doc[this._singular_xml]);
	
    return this.build(attributes);
  },

  _loadCollection : function(doc) {
    var collection;
    if (this._format == "json") {
      collection = _(doc).map( bind(this, function(item) {
        return this.build(this._attributesFromJSON(item));
      }));
    }
    else {
      // if only one result, wrap it in an array
      if (!Jester.Resource.elementHasMany(doc[this._plural_xml]))
        doc[this._plural_xml][this._singular_xml] = [doc[this._plural_xml][this._singular_xml]];

      collection = _(doc[this._plural_xml][this._singular_xml]).map( bind(this, function(elem) {
        return this.build(this._attributesFromTree(elem));
      }));
    }
    return collection;
  }

});

_.extend(Jester.Resource.prototype, {
  initialize : function(attributes) {
    // Initialize no attributes, no associations
    this._properties = [];
    this._associations = [];

    this.setAttributes(this.klass._attributes || {});
    this.setAttributes(attributes);

    // Initialize with no errors
    this.errors = [];

    // Establish custom URL helpers
    for (var url in this.klass._urls)
      eval('this._' + url + '_url = function(params) {return this._url_for("' + url + '", params);}');
  },
  after_initialization: function(){},

  new_record : function() {return !(this.id);},
  valid : function() {return true == _(this.errors).isEmpty();},

  reload : function(callback) {
    var reloadWork = bind(this, function(copy) {
      this._resetAttributes(copy.attributes(true));

      if (callback)
        return callback(this);
      else
        return this;
    });

    if (this.id) {
      if (callback)
        return this.klass.find(this.id, {}, reloadWork);
      else
        return reloadWork(this.klass.find(this.id));
    }
    else
      return this;
  },

  // Destroys a REST object.  Can be used as follows:
  // object.destroy() - when called on an instance of a model, destroys that instance
  // Model.destroy(1) - destroys the Model object with ID 1
  // Model.destroy({parent: 3, id: 1}) - destroys the Model object with Parent ID 3 and ID 1
  //
  // Any of these forms can also be passed a callback function as an additional parameter and it works as you expect.
  destroy : function(params, callback) {
    if (params === undefined) {
        params = {};
    }
    if (typeof(params) == "function") {
      callback = params;
      params = {};
    }
    if (typeof(params) == "number") {
      params = {id: params};
    }
    if (!params.id) {
        params.id = this.id;
    }
    if (!params.id) return false;

    // collect params from instance if we're being called as an instance method
    if (this._properties !== undefined) {
      _(this._properties).each( bind(this, function(value, i) {
        if (params[value] === undefined) {
          params[value] = this[value];
        }
      }));
    }

    var destroyWork = bind(this, function(transport) {
      if (transport.status == 200) {
        if (!params.id || this.id == params.id)
          this.id = null;
        return this;
      }
      else
        return false;
    });

    return this.klass.request(destroyWork, this._destroy_url(params), {method: "delete"}, callback);
  },

  save : function(params, callback) {
    // allow a params hash to be omitted and a callback function given directly
    if (!callback && typeof(params) == "function") {
      callback = params;
      params = null;
    }

    var saveWork = bind(this, function(transport) {
      var saved = false;

      if (transport.responseText && (_(transport.responseText).strip() != "")) {
        var errors = this._errorsFrom(transport.responseText);
        if (errors)
          this._setErrors(errors);
        else {
          var attributes;
          if (this.klass._format == "json") {
            attributes = this._attributesFromJSON(transport.responseText);
          }
          else {
            var doc = Jester.Tree.parseXML(transport.responseText);
            if (doc[this.klass._singular_xml])
              attributes = this._attributesFromTree(doc[this.klass._singular_xml]);
          }
          if (attributes)
            this._resetAttributes(attributes);
        }
      }

      // Get ID from the location header if it's there
      if (this.new_record() && transport.status == 201) {
        loc = transport.getResponseHeader("location");
        if (loc) {
          id = parseInt(loc.match(/\/([^\/]*?)(\.\w+)?$/)[1]);
          if (!isNaN(id))
            this._setProperty("id", id);
        }
      }

      return (transport.status >= 200 && transport.status < 300 && this.errors.length == 0);
    });

    // reset errors
    this._setErrors([]);

    var url = null;
    var method = null;

    // collect params
    var objParams = {};
    var urlParams = _.clone(this.klass._defaultParams);
    if (params) {
      _.extend(urlParams, params);
    }
    _(this._properties).each( bind(this, function(value, i) {
      objParams[this.klass._singular + "[" + value + "]"] = this[value];
      urlParams[value] = this[value];
    }));

    // distinguish between create and update
    if (this.new_record()) {
      url = this._create_url(urlParams);
      method = "post";
    }
    else {
      url = this._update_url(urlParams);
      method = "put";
    }

    // send the request
    return this.klass.request(saveWork, url, {parameters: objParams, method: method}, callback);
  },

  setAttributes : function(attributes)
  {
    _(attributes).each(_.bind(function(value, key){ this._setAttribute(key, value); }, this));
    return attributes;
  },

  updateAttributes : function(attributes, callback)
  {
    this.setAttributes(attributes);
    return this.save(callback);
  },

  // mimics ActiveRecord's behavior of omitting associations, but keeping foreign keys
  attributes : function(include_associations) {
    var attributes = {};
    for (var i=0; i<this._properties.length; i++)
      attributes[this._properties[i]] = this[this._properties[i]];

    if (include_associations) {
      for (i=0; i<this._associations.length; i++)
        attributes[this._associations[i]] = this[this._associations[i]];
    }
    return attributes;
  },

  /*
    Internal methods.
  */

  _attributesFromJSON: function()
  {
    return this.klass._attributesFromJSON.apply(this.klass, arguments);
  },

  _attributesFromTree: function()
  {
    return this.klass._attributesFromTree.apply(this.klass, arguments);
  },

  _errorsFrom : function(raw) {
    if (this.klass._format == "json")
      return this._errorsFromJSON(raw);
    else
      return this._errorsFromXML(raw);
  },

    // Pulls errors from JSON
  _errorsFromJSON : function(json) {
    try {
      json = eval(json); // okay for arrays
    } catch(e) {
      return false;
    }

    if (!(json && json.constructor == Array && json[0] && json[0].constructor == Array)) return false;

    return json.map(function(pair) {
      return _(pair[0]).capitalize() + " " + pair[1];
    });
  },

  // Pulls errors from XML
  _errorsFromXML : function(xml) {
    if (!xml) return false;
    var doc = Jester.Tree.parseXML(xml);

    if (doc && doc.errors) {
      var errors = [];
      if (typeof(doc.errors.error) == "string")
        doc.errors.error = [doc.errors.error];

      _(doc.errors.error).each(function(value, index) {
        errors.push(value);
      });

      return errors;
    }
    else return false;
  },

  // Sets errors with an array.  Could be extended at some point to include breaking error messages into pairs (attribute, msg).
  _setErrors : function(errors) {
    this.errors = errors;
  },


  // Sets all attributes and associations at once
  // Deciding between the two on whether the attribute is a complex object or a scalar
  _resetAttributes : function(attributes) {
    this._clear();
    for (var attr in attributes)
      this._setAttribute(attr, attributes[attr]);
  },

  _setAttribute : function(attribute, value) {
    if (value && typeof(value) == "object" && value.constructor != Date)
      this._setAssociation(attribute, value);
    else
      this._setProperty(attribute, value);
  },

  _setProperties : function(properties) {
    this._clearProperties();
    for (var prop in properties)
      this._setProperty(prop, properties[prop]);
  },

  _setAssociations : function(associations) {
    this._clearAssociations();
    for (var assoc in associations)
      this._setAssociation(assoc, associations[assoc]);
  },

  _setProperty : function(property, value) {
    this[property] = value;
    if (!(_(this._properties).include(property)))
      this._properties.push(property);
  },

  _setAssociation : function(association, value) {
    this[association] = value;
    if (!(_(this._associations).include(association)))
      this._associations.push(association);
  },

  _clear : function() {
    this._clearProperties();
    this._clearAssociations();
  },

  _clearProperties : function() {
    for (var i=0; i<this._properties.length; i++)
      this[this._properties[i]] = null;
    this._properties = [];
  },

  _clearAssociations : function() {
    for (var i=0; i<this._associations.length; i++)
      this[this._associations[i]] = null;
    this._associations = [];
  },

  // helper URLs
  _url_for : function(action, params) {
    if (!params) params = this.id;
    if (typeof(params) == "object" && !params.id)
      params.id = this.id;

    return this.klass._url_for(action, params);
  }

});

// Returns true if the element has more objects beneath it, or just 1 or more attributes.
// It's not perfect, this would mess up if an object had only one attribute, and it was an array.
// For now, this is just one of the difficulties of dealing with ObjTree.
Jester.Resource.elementHasMany = function(element) {
  var i = 0;
  var singular = null;
  var has_many = false;
  for (var val in element) {
    if (i == 0)
      singular = val;
    i += 1;
  }

  return (element[singular] && typeof(element[singular]) == "object" && element[singular].length != null && i == 1);
};

// This bind function is just a reversal of Underscore's bind arguments to make it look a bit more standard

function bind(context, func) {
	return _.bind(func, context);
};

// If there is no object already called Resource, we define one to make things a little cleaner for us.
if(typeof(Resource) == "undefined") {
  var Resource = Jester.Resource;
}


/*  Exerpts from Prototype JavaScript framework, version 1.6.1
 *  (c) 2005-2009 Sam Stephenson
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *
 *  These have been mixed in to the Underscore.js namespace for easy referencing and usage elsewhere.
 *
 *--------------------------------------------------------------------------*/
_.mixin({
	underscore: function(string) {
	  return string.replace(/::/g, '/')
	             .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
	             .replace(/([a-z\d])([A-Z])/g, '$1_$2')
	             .replace(/-/g, '_')
	             .toLowerCase();
	},
	toQueryPair: function (key, value) {
	  if (_.isUndefined(value)) return key;
	  return key + '=' + encodeURIComponent(value);
	},
	toQueryString: function(obj) {
	    return _.reduce(obj, [], function(results, pvalue, pkey) {
	      var key = encodeURIComponent(pkey), values = pvalue;

	      if (values && typeof values == 'object') {
	        if (_.isArray(values))
	          return results.concat(_.map(values, _.bind(_.toQueryPair, '', [key])));
	      } else results.push(_.toQueryPair(key, values));
	      return results;
	    }).join('&');
	},
	strip: function(string) {
    	return string.replace(/^\s+/, '').replace(/\s+$/, '');
  	},
	pluralize: function(str, plural) {	
	  if(plural)str=plural;
	  else {
	    var uncountable_words=['equipment','information','rice','money','species','series','fish','sheep','moose'];
	    var uncountable=false;
	    for(var x=0;!uncountable&&x<uncountable_words.length;x++)uncountable=(uncountable_words[x].toLowerCase()==str.toLowerCase());
	    if(!uncountable) {
	      var rules=[
	        [new RegExp('(m)an$','gi'),'$1en'],
	        [new RegExp('(pe)rson$','gi'),'$1ople'],
	        [new RegExp('(child)$','gi'),'$1ren'],
	        [new RegExp('(ax|test)is$','gi'),'$1es'],
	        [new RegExp('(octop|vir)us$','gi'),'$1i'],
	        [new RegExp('(alias|status)$','gi'),'$1es'],
	        [new RegExp('(bu)s$','gi'),'$1ses'],
	        [new RegExp('(buffal|tomat)o$','gi'),'$1oes'],
	        [new RegExp('([ti])um$','gi'),'$1a'],
	        [new RegExp('sis$','gi'),'ses'],
	        [new RegExp('(?:([^f])fe|([lr])f)$','gi'),'$1$2ves'],
	        [new RegExp('(hive)$','gi'),'$1s'],
	        [new RegExp('([^aeiouy]|qu)y$','gi'),'$1ies'],
	        [new RegExp('(x|ch|ss|sh)$','gi'),'$1es'],
	        [new RegExp('(matr|vert|ind)ix|ex$','gi'),'$1ices'],
	        [new RegExp('([m|l])ouse$','gi'),'$1ice'],
	        [new RegExp('^(ox)$','gi'),'$1en'],
	        [new RegExp('(quiz)$','gi'),'$1zes'],
	        [new RegExp('s$','gi'),'s'],
	        [new RegExp('$','gi'),'s']
	      ];
	      var matched=false;
	      for(x=0;!matched&&x<=rules.length;x++) {
	        matched=str.match(rules[x][0]);
	        if(matched)str=str.replace(rules[x][0],rules[x][1]);
	      }
	    }
	  }
	  return str;
	},
	capitalize: function(string){
    	return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
  	},
   	camelize: function(string) {
    	var parts = string.split('-'), len = parts.length;
	    if (len == 1) return parts[0];

	    var camelized = string.charAt(0) == '-'
	      ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1)
	      : parts[0];

	    for (var i = 1; i < len; i++)
	      camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);

	    return camelized;
  	},
	strinclude: function (string, pattern) {
	    return string.indexOf(pattern) > -1;
	}
});