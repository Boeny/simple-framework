// sets the paths in config object related on root
module.exports = function(config_obj, root){
	var path_obj, is_root;
	var result = {};
	
	for (var current_root in config_obj)
	{
		path_obj = config_obj[current_root];
		
		if (typeof path_obj == 'string'){
			result[current_root] = path_obj;
		}
		else// if object
		{
			// the first key is the main root
			is_root = current_root.indexOf('ROOT') > -1;
			if (is_root) result[current_root] = root+'/';
			
			for (var current_path in path_obj){
				result[current_path] = (is_root ? '' : result[current_root]) + path_obj[current_path];
			}
		}
	}
	
	return result;
};