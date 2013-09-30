(function() {
	var username = $('#username'),
		password = $('#password'),
		password_confirm = $('#password-confirm'),
		register = $('#register'),
		emailEl = $('#email'),
		username_notify = $('#username-notify'),
		email_notify = $('#email-notify'),
		password_notify = $('#password-notify'),
		password_confirm_notify = $('#password-confirm-notify'),
		validationError = false,
		successIcon = '<i class="icon icon-ok"></i>';

	$('#referrer').val(app.previousUrl);

	function showError(element, msg) {
		element.html(msg);
		element.parent()
			.removeClass('alert-success')
			.addClass('alert-danger');
		element.show();
		validationError = true;
	}

	function showSuccess(element, msg) {
		element.html(msg);
		element.parent()
			.removeClass('alert-danger')
			.addClass('alert-success');
		element.show();
	}

	function validateEmail() {
		if (!emailEl.val()) {
			validationError = true;
			return;
		}

		if (!utils.isEmailValid(emailEl.val())) {
			showError(email_notify, 'Invalid email address.');
		} else
			socket.emit('user.email.exists', {
				email: emailEl.val()
			});
	}

	emailEl.on('blur', function() {
		validateEmail();
	});

	function validateUsername() {
		if (!username.val()) {
			validationError = true;
			return;
		}

		if (username.val().length < config.minimumUsernameLength) {
			showError(username_notify, 'Username too short!');
		} else if (username.val().length > config.maximumUsernameLength) {
			showError(username_notify, 'Username too long!');
		} else if (!utils.isUserNameValid(username.val())) {
			showError(username_notify, 'Invalid username!');
		} else {
			socket.emit('user.exists', {
				username: username.val()
			});
		}
	}

	username.on('keyup', function() {
		jQuery('#yourUsername').html(this.value.length > 0 ? this.value : 'username');
	});
	username.on('blur', function() {
		validateUsername();
	});

	function validatePassword() {
		if (!password.val()) {
			validationError = true;
			return;
		}

		if (password.val().length < config.minimumPasswordLength) {
			showError(password_notify, 'Password too short!');
		} else if (!utils.isPasswordValid(password.val())) {
			showError(password_notify, 'Invalid password!');
		} else {
			showSuccess(password_notify, successIcon);
		}

		if (password.val() !== password_confirm.val() && password_confirm.val() !== '') {
			showError(password_confirm_notify, 'Passwords must match!');
		}
	}

	$(password).on('blur', function() {
		validatePassword();
	});

	function validatePasswordConfirm() {
		if (!password.val() || password_notify.hasClass('alert-error')) {
			return;
		}

		if (password.val() !== password_confirm.val()) {
			showError(password_confirm_notify, 'Passwords must match!');
		} else {
			showSuccess(password_confirm_notify, successIcon);
		}
	}

	$(password_confirm).on('blur', function() {
		validatePasswordConfirm();
	});

	ajaxify.register_events(['user.exists', 'user.email.exists']);

	socket.on('user.exists', function(data) {
		if (data.exists === true) {
			showError(username_notify, 'Username already taken!');
		} else {
			showSuccess(username_notify, successIcon);
		}
	});

	socket.on('user.email.exists', function(data) {
		if (data.exists === true) {
			showError(email_notify, 'Email address already taken!');
		} else {
			showSuccess(email_notify, successIcon);
		}
	});

	// Alternate Logins
	$('.alt-logins li').on('click', function(e) {
		document.location.href = $(this).attr('data-url');
	});

	function validateForm() {
		validationError = false;

		validateEmail();
		validateUsername();
		validatePassword();
		validatePasswordConfirm();

		return validationError;
	}

	register.on('click', function(e) {
		if (validateForm()) e.preventDefault();
	});

}());