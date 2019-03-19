function jqlisteners_admin_users() {
    $("#admin-users-toolbar button[data-click=user-add]").unbind();
    $("#admin-users-toolbar button[data-click=user-add]").on("click", function(e) {
	e.preventDefault();
	var modal = '#ModalUser';
	$(modal).find('#avatar').attr('src', "{{ config['CDN_LOCAL'] }}/img/avatar.jpg");
	$(modal).modal('show');

    });
    $("#admin-users-toolbar button[data-click=user-bulk-update]").unbind();
    $("#admin-users-toolbar button[data-click=user-bulk-update]").on("click", function(e) {
	e.preventDefault();
	console.log('bulk update');
    });
    $("#admin-users-toolbar button[data-click=user-bulk-delete]").unbind();
    $("#admin-users-toolbar button[data-click=user-bulk-delete]").on("click", function(e) {
	e.preventDefault();
	console.log('bulk delete');
    });
    $(".user-admin").click(function(e) {
	e.preventDefault();
	var tag_admin = $(this).find('i');
	if ( ! tag_admin.hasClass("fa-spinner") ) {
	    var uid = $("#ModalUser").find('#uid').val();
	    if (tag_admin.hasClass("fa-user-secret")) {
		var active = false;
		tag_admin.removeClass("fa-user-secret");
		tag_admin.addClass("fa-spinner fa-pulse");
	    } else {
		var active = true;
		tag_admin.removeClass("fa-user");
		tag_admin.addClass("fa-spinner fa-pulse");
	    };
	    $.ajax({
		async: true,
		url: "{{ url_for('api_admin_users') }}?id=" + uid,
		type: "POST",
		data: JSON.stringify({"admin": active}),
		contentType: "application/json",
		success: function(e) {
		    tag_admin.removeClass("fa-spinner fa-pulse");
		    if (active == true) {
			tag_admin.addClass("fa-user-secret");
		    } else {
			tag_admin.addClass("fa-user");
		    };
		}
	    });
	}
    });
    $('.user-lock').click(function(e) {
	e.preventDefault();
	var tag_lock = $(this).find('i');
	if ( ! tag_lock.hasClass("fa-spinner") ) {
	    var uid = $('#ModalUser').find('#uid').val();
	    if (tag_lock.hasClass('fa-unlock')) {
		var active = false;
		tag_lock.removeClass('fa-unlock');
		tag_lock.addClass('fa-spinner fa-pulse');
	    } else {
		var active = true;
		tag_lock.removeClass('fa-lock');
		tag_lock.addClass('fa-spinner fa-pulse');
	    };
	    $.ajax({
		async: true,
		url: "{{ url_for('api_admin_users') }}?id=" + uid,
		type: 'POST',
		data: JSON.stringify({'status': active}),
		contentType: "application/json",
		success: function(e) {
		    tag_lock.removeClass('fa-spinner fa-pulse');
		    if (active == true) {
			tag_lock.addClass('fa-unlock');
		    } else {
			tag_lock.addClass('fa-lock');	    
		    };
		}
	    });
	}
    });
    $(".user-open").click(function(e) {
	e.preventDefault();
	var uid = $(this).data('id');
	var modal = "#ModalUser";
	$.ajax({
	    async: true,
	    url: "{{ url_for('api_admin_users') }}?id=" + uid,
	    type: 'GET',
	    success: function(e) {
		var data = e['data'][0];
		$(modal).find('.modal-title').html(data['displayname']);
		$(modal).find('#avatar').attr('src', data['avatar']);
		$(modal).find('#uid').val(data['id']);
		$(modal).find('#userid').html(data['userid']);
		$(modal).find('#email').html(data['email']);
		$(modal).find('#display').html(data['displayname']);
		var tag_lock = $(modal).find('.user-lock').find('i');
		var tag_admin = $(modal).find('.user-admin').find('i');
		if (data['status'] === false) {
		    tag_lock.addClass('fa-lock');
		} else {
		    tag_lock.addClass('fa-unlock');
		}
		if (data['admin'] === false) {
		    if ( tag_admin.hasClass('fa-user-secret')) {
			tag_admin.removeClass('fa-user-secret');
		    }
		    if (! tag_admin.hasClass('fa-user')) {
			tag_admin.addClass('fa-user');
		    }
		} else {
		    if ( tag_admin.hasClass('fa-user')) {
			tag_admin.removeClass('fa-user');
		    }
		    if (! tag_admin.hasClass('fa-user-secret')) {
			tag_admin.addClass('fa-user-secret');
		    }
		}
		$(modal).modal('show');		
	    }
	});
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
    html += '<img class="fa fa-fw img-circle" src="';
    html += row.user_avatar + '"/> ';
    html += row.displayname;
    return html;
}


function UsersFormatterActions(value, row) {
    var html = ""
    html += '<a class="user-del" data-toggle="confirmation" ';
    html += 'data-id="' + row.id + '" href="#">';
    html += '<i class="fa fa-fw fa-trash"></i>';
    html += '</a>';
    html += '<a class="user-open" data-toggle="confirmation" ';
    html += 'data-id="' + row.id + '" href="#">';
    html += '<i class="fa fa-fw fa-search"></i>';
    html += '</a>';
    return html;
}


function UsersFormatterDate(value, row) {
    return moment(Date.parse(value)).format("YYYY-MM-DD hh:mm");
}


function UsersFormatterDateAgo(value, row) {
    return moment(Date.parse(value)).fromNow();
}
