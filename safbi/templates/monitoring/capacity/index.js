function validateInput(el) {
    var name  = el[0].name;
    var value = el.val();
    var rval  = {};

    if (value == "") {
	rval.status = false;
	rval.msg = "Please fill in this value."
    } else {
	rval.status = true;
    }
    console.log(el, name, value, rval);
    return rval;
};

function fetch_data(objects) {
    objects['data'] = [];

    var filter_count = 0;

    var filter_regex = new RegExp('(site|domain|host)');
    for (field in objects['options']) {
	if ( filter_regex.test(field) ) {
	    filter_count+=Number(objects['options'][field].length);
	}
    }

    if ( filter_count > 0 ) {
	$('#section-toolbar-filter-badge').html(filter_count);
    } else {
	$('#section-toolbar-filter-badge').html('');
    }

    var refresh = $(document).find('.section-refresh');
    refresh.removeClass("disabled");    
    $.ajax({
	type: "GET",
	url: "{{ url_for('api_monitoring_capacity') }}",
	success: function (e) {
	    var raw = e['data'];
	    for(r in raw) {
    		if ( raw[r].inventory.hardware_full && raw[r].inventory.software_full ) {
		    host = {
			name: raw[r].host,
			hw: JSON.parse(raw[r].inventory.hardware_full),
			sw: JSON.parse(raw[r].inventory.software_full),
		    }
		    if ( filter_host(host, objects['options']) ) {
			if ( 'domain' in objects['options'] ) {
			    for (dom in host.sw.apps.kvm.domains) {
				if ( !('filter' in host.sw.apps.kvm.domains[dom]) ) {
				    host.sw.apps.kvm.domains[dom]['filter'] = []
				}
				for ( item in objects['options']['domain'] ) {
				    var regex = new RegExp(objects['options']['domain'][item]);
				    host.sw.apps.kvm.domains[dom]['filter'].push(
					regex.test(host.sw.apps.kvm.domains[dom]['name'])
				    );
				}
			    }
			}
			objects['data'].push({
			    "name": host.name,
			    "kvm": host.sw.apps.kvm,
			    "site": host.hw.site,
			})
		    }
		}
	    }
	    OverviewLoad(objects);
	    DetailsLoad(objects);
	    refresh.addClass("disabled");
	}
    });
};
function filter_host(host, opts) {
    if ( !('apps' in host.sw || 'kvm' in host.sw.apps) ) { return false }

    var keys = ['host', 'site']
    var options = Object.keys(opts)
	.filter(key => keys.includes(key))
	.reduce((obj, key) => {
	    obj[key] = opts[key];
	    return obj;
	}, {});
    
    if ( Object.keys(options).length > 0 ) {
	var condition = { };
	for ( attr in options ) {
	    for ( regex in options[attr] ) {
		var regex = new RegExp(options[attr][regex]);
		if (attr == 'host') {
		    if ( !(attr in condition) ) {
			condition[attr] = []
		    }
		    condition[attr].push(regex.test(host.name));
		} else if (attr == 'site') {
		    if ( !(attr in condition) ) {
			condition[attr] = [];
		    }
		    condition[attr].push(regex.test(host.hw.site));
		}
	    }
	}
	if ( Object.keys(condition).length > 0 ) {
	    for (k in condition) {
		if ( !(condition[k].indexOf(true) >= 0) ) {
		    return false
		}
	    }
	    return true
	}
    } else {
	return true
    }
}; 
function OverviewLoad(objects) {
    var graph_overview_perf = objects['graph_perf'];
    
    var hosts = 0;
    var domains = 0;
    var sites = [];
    var cpu_perc = 0;
    var mem_perc = 0;
    var str_perc = 0;

    for (hv in objects['data']) {
	var storage_total = 0;
	var storage_avail = 0;
	var memory_total  = 0;
	var memory_avail  = 0;
	var cpu_total     = 0;
	var cpu_avail     = 0;
	for (pool in objects['data'][hv]['kvm']['pools']) {
	    storage_total+=Number(objects['data'][hv]['kvm']['pools'][pool]['capacity']);
	    storage_avail+=Number(objects['data'][hv]['kvm']['pools'][pool]['available']);
	}

	if ( sites.indexOf(objects['data'][hv]['site']) < 0 ) {
	    sites.push(objects['data'][hv]['site']);
	}
	
	var dom_count = 0;
	var mem_usage = 0;
	var cpu_usage = 0;
	for (dom in objects['data'][hv]['kvm']['domains']) {
	    if ( 'filter' in objects['data'][hv]['kvm']['domains'][dom] ) {
		if ( objects['data'][hv]['kvm']['domains'][dom]['filter'].indexOf(true) < 0 ) {
		    continue
		}
	    }
	    dom_count++;
	    mem_usage+=Number(objects['data'][hv]['kvm']['domains'][dom]['memory']);
	    cpu_usage+=Number(objects['data'][hv]['kvm']['domains'][dom]['vcpu']);
	}

	if ( dom_count > 0 ) {
	    str_perc+=( (storage_avail * 100) / storage_total);
	    mem_perc+=( (mem_usage * 100) / Number(objects['data'][hv]['kvm']['node']['memory_size']) )
	    cpu_perc+=( (cpu_usage * 100) / Number(objects['data'][hv]['kvm']['node']['cpu_count']) )
	    domains+=dom_count;
	    hosts++;
	}
    }
    
    str_perc = (str_perc / hosts)
    mem_perc = (mem_perc / hosts)
    cpu_perc = (cpu_perc / hosts)
    
    objects['graph_perf'].load({
	columns: [
	    ['cpu',     cpu_perc.toFixed(2)],
	    ['memory',  mem_perc.toFixed(2)],
	    ['storage', str_perc.toFixed(2)]
	]
    });    
    $('#overview-hosts-count h3').html(hosts);
    $('#overview-domains-count h3').html(domains);
    $('#overview-sites-count h3').html(sites.length);
}
function DetailsLoad(objects) {
    var content = '';
    for (data in objects['data']) {
	var storage_size_total = 0;
	var storage_size_avail = 0;
	var storage_size_alloc = 0;
	for (pool in objects['data'][data]['kvm']['pools']) {
	    storage_size_total+=Number(objects['data'][data]['kvm']['pools'][pool]['capacity']);
	    storage_size_avail+=Number(objects['data'][data]['kvm']['pools'][pool]['available']);
	    storage_size_alloc+=Number(objects['data'][data]['kvm']['pools'][pool]['allocation']);
	}
	html ='<table class="table table-striped table-sm table-bordered table-hover">';
	html+=' <thead style="background: #ededed;">';
	html+='  <tr>';
	html+='   <th colspan="4" class="bg-default" style="text-align: center;">';
	html+='    <i class="fa fa-fw fa-server"></i> ' + objects['data'][data]['name'];
	html+='    <br>';
	html+='    <i class="fa fa-fw fa-building"></i> ' + objects['data'][data]['site'];
	html+='    <br>';
	html+='    <span>';
	html+='     <i class="fa fa-fw fa-microchip"></i> ';
	html+=      objects['data'][data]['kvm']['node']['cpu_count'];
	html+='    </span>';
	html+='    <i class="fa fa-fw fa-ellipsis-v"></i>';
	html+='    <span>';
	html+='     <i class="fa fa-fw fa-memory"></i> ';
	html+=      humanSize(objects['data'][data]['kvm']['node']['memory_size']);
	html+='    </span>';
	html+='    <i class="fa fa-fw fa-ellipsis-v"></i>';
	html+='    <span>';
	html+='     <i class="fa fa-fw fa-database"></i> ';
	html+=      humanSize(storage_size_total)+' ('+objects['data'][data]['kvm']['pools'].length+')'; 
	html+='    </span>';
	// html+='    <i class="fa fa-fw fa-ellipsis-v"></i>';
	// html+='    <span>';
	// html+='     <i class="fa fa-fw fa-globe"></i> ';
	// html+=      objects['data'][data]['kvm']['pools'].length; 
	// html+='    </span>';
	html+='   </th>';
	html+='  </tr>';
	html+='  <tr>';
	html+='   <th scope="col" class="col-md-3">';
	html+='    <span>';
	html+='     <i class="fa fa-fw fa-box"></i> Domain';
	html+='    </span>';
	html+='   </th>';
	html+='   <th scope="col" class="col-md-3">';
	html+='    <span class="pull-right">';
	html+='     <i class="fa fa-fw fa-microchip"></i> vCPU';
	html+='    </span>';
	html+='   </th>';
	html+='   <th scope="col" class="col-md-3">';
	html+='    <span class="pull-right">';
	html+='     <i class="fa fa-fw fa-memory"></i> Memory';
	html+='    </span>';
	html+='   </th>';
	html+='   <th scope="col" class="col-md-3">';
	html+='    <span class="pull-right">';
	html+='     <i class="fa fa-fw fa-database"></i> Storage';
	html+='    </span>';
	html+='   </th>';
	html+='</tr>'
	html+='</thead>';
	html+='<tbody>'
	subtotal = { "domains": 0, "vcpu": 0, "memory": 0, "storage": 0, 'storage_capacity': 0 }
	for (dom in objects['data'][data]['kvm']['domains']) {
	    if ( 'filter' in objects['data'][data]['kvm']['domains'][dom] ) {	
		if ( objects['data'][data]['kvm']['domains'][dom]['filter'].indexOf(true) < 0 ) {
		    continue
		}
	    }
	    html+='<tr>';
	    html+=' <th scope="row">';
	    html+='  <span>';
	    if (objects['data'][data]['kvm']['domains'][dom]['status'] == 'running') {
		html+='<i class="fa fa-fw fa-check-circle status-green"></i> ';
	    } else {
		html+='<i class="fa fa-fw fa-exclamation-triangle status-red"></i> ';
	    }
	    html+=    objects['data'][data]['kvm']['domains'][dom]['name'];
	    html+='  </span>';
	    html+='  <span class="vm-opts pull-right">'
	    if (objects['data'][data]['kvm']['domains'][dom]['autostart'] == 'enable') {
		html+='<i class="fa fa-fw fa-stopwatch status-green" title="Autostart=yes"></i>';
	    } else {
		html+='<i class="fa fa-fw fa-stopwatch status-red" title="Autostart=no"></i>';
	    }
	    if (objects['data'][data]['kvm']['domains'][dom]['persistent'] == 'yes') {
		html+='<i class="fa fa-fw fa-anchor status-green" title="Persistent=yes"></i>';
	    } else {
		html+='<i class="fa fa-fw fa-anchor status-red" title="Persistent=no"></i>';
	    }
	    html+='  </span>'
	    html+=' </th>';
	    html+=' <th scope="row">';
	    html+='  <span class="pull-right">';
	    html+=    objects['data'][data]['kvm']['domains'][dom]['vcpu'];
	    html+='  </span>';
	    html+=' </th>';
	    html+=' <th scope="row">';
	    html+='  <span class="pull-right">';
	    html+=    humanSize(objects['data'][data]['kvm']['domains'][dom]['memory']);
	    html+='  </span></th>';
	    html+=' <th scope="row">';
	    html+='  <span class="pull-right">';
	    html+=    humanSize(objects['data'][data]['kvm']['domains'][dom]['storage_capacity']);
	    html+='  </span>';
	    html+=' </th>';
	    html+='</tr>';

	    subtotal['domains']         += 1;
	    subtotal['vcpu']            += Number(objects['data'][data]['kvm']['domains'][dom]['vcpu']);
	    subtotal['memory']          += Number(objects['data'][data]['kvm']['domains'][dom]['memory']);
	    subtotal['storage']         += Number(objects['data'][data]['kvm']['domains'][dom]['storage_alloc']);
	    subtotal['storage_capacity']+= Number(objects['data'][data]['kvm']['domains'][dom]['storage_capacity']);
	}
	
	html+='</tbody>';
	html+='<tfoot>'
	html+=' <tr style="font-style:italic;background: #e5e5e5">';
	html+='  <th scope="col">Allocated</th>';
	html+='  <th scope="col">';
	html+='   <span class="pull-right">'
	html+=     subtotal['vcpu'];
	html+='   </span>';
	html+='  </th>';
	html+='  <th scope="col">';
	html+='   <span class="pull-right">'
	html+=     humanSize(subtotal['memory']);
	html+='   </span>';
	html+='  </th>';
	html+='  <th scope="col">';
	var color = "";
	if ( storage_size_total < subtotal['storage_capacity'] ) {
	    color = "text-danger";
	}
	html+='   <span class="pull-right '+ color +'">'
	html+=     humanSize(subtotal['storage']) + ' (' + humanSize(subtotal['storage_capacity']) + ' capacity)';
	html+='   </span>';
	html+='  </th>';
	html+=' </tr>';
	if ( subtotal['domains'] == objects['data'][data]['kvm']['domains'].length ) {
	    html+=' <tr style="font-style:italic; background:#bfccb7">';
	    html+='  <th scope="col">Available</th>';
	    html+='  <th scope="col">';
	    html+='   <span class="pull-right">'
	    html+=     objects['data'][data]['kvm']['node']['cpu_count'] - subtotal['vcpu']
	    html+='   </span>';
	    html+='  </th>';
	    html+='  <th scope="col">';
	    html+='   <span class="pull-right">'
	    html+=     humanSize(objects['data'][data]['kvm']['node']['memory_size'] - subtotal['memory']);
	    html+='   </span>';
	    html+='  </th>';
	    html+='  <th scope="col">';
	    html+='   <span class="pull-right">'
	    html+=     humanSize(storage_size_avail) + ' (' + humanSize(storage_size_alloc) + ' allocated)';
	    html+='   </span>';
	    html+='  </th>';
	    html+=' </tr>';
	}
	html+='</tfoot>'
	html+='<caption align="bottom">';
	html+=  subtotal['domains'] + ' domains';
	if ( subtotal['vcpu'] > objects['data'][data]['kvm']['node']['cpu_count'] ) {
	    html+=' with CPU overcommit.'
	}
	html+='</caption>'
	html+='</table>';
	if ( subtotal['domains'] > 0 ) {
	    content+=html;
	}
    }
    $('#details-content').html(content);
};
