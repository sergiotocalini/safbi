function HostsScoreCalc(dataset, options) {
    var data = [];
    var values = {
	hdd: 20,
	mem: 2,
	cpu: 1,
    };
    for (opt in options) {
	if ( !(/.*_units$/.test(options[opt]['name'])) ) {
	    values[options[opt]['name']]=Number(options[opt]['value']);
	}
    }
    console.log(values);
    var scores = {
    	mem: 2.00, hdd: 0.50, cpu: 0.50 
    };
    for (host in dataset) {
	var stats = {
	    dom: { count: 0, vcpu: 0, mem: 0, hdd: 0},
	    cpu: { total: 1, free: 0, avg: 0},
	    hdd: { total: 1, free: 0, avg: 0},
	    mem: { total: 1, free: 0, avg: 0},
	};
	for (pool in dataset[host]['kvm']['pools']) {
	    stats['hdd']['total']+=Number(dataset[host]['kvm']['pools'][pool]['capacity']);
	    stats['hdd']['free']+=Number(dataset[host]['kvm']['pools'][pool]['available']);
	}
	for (dom in dataset[host]['kvm']['domains']) {
	    stats['dom']['count']+= 1;
	    stats['dom']['vcpu'] += Number(dataset[host]['kvm']['domains'][dom]['vcpu']);
	    stats['dom']['mem']  += Number(dataset[host]['kvm']['domains'][dom]['memory']);
	    stats['dom']['hdd']  += Number(dataset[host]['kvm']['domains'][dom]['storage_alloc']);
	}

	stats['cpu']['total']=Number(dataset[host]['kvm']['node']['cpu_count']);
	stats['cpu']['free']=stats['cpu']['total'] - stats['dom']['vcpu'];
	stats['cpu']['avg']=Number(((stats['cpu']['free']*100)/stats['cpu']['total']).toFixed(2));
	
	stats['hdd']['avg']=Number(((stats['hdd']['free']*100)/stats['hdd']['total']).toFixed(2));
	
	stats['mem']['total']=Number(dataset[host]['kvm']['node']['memory_size']);
	stats['mem']['free']=stats['mem']['total'] - stats['dom']['mem'];
	stats['mem']['avg']=Number(((stats['mem']['free']*100)/stats['mem']['total']).toFixed(2));

	var score_units = Object.keys(scores).length;
	var score_perc  = Number( 100 / Number(score_units));
	var score_value = 0;
	for (unit in scores) {
	    if ( values[unit] < stats[unit]['free'] ) {
		score_value+=Number(score_perc * scores[unit]);
	    }
	}
	
	data.push({
	    score: score_value.toFixed(0),
	    host: dataset[host]['name'],
	    mem: stats['mem']['avg'],
	    hdd: stats['hdd']['avg'],
	    cpu: stats['cpu']['avg'],
	    stats: stats,
	});
    }
    return data;
}
function HostsScoreFormatter(value, row) {
    if (value >= 80) {
	var color = '#5cb85c';
    } else if (value >= 50) {
	var color = '#17a2b8';
    } else {
	var color = '#dc3545';
    }
    html ='<div class="progress progress-striped" style="margin:0px">';
    html+=' <div class="progress-bar bg-info" role="progressbar" ';
    html+='      style="width:' + value + '%;background-color: ' + color + ' !important">'
    html+='  <span>' + value + '%</span>'
    html+=' </div>';
    html+='</div>';
    return html;
}
function HostsScoreSorter(a, b, rowA, rowB) {
    console.log(a, b, rowA, rowB);
    if (rowA.score < rowB.score) return 1;
    if (rowA.score > rowB.score) return -1;
    return 0;
}
function HostsCheckFormatter(value, row) {
    if (row.score < 50) {
	return {
	    disabled: true
	}
    }
    return value;
}
// function ChgMbrParams(params) {
//     params.type   = 'only';
//     params.filter = 'change';
//     params.value  = '1';
//     return params
// }
// function ChgMbrResponseHandler(res) {
//     var data = [];
//     for(r in res.data) {
// 	var row = res.data[r];
// 	var doc = {
// 	    status: row.status,
// 	    id: row.id,
// 	    displayname: row.displayname,
// 	    user_avatar: row.avatar,
// 	    team: '',
// 	    team_avatar: '',
// 	    manager: '',
// 	    manager_avatar: '',
// 	};
// 	if(row.team != null) {
// 	    doc.team = row.team.name;
// 	    doc.team_avatar = row.team.avatar;
// 	    doc.manager = row.team.manager.displayname;
// 	    doc.manager_avatar = row.team.manager.avatar;
// 	};
// 	data.push(doc);
//     };
//     return {
// 	total: res.total,
// 	rows: data,
//     }
// }
// function ChgMbrFormatterName(value, row) {
//     var html = ""
//     html += '<img class="fa fa-fw img-circle" src="';
//     html += row.user_avatar + '"/> ';
//     html += row.displayname;
//     return html;
// }
// function ChgMbrFormatterTeam(value, row) {
//     if(row.team != ''){
// 	var html = "";
// 	html += '<img class="fa fa-fw img-circle" src="';
// 	html += row.team_avatar + '"/> ';
// 	html += row.team;
//     } else {
// 	var html = ' - ';
//     }
//     return html;
// }
// function ChgMbrFormatterManager(value, row) {
//     if(row.manager != ''){
// 	var html = ""
// 	html += '<img class="fa fa-fw img-circle" src="';
// 	html += row.manager_avatar + '"/> ';
// 	html += row.manager;
//     } else {
// 	var html = ' - ';
//     }
//     return html;
// }
// function ChgMbrFormatterActions(value, row) {
//     var html = ""
//     html += '<a class="chgmbr-del" data-toggle="confirmation" ';
//     html += 'data-chg="1" data-mbr="' + row.id + '" href="#">';
//     html += '<i class="fa fa-fw fa-trash"></i>';
//     html += '</a>';
//     html += '<a class="chgmbr-open" data-toggle="confirmation" ';
//     html += 'data-mbr="' + row.id + '" href="#">';
//     html += '<i class="fa fa-fw fa-search"></i>';
//     html += '</a>';
//     return html;
// }
// function ChgMbrSearchParams(params) {
//     params.type   = 'exclude';
//     params.filter = 'change';
//     params.value  = '1';
//     return params
// }
// function ChgMbrSearchFormatterActions(value, row) {
//     var html = ""
//     html += '<a class="chgmbr-add" data-toggle="confirmation" ';
//     html += 'data-chg="1" data-mbr="' + row.id + '" href="#">';
//     html += '<i class="fa fa-fw fa-plus"></i>';
//     html += '</a>';
//     html += '<a class="chgmbr-open" data-toggle="confirmation" ';
//     html += 'data-mbr="' + row.id + '" href="#">';
//     html += '<i class="fa fa-fw fa-search"></i>';
//     html += '</a>';
//     return html;
// }
// function jqlisteners_change_member() {
//     $(".chgmbr-add").confirmation({
// 	onConfirm: function(e) {
// 	    var change = $(this).attr('chg');
// 	    var member = $(this).attr('mbr');
// 	    var url = "{{ url_for('index') }}?id=" + change;
// 	    url += "&member=+" + member;
// 	    $.ajax({
// 		async: true,
// 		type: "PUT",
// 		url: url,
// 		success: function (e) {
// 		    $('#chgmbr-table').bootstrapTable('refresh');
// 		    $('#chgmbr-search-table').bootstrapTable('refresh');
// 		},
// 	    });
// 	},
// 	placement: 'top',
// 	btnOkLabel: 'Yes',
// 	btnOkClass: 'btn btn-sm btn-primary',
// 	btnOkIcon: 'fa fa-fw fa-check',
// 	btnCancelLabel: 'No',
// 	btnCancelClass: 'btn btn-sm btn-danger',
// 	btnCancelIcon: 'fa fa-fw fa-remove',
//     });
//     $(".chgmbr-del").confirmation({
// 	onConfirm: function(e) {
// 	    var change = $(this).attr('chg');
// 	    var member = $(this).attr('mbr');
// 	    var url = "{{url_for('index')}}?id=" + change;
// 	    url += "&member=-" + member;
// 	    $.ajax({
// 		async: true,
// 		type: "PUT",
// 		url: url,
// 		success: function (e) {
// 		    $('#chgmbr-table').bootstrapTable('refresh');
// 		    $('#chgmbr-search-table').bootstrapTable('refresh');
// 		},
// 	    });
// 	},
// 	placement: 'top',
// 	btnOkLabel: 'Yes',
// 	btnOkClass: 'btn btn-sm btn-primary',
// 	btnOkIcon: 'fa fa-fw fa-check',
// 	btnCancelLabel: 'No',
// 	btnCancelClass: 'btn btn-sm btn-danger',
// 	btnCancelIcon: 'fa fa-fw fa-remove',
//     });
//     $(".chgmbr-open").confirmation({
// 	onConfirm: function(e) {
// 	    var member = $(this).attr('mbr');
// 	    window.open(
// 		"{{ url_for('index') }}/" + member,
// 		'_blank');
// 	},
// 	placement: 'top',
// 	btnOkLabel: 'Yes',
// 	btnOkClass: 'btn btn-sm btn-primary',
// 	btnOkIcon: 'fa fa-fw fa-check',
// 	btnCancelLabel: 'No',
// 	btnCancelClass: 'btn btn-sm btn-danger',
// 	btnCancelIcon: 'fa fa-fw fa-remove',
//     });
// }
