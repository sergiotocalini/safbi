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
}
function table_height(table) {
    var parent = $(table).parent().parent().parent().parent();
    return parent.height();
};
function calendar_height(calendar) {
    var parent = $(calendar).parent();
    return parent.height();
};
function rowStyle(row, index) {
    if ( row['status'] == false ) {
	return {
	    css: {"text-decoration": "line-through"}
	};
    } else {
	return {
            css: {"text-decoration": "none"}
	};
    }
};
function PrintElem(elem) {
    var mywindow = window.open('', 'PRINT', 'height=400,width=600');
    mywindow.document.write('<html><head><title>' + document.title  + '</title>');
    mywindow.document.write('</head><body >');
    mywindow.document.write('<h1>' + document.title  + '</h1>');
    mywindow.document.write(document.getElementById(elem).innerHTML);
    mywindow.document.write('</body></html>');
    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/

    mywindow.print();
    mywindow.close();
    return true;
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
function Size2Bytes(size, units="KiB") {
    if ( /^(B|bytes|Bytes)$/.test(units) ) {
	return size;
    }
    if ( /^.*iB$/.test(units) ) {
	var table = [ 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB' ];
	var multi = 1024;
    } else {
	var table = [ 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB' ];
	var multi = 1000;
    }
    // if (size < multi) {
	// var index = 0;
    for (u in table) {
	console.log(units, table[u])
	    if ( units == table[u] ) {
		break;
	    }
	    size=size*multi
	    // index++;
	}
	// while (( index >= 0 )) {
	//     size=size*multi
	//     index--;
	// }
    // }
    return size
};
function setURLParam(values=[], clean=[]) {
    var kvp = document.location.search.substr(1).split('&');
    var k=kvp.length; while (k--) {
	x = kvp[k].split('=');
	if (kvp[k] == '' || ifArray(clean, x[0]) ) {
	    kvp.splice(k, 1)
	}
    }

    for (v in values) {
	kvp.push([values[v]['key'], values[v]['value']].join('='));
    }
    var location = document.location.origin + document.location.pathname;
    var url = location;
    if (kvp.length > 0) {
	url += '?' + kvp.join('&');
    }	
    history.pushState({ id: location }, document.title, url);
};
function setURLParamOld(key, value) {
    key = encodeURI(key); value = encodeURI(value);
    var kvp = document.location.search.substr(1).split('&');
    var i=kvp.length; var x; while(i--) {
	if ( kvp[i] == '' ) {
	    kvp.splice(i, 1);
	    continue
	}
	x = kvp[i].split('=');
	if (x[0]==key)
	{
	    x[1] = value;
	    kvp[i] = x.join('=');
	    break;
	}
    }
    if (i<0) { kvp[kvp.length] = [key,value].join('='); }
    var location = document.location.origin + document.location.pathname;
    var url = location + '?' + kvp.join('&');
    history.pushState({ id: location }, document.title, url);
};
function getURLParam(key=[]) {
    options = {};
    attrs = document.location.search.substr(1).split('&');
    for ( i in attrs ) {
	if (attrs[i]=='') { continue }
	
	x = attrs[i].split('=');
	if ( typeof(options[x[0]]) === 'undefined' ) {
	    options[x[0]] = [ x[1] ];
	} else {
	    options[x[0]].push(x[1]);
	}
    }
    return options
};
function ifArray(arr, element) {
    for (var i = 0; i < arr.length; i++) {
	if (arr[i] === element) {
	    return true;
	}
    }
    return false;
};
function uuid_gen() {
    var uuid = "", i, random;
    for (i = 0; i < 32; i++) {
	random = Math.random() * 16 | 0;

	if (i == 8 || i == 12 || i == 16 || i == 20) {
	    uuid += "-"
	}
	uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uuid;
};
