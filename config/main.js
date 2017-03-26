module.exports = {
	viewExt: '.html',
	autoload: {
		js: [],
		css: []
	},
	
	components: {// allowed from the app
		vm: {
			module: 'view_model',
			lang: 'ru',
			html_pattern: /<--(.*)-->/g,
			html_part: /<--(.*)-->/
		},
		
		request: {module: 'requestManager'},
		
		urlManager: {
			module: 'urlManager',
			//method: 'parse',
			//urlSuffix: '.html',
			as_file: [
				/favicon.ico/,
				/images\/.*/
			],
			//defaultPath: {controller: 'index', action: 'index'}
			
			rules: [// array because the order is important
				{expression: /^(\w+)\/(\w+)\/(\w+)/,	replace: {module: '$1', controller: '$2', action: '$3'}},
				{expression: /^(\w+)\/(\w+)/,			replace: {controller: '$1', action: '$2'}},
				{expression: /^(\w+)/,				replace: {action: '$1'}}
			]
		}
	}
};