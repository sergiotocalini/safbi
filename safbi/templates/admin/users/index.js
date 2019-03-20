function admin_users_onStartUp() {
    var table = '#table-users';
    $(table).on('all.bs.table', function(row, element) {
    	if ($(table).bootstrapTable('getAllSelections').length > 0) {
    	    $("#admin-users-toolbar button[data-click=user-bulk-delete]").prop('disabled', false);
    	    $("#admin-users-toolbar button[data-click=user-bulk-update]").prop('disabled', false);
    	} else {
    	    $("#admin-users-toolbar button[data-click=user-bulk-delete]").prop('disabled', true);
    	    $("#admin-users-toolbar button[data-click=user-bulk-update]").prop('disabled', true);
    	}
    });
}

function admin_users_jqlisteners() {
    $("#admin-users-toolbar button[data-click=user-add]").unbind();
    $("#admin-users-toolbar button[data-click=user-add]").on("click", function(e) {
	e.preventDefault();
	var readonly = false;
	var modal = '#ModalUser';
	$(modal).find('.modal-title').html('<i class="fa fa-fw fa-user"></i> New User');
	$(modal).find('#user-form-basic-id').val(null);
	$(modal).find('#user-form-basic-avatar').attr('src', "{{ config['CDN_LOCAL'] }}/img/avatar.png");
	$(modal).find('#user-form-basic-email').prop('readonly', readonly);
	$(modal).find('#user-form-basic-displayname').prop('readonly', readonly);
	$(modal).find('#user-form-basic-title').prop('readonly', readonly);
	$(modal).find('#user-form-basic-locale').selectpicker('val', 'English').prop('disabled', readonly);
	$(modal).find('#user-form-basic-timezone').selectpicker('val', 'Europe/Zurich').prop('disabled', readonly);
	$(modal).find('#user-form-settings-status').prop('checked', true).change();
	$(modal).find('#user-menu-context li[href="#user-form-basic"]').tab('show');
	$(modal).modal('show');

    });
    $("#admin-users-toolbar button[data-click=user-bulk-update]").unbind();
    $("#admin-users-toolbar button[data-click=user-bulk-update]").on("click", function(e) {
	e.preventDefault();
    });
    $("#admin-users-toolbar button[data-click=user-bulk-delete]").unbind();
    $("#admin-users-toolbar button[data-click=user-bulk-delete]").on("click", function(e) {
	e.preventDefault();
    });
    $("#ModalUser button[data-click=user-update]").unbind();
    $("#ModalUser button[data-click=user-update]").on("click", function(e) {
	e.preventDefault();
	var loading  = '#ModalUserLoading';
	var modal    = '#ModalUser';
	var table    = '#table-users';
	var id       = $(modal).find('#user-form-basic-id').val();
	var avatar   = $(modal).find('#user-form-basic-avatar').attr('src');
	var userid   = $(modal).find('#user-form-auth-userid').val();
	var email    = $(modal).find('#user-form-basic-email').val();
	var display  = $(modal).find('#user-form-basic-displayname').val();
	var locale   = $(modal).find('#user-form-basic-locale').val();
	var timezone = $(modal).find('#user-form-basic-timezone').val();
	var admin    = $(modal).find('#user-form-settings-admin').prop('checked');
	var status   = $(modal).find('#user-form-settings-status').prop('checked');
	if ( ! $(loading).hasClass("fa-spinner") || $(loading).hasClass("fa-exclamation-triangle") ) {
	    $(loading).removeClass("fa-spinner fa-pulse fa-spin fa-exclamation-triangle");
	    $(loading).addClass("fa-spinner fa-pulse fa-spin");
	}
	$.ajax({
	    url: id ? "{{ url_for('api_admin_users') }}?id=" + id : "{{ url_for('api_admin_users') }}",
	    type: id ? 'PUT' : 'POST',
	    data: JSON.stringify({
		'avatar': avatar ? avatar : "{{ config['CDN_LOCAL'] }}/img/avatar.png",
		'userid': userid ? userid : null,
		'email': email,
		'displayname': display,
		'lang': locale ? locale : 'English',
		'tz': timezone,
		'admin': admin,
		'status': status,
	    }),
	    contentType: "application/json",
	    success: function(e) {
		$(loading).removeClass("fa-spinner fa-pulse fa-spin");
		$(table).bootstrapTable('refresh');
		$(modal).modal('hide');
	    },
	    error: function(e) {
		$(loading).removeClass("fa-spinner fa-pulse fa-spin");
		$(loading).addClass("fa-exclamation-triangle")
	    }
	});	    
    });
    $(".user-edit").unbind();
    $(".user-edit").on("click", function(e) {
	e.preventDefault();
	var uid      = $(this).data('id');
	var readonly = false;
	var modal    = "#ModalUser";
	$.ajax({
	    async: true,
	    url: "{{ url_for('api_admin_users') }}?id=" + uid,
	    type: 'GET',
	    success: function(e) {
		var data = e['data'][0];
		$(modal).find('.modal-title').html('#' + data['id'] + ' | <i class="fa fa-fw fa-user"></i> ' + data['displayname']);
		$(modal).find('#user-form-basic-id').val(data['id']);
		$(modal).find('#user-form-basic-avatar').attr('src', data['avatar']);
		$(modal).find('#user-form-basic-email').val(data['email']).prop('readonly', readonly);
		$(modal).find('#user-form-basic-displayname').val(data['displayname']).prop('readonly', readonly);
		$(modal).find('#user-form-basic-title').val(data['title']).prop('readonly', readonly);
		$(modal).find('#user-form-basic-locale').selectpicker('val', data['lang']).prop('disabled', readonly);
		$(modal).find('#user-form-basic-timezone').selectpicker('val', data['tz']).prop('disabled', readonly);
		$(modal).find('#user-form-settings-status').prop('checked', data['status']).change();
		$(modal).find('#user-form-settings-admin').prop('checked', data['admin']).change();
		$(modal).find('#user-form-auth-userid').val(data['userid']).prop('readonly', true);
		$(modal).find('#user-menu-context li[href="#user-form-basic"]').tab('show');
		$(modal).modal('show');		
	    }
	});
    });
    $(".user-delete").unbind();
    $(".user-delete").confirmation({
	onConfirm: function(e) {
	    var uid   = $(this).attr('id');
	    var table = '#table-users';
	    $.ajax({
		type: "DELETE",
		url: "{{url_for('api_admin_users')}}?id=" + uid,
		success: function (e) {
		    $(table).bootstrapTable('refresh');
		},
	    });
	},
	placement: 'left',
	btnOkLabel: 'Yes',
	btnOkClass: 'btn btn-sm btn-primary',
	btnOkIcon: 'fa fa-fw fa-check-circle',
	btnCancelLabel: 'No',
	btnCancelClass: 'btn btn-sm btn-danger',
	btnCancelIcon: 'fa fa-fw fa-minus-circle',
    });
}


function UsersParams(params) {
    return params
}


function UsersResponseHandler(res) {
    var data = [];
    for(r in res.data) {
	var row = res.data[r];
	var doc = {
	    status: row.status,
	    admin: row.admin,
	    id: row.id,
	    displayname: row.displayname,
	    user_avatar: row.avatar,
	    email: row.email,
	    created_on: row.created_on,
	    last_seen: row.last_seen,
	};
	data.push(doc);
    };
    return {
	total: res.total,
	rows: data,
    }
}


function UsersFormatterName(value, row) {
    var html = ""
    html += '<img class="fa fa-fw img-circle" src="' + row.user_avatar + '"/> ';
    html += row.displayname;
    if (! row.status) {
	html += '<i style="margin:0.5%" class="fa fa-fw fa-user-slash pull-right"></i>';
    }
    if (row.admin) {
	html += '<i style="margin:0.5%" class="fa fa-fw fa-user-shield pull-right"></i>';
    }
    return html;
}


function UsersFormatterActions(value, row) {
    var html = ""
    html += '<a class="user-edit" data-toggle="confirmation" ';
    html += '   data-id="' + row.id + '" href="#user-edit">';
    html += ' <i class="fa fa-fw fa-pencil-alt"></i>';
    html += '</a>';
    html += '<a class="user-delete" data-toggle="confirmation" ';
    html += '   data-id="' + row.id + '" href="#user-delete">';
    html += ' <i class="fa fa-fw fa-trash"></i>';
    html += '</a>';
    return html;
}


function UsersFormatterDate(value, row) {
    return moment(Date.parse(value)).format("YYYY-MM-DD hh:mm");
}


function UsersFormatterDateAgo(value, row) {
    return moment(Date.parse(value)).fromNow();
}
