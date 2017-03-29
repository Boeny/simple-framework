var h;

module.exports = function(params){
	obj_copy(this, params);
	h = this.app._require(this.app.HTML);
	
	this.Vue = this.app._require(this.app.VUE);
	__server.msg(' -vue loaded');
	
	this.renderer = this.app._require(this.app.VUE_RENDERER).createRenderer();
	__server.msg(' -vue-renderer loaded');
};

module.exports.prototype = {
	setOutput: function(o){
		this.output = o;
	},
	
	render: function(view, params){
		var app = new this.Vue({
			template: this.getView(view),
			data: params
		});
		
		this.renderer.renderToString(app, function (error, html) {
				if (error) {
					console.error(error);
					return this.output.status(500).send('Server Error');
				}
				
				this.content = html;
				
				this.setLayout(() => {
					this.end(this.getView('main', this.layouts_dir));
				});
			}
		);
	},
	
	getView: function(view, dir_alias){
		view = this.read(this.app[dir_alias || this.default_views_dir] + '/' + view + this.config.viewExt);
		
		var parts = view.match(this.html_pattern);
		if (parts){
			for (var i in parts){
				view = view.replace(parts[i], eval(parts[i].replace(this.html_part, '$1')));
			}
		}
		return view;
	},
	
	end: function(msg){
		this.output.end(msg);
	},
	
	writeHead: function(code, type){
		this.output.writeHead(code || 200, {'Content-Type': type || 'text/html'});
	},
	
	getMetas: function(){
		return	h.meta({charset: 'utf-8'})+
				h.meta({'http-equiv': 'X-UA-Compatible', content: 'IE=edge'})+
				h.meta({name: 'viewport', content: 'width=device-width, initial-scale=1'});
	},
	
	setLayout: function(success){
		if (this.layout){
			success(this.layout);
			return;
		}
		
		this.head = this.getMetas() + h.title(this.title);
		var f;
		var auto = this.app.config.autoload;
		
		if (auto && auto.length){
			for (var ext in auto)
			for (var i in auto[ext]){
				f = auto[ext][i];
				this.head += this.getFile(f, ext);
			}
		}
	},
	
	// gets the contents or url of the file
	getFile: function(f, ext){
		params = {};
		if (f.match(/^http/)){
			params.src = f;
			if (ext === 'css') params.link = 'rel';
		}
		else
			f = this.read(this.checkExt(f, ext));
		
		return h[ext == 'js' ? 'script' : 'style'](f, params);
	},
	
	// if there is no extension at the end of the path - add it
	checkExt: function(f, ext){
		ext = '.'+ext;
		return f.match(new RegExp(ext+'$')) ? f : f + ext;
	}
};