function CapacityFilterFormatterKey(value, row, index) {
    var host = '', site = '', domain = '';
    if (value == 'host') {
	host = 'selected';
    } else if (value == 'site') {
	site = 'selected';
    } else if (value == 'domain') {
	domain = 'selected';
    }
    html ='<select class="selectpicker form-control key-select" data-container="body">';
    html+=' <option value="host" data-tokens="Host"';
    html+='         data-content="<i class=\'fa fa-fw fa-server\'></i> Host"' + host + '>';
    html+=' </option>';
    html+=' <option value="site" data-tokens="Site"';
    html+='         data-content="<i class=\'fa fa-fw fa-building\'></i> Site"' + site + '>';
    html+=' </option>';
    html+=' <option value="domain" data-tokens="Domain"';
    html+='         data-content="<i class=\'fa fa-fw fa-box\'></i> Domain"' + domain + '>';
    html+=' </option>';
    html+='</select>'
    return html;
}

function CapacityFilterFormatterValue(value, row, index) {
    html ='<input class="value-input" type="text" style="width:100%;padding:1%" value="' + value + '"/>';
    return html;
}

function CapacityFilterFormatterActions(value, row, index) {
    html ='<a class="filter-delete" data-toggle="confirmation" href="#filter-delete" data-index="' + index + '">';
    html+=' <i class="fa fa-fw fa-trash"></i>';
    html+='</a>';
    return html;
}
