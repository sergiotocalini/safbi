$(document).ready(function () {
    $(window).resize(function () {
	autosize_tables();
    });
    autosize_tables();
    $('.modal').on('hidden.bs.modal', function(){
	$('.modal').find('.modal-title').html('New');
	var forms = $(this).find('form');
	forms.each(function(row){
	    forms[row].reset();
	});
	var selectpickers = $(this).find('.selectpicker');
	selectpickers.each(function(row){
	    $(selectpickers[row]).selectpicker('refresh');
	});
    });
    jqlisteners();
});
