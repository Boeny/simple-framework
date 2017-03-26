var config = {};
// file system object
var fs = require('fs');
var setPaths = require('./set_paths');

var App = function(site_config, root){
	obj_copy(this, config);
	this.config = require(this.CONFIG_MAIN);
	this.mergeSiteConfig(setPaths(site_config, root));
	this.setComponents();
};

App.prototype = {
	types: ['file','module','controller','action'],
	path_aliases: ['root','modules','controllers','actions'],
	
	mergeSiteConfig: function(site_config){
		if (site_config.CONFIG_MAIN){
			this.config = obj_deep_copy(this.config, require(site_config.CONFIG_MAIN));
			delete site_config.CONFIG_MAIN;
		}
		obj_copy(this, site_config);
	},
	
	setComponents(){
		__server.msg('components loading:');
		
		var comps = this.config.components;
		var comp;
		
		for (var alias in comps){
			comp = comps[alias];
			
			if (comp.module){
				var m = require(this.COMPONENTS_DIR +'/'+ comp.module);
				delete comp.module;
				comp.app = this;
				
				this[alias] = is_callable(m) ? new m(comp) : m;
				
				__server.msg('--"'+alias+'" component loaded');
			}
			else{
				this[alias] = comp;
			}
		}
		
		__server.line();
	},
	
	// returns the routing function at the index of the site
	route: function(){
		var app = this;
		var urlMethod = this.urlManager[this.urlManager.method];
		
		return function(path, response){
			var params = urlMethod(path);
			
			if (!params || params.error){
				__server.lmsg(params && params.error);
				return;
			}
			
			app.run(params, response);
		};
	},
	
	getPathFromAlias: function(index, name){
		var path_alias = (this.path_aliases[index]+'_dir').toUpperCase();
		return this[path_alias] + name;
	},
	
	run: function(params, output){
		this.vm.setOutput(output);
		
		var type, object, name;
		for (var i in this.types)
		{
			type = this.types[i];
			name = params[type];
			if (!name) continue;
			
			object = this[type];
			var path = this.getPathFromAlias(i, name);
			
			if (object && object.name === name){
				__server.msg('run '+type+' "'+name+'"');
				object.run(params);
			}
			else this.tryComponent(name, type, path);
			return;
		}
	},
	
	tryComponent: function(name, type, path){
		try{
			if (type == 'file'){
				__server.lmsg('loading file: '+name);
				this.vm.end(this.readRaw(path));
			}
			else{
				__server.lmsg('create '+type+' "'+name+'"');
				this[type] = new require(path)(this);
			}
		}
		catch(e){
			__server.lmsg(e);
		}
	},
	
	readRaw: function(f){
		return fs.readFileSync(f);
	},
	
	read: function(f){
		return fs.readFileSync(f, 'utf-8');
	},
	
	render: function(view, params){
		this.vm.create(this.getView(view), params);
	}
};

module.exports = function(__config){
	config = __config;
	return App;
};