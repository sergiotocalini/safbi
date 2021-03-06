$(document).ready(function () {
    $(window).resize(function () {
        autosize_tables();
	jqlisteners();
    });
    $("select[id=customer]").on('loaded.bs.select', function (e) {
	load_select_customers($(this));
    });
    $("select[id=manager]").on('loaded.bs.select', function (e) {
	load_select_users($(this));
    });
    $("select[id=parent]").on('loaded.bs.select', function (e) {
	load_select_projects($(this));
    });
    autosize_tables();
    jqlisteners();
});

function jqlisteners() {
    /* jqlisteners_project(); */
    console.log('refresh');
};

function autosize_tables(selected) {
    if ( selected == null || selected === '' ) {
	var tables = $('body').find(".table-autosize");
    } else {
	var tables = $('body').find(selected);
    }
    tables.each(function(row){
	var selector = $(tables[row]).attr('id');
	selector = '#' + selector;
	$(selector).on('post-body.bs.table', function () {
	    jqlisteners();
	});
	$(selector).bootstrapTable({
            height: table_height(selector),
	});
	$(selector).bootstrapTable('resetView', {
            height: table_height(selector),
	});
    });
};

function table_height(table) {
    var parent = $(table).parent().parent().parent().parent();
    return parent.height();
};

function humanSize(bytes, si=false) {
    var thresh = si ? 1000 : 1024;
    if(Math.abs(bytes) < thresh) {
	return bytes + ' B';
    }
    var units = si
        ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    var u = -1;
    do {
	bytes /= thresh;
	++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1)+' '+units[u];
};

function InventoryParams(params) {
    return params
};

function InventoryResponseHandler(res) {
    var data = [];
    for(r in res.data) {
	var row = res.data[r];
	data.push({
	    id: row.hostid,
	    name: row.host,
	    hw: row.inventory.hardware_full,
	    sw: row.inventory.software_full,
	    status: row.status,
	    available: row.available,
	});
    };
    return data;
}
function InventoryRowStyle(row, index) {
    return {}
}
function InventoryFormatterSite(value, row) {
    return row.hw.site
}
function InventoryFormatterName(value, row) {
    html ='<span>'
    if ( row.hw.type == 'virtual' ) {
	html+='<i class="fa fa-fw fa-box"></i> ';
    } else if ( row.hw.type == 'physical' ) {
	html+='<i class="fa fa-fw fa-server"></i> ';
    } else {
	html+='<i class="fa fa-fw fa-question"></i> ';
    }
    html+=value;
    html+='</span>';
    html+='<span class="pull-right">'
    html+=' <img class="fa fa-fw" src="/safbi/static/extras/services/img/zabbix.png"/>';
    if ( row.sw.env == 'PROD' ) {
	html+=' <i class="fa fa-fw fa-flag status-red"></i>';
    } else if ( row.sw.env == 'TEST' ) {
	html+=' <i class="fa fa-fw fa-flag status-yellow"></i>';
    } else if ( row.sw.env == 'STAGE' ) {
	html+=' <i class="fa fa-fw fa-flag status-blue"></i>';	
    } else {
	html+=' <i class="fa fa-fw fa-flag status-gray"></i>';
    }
    if ( row.status == 1 ) {
	html+=' <i class="fa fa-fw fa-exclamation-triangle status-red"></i>';
    } else if ( row.available == 0 ) {
	html+=' <i class="fa fa-fw fa-question-circle status-gray"></i>';
    } else {
	html+=' <i class="fa fa-fw fa-check-circle status-green"></i>';
    }
    html+='</span>';
    return html
}
function InventoryFormatterChassis(value, row) {
    return row.hw.chassis
}
function InventoryFormatterSerial(value, row) {
    return row.hw.serial
}
// function InventoryFormatterInstalled(value, row) {
//     if (row.sw.installed) {
// 	return moment.unix(row.sw.installed).format("YYYY-MM-DD hh:mm");
//     }
// }
function InventoryFormatterSoftware(value, row) {
    var content = [];
    if ( row.sw.family == 'Linux' ) {
	var updates = row.sw.updates.normal + row.sw.updates.security;
	content.push({ type: 'i',
		       class: 'fab fa-fw fa-linux',
		       data: updates > 0 ? updates : '',
		       tooltip: row.sw.release
		     })
    } else if ( row.sw.family == 'Windows' ) {
	content.push({ type: 'i',
		       class: 'fab fa-fw fa-windows',
		       data: '',
		       tooltip: row.sw.release
		     })
    } else {
	content.push({ type: 'i',
		       class: 'far fa-fw fa-question-circle',
		       data: '',
		       tooltip: row.sw.release
		     })	
    }
    if ( row.sw.apps ) {
	if ( row.sw.apps.kvm ) {
    	    content.push({ type: 'img',
			   class: 'fa fa-fw img-circle',
			   src: '{{ config["CDN_EXTRAS"] }}/services/img/kvm.png',
    			   data: row.sw.apps.kvm.domains.length,
    			   tooltip: row.sw.apps.kvm.node.version_hv
    			 })
	}
    	if ( row.sw.apps.redis ) {
    	    content.push({ type: 'img',
			   class: 'fa fa-fw img-circle',
			   src: '{{ config["CDN_EXTRAS"] }}/services/img/redis.png',
    			   data: row.sw.apps.redis.databases,
    			   tooltip: row.sw.apps.redis.version
    			 })
    	}
    	if ( row.sw.apps.elastic ) {
    	    content.push({ type: 'img',
			   class: 'fa fa-fw img-circle',
			   src: '{{ config["CDN_EXTRAS"] }}/services/img/elastic.png',
    			   data: row.sw.apps.elastic.indices,
    			   tooltip: row.sw.apps.elastic.version
    			 })
    	}
    	if ( row.sw.apps.splunk ) {
    	    content.push({ type: 'img',
			   class: 'fa fa-fw img-circle',
			   src: '{{ config["CDN_EXTRAS"] }}/services/img/splunk.png',
    			   data: row.sw.apps.splunk.indexes,
    			   tooltip: row.sw.apps.splunk.version
    			 })
    	}
    	if ( row.sw.apps.docker ) {
    	    content.push({ type: 'img',
			   class: 'fa fa-fw img-circle',
			   src: '{{ config["CDN_EXTRAS"] }}/services/img/docker.png',
    			   data: row.sw.apps.docker.containers,
    			   tooltip: row.sw.apps.docker.version
    			 })
    	}
    	if ( row.sw.apps.arango ) {
    	    content.push({ type: 'img',
			   class: 'fa fa-fw img-circle',
			   src: '{{ config["CDN_EXTRAS"] }}/services/img/arango.jpg',
			   data: '',
    			   tooltip: row.sw.apps.arango.version
    		     })
    	}
    	if ( row.sw.apps.springboot ) {
    	    content.push({ type: 'img',
			   class: 'fa fa-fw img-circle',
			   src: '{{ config["CDN_EXTRAS"] }}/services/img/springboot.png',
    			   data: row.sw.apps.springboot.length,
    			   tooltip: 'Applications: ' + row.sw.apps.springboot.length
    			 })
    	}
    	if ( row.sw.apps.gunicorn ) {
    	    content.push({ type: 'img',
			   class: 'fa fa-fw img-circle',
			   src: '{{ config["CDN_EXTRAS"] }}/services/img/gunicorn.png',
    			   data: row.sw.apps.gunicorn.length,
    			   tooltip: 'Applications: ' + row.sw.apps.gunicorn.length
    			 })
    	}
    	if ( row.sw.apps.dovecot ) {
    	    content.push({ type: 'img',
			   class: 'fa fa-fw img-circle',
			   src: '{{ config["CDN_EXTRAS"] }}/services/img/dovecot.png',
    			   data: row.sw.apps.dovecot.users,
    			   tooltip: row.sw.apps.dovecot.version
    			 })
    	}
    	if ( row.sw.apps.mysql ) {
    	    content.push({ type: 'img',
			   class: 'fa fa-fw img-circle',
			   src: '{{ config["CDN_EXTRAS"] }}/services/img/mysql.png',
    			   data: row.sw.apps.mysql.databases,
    			   tooltip: row.sw.apps.mysql.version
    			 })
    	}
    	if ( row.sw.apps.postgres ) {
    	    content.push({ type: 'img',
			   class: 'fa fa-fw img-circle',
			   src: '{{ config["CDN_EXTRAS"] }}/services/img/postgres.png',
    			   data: row.sw.apps.postgres.databases,
    			   tooltip: row.sw.apps.postgres.version
    			 })
    	}
	if ( row.sw.apps.openldap ) {
    	    content.push({ type: 'img',
			   class: 'fa fa-fw img-circle',
			   src: '{{ config["CDN_EXTRAS"] }}/services/img/openldap.png',
			   data: '',
    			   tooltip: row.sw.apps.openldap.version
    			 })
    	}
	if ( row.sw.apps.logstash ) {
    	    content.push({ type: 'img',
			   class: 'fa fa-fw img-circle',
			   src: '{{ config["CDN_EXTRAS"] }}/services/img/logstash.png',
			   data: '',
    			   tooltip: row.sw.apps.logstash.version
    			 })
    	}
	if ( row.sw.apps.jenkins ) {
    	    content.push({ type: 'img',
			   class: 'fa fa-fw img-circle',
			   src: '{{ config["CDN_EXTRAS"] }}/services/img/jenkins.png',
			   data: '',
    			   tooltip: row.sw.apps.jenkins.version
    			 })
    	}
    }
    html = '';
    for (index=0; index < content.length; index++) {
	if ( index > 0 && index < content.length ) {
	    html+='<i class="fa fa-fw fa-ellipsis-v"></i>';
	}
	if ( content[index]['type'] == 'i' ) {
	    html+='<span title="' + content[index]['tooltip'] + '">';
	    html+='<i class="' + content[index]['class'] + '"></i>';
	    html+=content[index]['data'] + '</span>';
	} else if ( content[index]['type'] == 'img' ) {
	    html+='<span title="' + content[index]['tooltip'] + '">';
	    html+='<img class="' + content[index]['class'];
	    html+='" src="' + content[index]['src'] + '"/> ';
	    html+=content[index]['data'] + '</span>';	    
	}
    }
    return html
}
function InventoryFormatterHardware(value, row) {
    html = ''
    if ( row.hw.cpu_count ) {
	html+='<span><i class="fa fa-fw fa-microchip"></i> ' + row.hw.cpu_count  + '</span>';
	html+='<i class="fa fa-fw fa-ellipsis-v"></i>';
    }
    if ( row.hw.memory ) {
	html+='<span><i class="fa fa-fw fa-memory"></i> ' + humanSize(row.hw.memory) + '</span>';
	html+='<i class="fa fa-fw fa-ellipsis-v"></i>';
    }
    if ( row.hw.blockdevices ) {
	html+='<span><i class="far fa-fw fa-hdd"></i> ' + row.hw.blockdevices.length + '</span> ';
    }
    return html
}
function InventoryFormatterActions(value, row) {
    html ='<a class="host-open" data-toggle="confirmation" ';
    html+='   data-host="' + row.id + '" data-container="body" href="#host-open">';
    html+=' <i class="fa fa-fw fa-search"></i>';
    html+='</a>';
    html+='<a class="host-delete" data-toggle="confirmation" ';
    html+='   data-host="' + row.id + '" data-container="body" href="#host-delete">';
    html+=' <i class="fa fa-fw fa-trash"></i>';
    html+='</a>';
    return html;
}
function InventoryDetailFormatter(index, row) {
    html ='<div class="table-detail-row list-group-item row">'
//    html+=' <a class="table-detail-link" href="/"></a>';
    html+=' <div class="col-md-2 col-height-full">';
    html+='  <i class="fab fa-4x fa-linux"></i>'
    html+=' </div>';
    html+=' <div class="col-md-7">';
    html+='  <h2 class="list-group-item-heading">' + row.name + '</h2>';
    html+='  <h4 class="list-group-item-heading">';
    html+='   <img class="fa fa-fw img-circle" src="/safbi/static/app/img/avatar.png"/> ';
    html+=    row.owner;
    html+='  </h4>';
    html+='  <p class="list-group-item-text">' + row['description'] + '</p>';
    html+=' </div>';
    html+=' <div class="col-md-3 col-height-middle text-center">';
    html+='  <h4 style="margin:2%;">' + row['members'] + ' <small>members</small>' + '</h4>';
    html+='  <h3 style="margin:5%;">';
    html+='   <img class="fa fa-fw img-circle" src="/safbi/static/app/img/avatar.png"/> ';
    html+=    row['customer'];
    html+='  </h3>'
    html+='  <h4 style="margin: 2%;">';
    html+=    row['changes_open'] + ' / ' + row['changes'] + ' <small>changes</small>';
    html+='  </h4>';
    html+=' </div>';
    html+='</div>';
    return html;
}
