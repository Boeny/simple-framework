// file system object
var fs = require('fs');
var setPaths, config;

var App = function(site_config, site_root){
	// all paths are in "this" object now
	obj_copy(this, config);
	
	// this.config is object with params and components
	this.config = this.require(this.CONFIG_MAIN);
	
	// if site_config contains CONFIG_MAIN, it'll be available in this.site_config object
	this.mergeSiteConfig(setPaths(site_config, site_root));
	
	// create components, overwritten by site components
	this.setComponents();
};

App.prototype = {
	types: ['file','module','controller','action'],
	path_aliases: ['root','modules','controllers','actions'],
	
	require: function(path, site){
		return require((site ? this.SITE_ROOT_DIR : this.ROOT_DIR) + path);
	},
	
	// adds overwritten site main config and params of its components
	mergeSiteConfig: function(__site_config){
		// avoid to overwrite the own components dir
		var comp_dir = __site_config.COMPONENTS_DIR;
		if (comp_dir) delete __site_config.COMPONENTS_DIR;
		
		// add other site paths
		obj_copy(this, __site_config);
		
		if (__site_config.CONFIG_MAIN)
		{
			// site's params and components
			this.site_config = this.require(__site_config.CONFIG_MAIN, true);// site root
			
			// overwrite own params and components
			this.config = obj_deep_copy(this.config, this.site_config);
			
			// save the site's components dir
			this.site_config.COMPONENTS_DIR = comp_dir || this.COMPONENTS_DIR;
		}
	},
	
	// sets components from config/main -> components
	setComponents(){
		__server.msg('components loading:');
		
		var comps = this.config.components;
		var comp, site_module, this_module;
		
		for (var alias in comps){
			comp = comps[alias];
			
			if (comp.module)
			{
				site_module = this.checkSiteCompModule(alias);
				this_module = this.require(this.checkSiteCompDir(site_module, comp.module), site_module);// site root if site_module exists
				delete comp.module;
				
				comp.app = this;
				
				this[alias] = is_callable(this_module) ? new this_module(comp) : this_module;
				
				__server.msg('--"'+alias+'" component loaded');
			}
			else{
				this[alias] = comp;
			}
		}
		
		__server.line();
	},
	
	checkSiteCompModule: function(alias){
		return this.site_config && this.site_config.components && this.site_config.components[alias] && this.site_config.components[alias].module;
	},
	checkSiteCompDir: function(site_module, comp_module){
		return site_module ? this.site_config.COMPONENTS_DIR + site_module : this.COMPONENTS_DIR + comp_module;
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
	
	run: function(params, output){
		this.vm.setOutput(output);
		
		var type, object, name;
		for (var i in this.types)
		{
			type = this.types[i];
			name = params[type];
			if (!name) continue;
			
			else this.tryComponent(name, type, this.getPathFromAlias(i, name));
			return;
		}
	},
	
	getPathFromAlias: function(index, name){
		var path_alias = (this.path_aliases[index]+'_dir').toUpperCase();
		return this[path_alias] + name;
	},
	
	tryComponent: function(name, type, path){
		try{
			if (type == 'file'){
				__server.lmsg('loading file: '+name);
				this.vm.end(this.readRaw(path));
			}
			else{
				__server.lmsg('create '+type+' "'+name+'"');
				this[type] = new this.require(path, true)(this);// all this.types must lay in the site folders
				this[type].run();
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
		this.vm.render(view, params);
	}
};

module.exports = function(__config){
	config = __config;
	setPaths = require(config.ROOT_DIR + 'set_paths');
	return App;
};