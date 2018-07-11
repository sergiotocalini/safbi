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
function calendar_height(calendar) {
    var parent = $(calendar).parent();
    return parent.height();
};
function table_height(table) {
    var parent = $(table).parent().parent().parent().parent();
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
