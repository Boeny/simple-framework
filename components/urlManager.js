/**
 * Module urlManager
 * @param {string} pathname
 * @returns {object} params
 */
 var urlManager = function(params){
	obj_copy(this, params);
};
urlManager.prototype = {
	defaultPath: {},
	method: 'parse',
	rules: [],
	as_file: [],
	urlSuffix: '',
	
	parse: function(pathname){
		var error = {error: '404 Error: '+pathname+' path not recognized'};
		
		// remove url suffix
		if (this.urlSuffix){
			if (!pathname.match(this.urlSuffix)) return error;
			pathname = pathname.replace(this.urlSuffix, '');
		}
		
		// remove starting slash
		pathname = pathname.replace(/^\//, '');
		
		if (!pathname || this.isDefault(pathname)) return this.defaultPath;
		
		if (this.isFile(pathname)) return {file: pathname};
		
		var result = this.whatIs(pathname);
		return result ? result : error;
	},
	
	isDefault: function(){
		return pathname === 'index';
	},
	
	isFile: function(pathname){
		for (var i in this.as_file){
			if (pathname.match(this.makeRegExp(this.as_file[i]))) return true;
		}
		return false;
	},
	whatIs: function(pathname){
		var regexp, rule;
		
		for (var i in this.rules)// regexp: path_alias
		{
			rule = this.rules[i];
			regexp = this.makeRegExp(rule.expression);
			
			if (!pathname.match(regexp)) continue;
			
			var path_alias = rule.replace;
			var result = {};
			var v;
			
			for (var type in path_alias){
				v = path_alias[type];
				result[type] = '/' + (in_str('$', v) ? pathname.replace(regexp, v) : v);
			}
			
			return result;
		}
		return null;
	},
	
	makeRegExp: function(s){
		return s instanceof RegExp ? s : new RegExp(s);
	}
};

module.exports = urlManager;