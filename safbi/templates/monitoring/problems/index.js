function refreshFrame() {
    refresh_widgets_problems();
    setTimeout(refreshFrame, 60000);
};

function refresh_widgets_problems() {
    $.ajax({
	type: "GET",
	url: "{{ url_for('api_monitoring_problems') }}",
	success: function (e) {
	    $('#problems-box-table').bootstrapTable('load', e['data']);
	    $('#problems-box-count').find('.content').find('.text').html(e['stats']['problems']);
	    $('#problems-box-hosts-count').find('.content').find('.text').html(e['stats']['hosts']);
	    $('#problems-box-sites-count').find('.content').find('.text').html(e['stats']['sites']);
	    $('#problems-box-datasources-count').find('.content').find('.text').html(e['stats']['datasources']);
	}
    });
};

function cellStyle(value, row, index, field) {
    if ( field == "priority" ) {
	var color = "";
	if ( row.value == 1 ) {
	    if ( row.priority == 0 ) {
		color = "#97AAB3";
	    } else if ( row.priority == 1 ) {
		color = "#7499FF";
	    } else if ( row.priority == 2 ) {
		color = "#FFC859";
	    } else if ( row.priority == 3 ) {
		color = "#FFA059";
	    } else if ( row.priority == 4 ) {
		color = "#E97659";
	    } else if ( row.priority == 5 ) {
		color = "#E45959";
	    }
	} else {
	    color = "#59db8f";
	}
	return {
	    css: { "background-color": color }
	}
    }
    return {}
};

function ProblemFormatterSite(value, row) {
    var html = "";
    html+= row.hosts[0].hardware_full.site ? row.hosts[0].hardware_full.site : '-';
    return html
};

function ProblemFormatterHost(value, row) {
    html = ""
    html+= row.hosts[0].host
    html+= "<span class='pull-right'>";
    if ( row.hosts[0].maintenance_status == 1 ) {
	html+= "<i class='fa fa-fw fa-wrench'></i>"
    }
    if ( row.hosts[0].software_full.env == 'PROD' ) {
	html+=' <i class="fa fa-fw fa-flag status-red" title="PROD"></i>';
    } else if ( row.hosts[0].software_full.env == 'TEST' ) {
	html+=' <i class="fa fa-fw fa-flag status-yellow" title="TEST"></i>';
    } else if ( row.hosts[0].software_full.env == 'STAGE' ) {
	html+=' <i class="fa fa-fw fa-flag status-blue" title="STAGE"></i>';
    } else {
	html+=' <i class="fa fa-fw fa-flag status-gray" title="UNKNOWN"></i>';
    }
    html+= "</span>";
    return html
};

function ProblemFormatterPriority(value, row) {
    html = "";
    if ( row.priority == 0 ) {
	html+="<span>";
	html+=" Not Classified";
	html+="</span>";
    } else if ( row.priority == 1 ) {
	html+="<span>";
	html+=" Information";
	html+="</span>";
    } else if ( row.priority == 2 ) {
	html+="<span>";
	html+=" Warning";
	html+="</span>";
    } else if ( row.priority == 3 ) {
	html+="<span>";
	html+=" Average";
	html+="</span>";
    } else if ( row.priority == 4 ) {
	html+="<span>";
	html+=" High";
	html+="</span>";
    } else if ( row.priority == 5 ) {
	html+="<span>";
	html+=" Disaster";
	html+="</span>";
    } else {
	html+="<span>";
	html+=" Unknown";
	html+="</span>";
    }
    return html
};

function ProblemFormatterStatus(value, row) {
    html = "";
    if ( row.value == 1 ) {
	html+="<span style='color:#DC0000'>";
	html+=" PROBLEM";
	html+="</span>";
    } else {
	html+="<span style='color:#00AA00'>";
	html+=" OK";
	html+="</span>";
    }
    return html
};

function ProblemFormatterDate(value, row) {
    html = moment.unix(value).format("YYYY-MM-DD HH:mm");
    html+= "<span class='pull-right'>";
    html+= " <i class='fa fa-fw fa-calendar-minus' title='" + moment.unix(value).fromNow() + "'></i>";
    html+= ' <img class="fa fa-fw" src="/safbi/static/extras/services/img/zabbix.png"/>';
    html+= "</span>";
    return html
};

function ProblemFormatterDescription(value, row) {
    var html = ""
    html += '<div class="text-ellipsis">'
    html +=  '<span>' + value + '</span>';
    html += '</div>'
    return html;
};

function ProblemFormatterActions(value, row) {
    html ='<a class="problem-open" data-toggle="confirmation" target="_blank" ';
    html+='   data-host="' + row.id + '" data-container="body" href="' + row.link + '">';
    html+=' <i class="fa fa-fw fa-search"></i>';
    html+='</a>';
    html+='<a class="problem-ack" data-toggle="confirmation" ';
    html+='   data-host="' + row.id + '" data-container="body" href="#problem-ack">';
    html+=' <i class="fa fa-fw fa-exclamation-triangle status-orange"></i>';
    html+='</a>';
    return html;
};
