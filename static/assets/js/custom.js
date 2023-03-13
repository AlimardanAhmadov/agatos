function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		const cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			// Does this cookie string begin with the name we want?
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}
  
const csrftoken = getCookie('csrftoken');

$(document).on('click', 'button[data-action="sign-up"]', function(event){
	event.preventDefault();

    var $this = $(this);
    $this.addClass('disabled');

    var input_data = {
        'username': $('input[name="email"]').val(),
        'email': $('input[name="email"]').val(),
        'password1': $('input[name="password1"]').val(),
        'password2': $('input[name="password2"]').val(),
    }

    $('.bg-indigo-500').html('<div class="loader"></div>');

    // empty error fields
    $('.error-field, .alert').html('').css('display', 'none');
    $.ajax({
        type: 'POST',
        url: '/employee/sign-up',
        data: JSON.stringify(input_data),
        dataType: 'json',
        headers: { 'X-CSRFTOKEN': csrftoken, "Content-type": "application/json"  },
        success: function () {
            $('form[data-element="sign-up"]').html(
                '<div class="user signup" style="text-align: left;gap: 0;">' +
                    "<h2 class='text-xl font-bold'>Successful!</h2>" +
                    '<div style="color: #565e69; font-size: 16px; margin-top: 1.2rem">' +
                        "We have received your registration. Please wait until your account gets verified" +
                    "</div>" +
                "</div>"
            );
        },
        error: function (xhr, ajaxOptions, thrownError) {
            setTimeout(function () {
                $this.removeClass('disabled');

                var list_of_errors = xhr.responseJSON["error"];
                $('.s-input').each(function(idx, el){
                    $(el).css('border-color', 'rgba(237,242,247,var(--border-opacity))');
                    
                    for (let i = 0; i < list_of_errors.length; i++) {
                        var newItem = list_of_errors[i];
                        if (newItem.includes('non_field_errors')) {
                            $('body').append(
                                '<div class="redirect-message">' +
                                  '<div class="redirect-message-left">' +
                                      '<div class="message-icon danger">' +
                                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">' +
                                          '<path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"></path></svg>' +
                                      '</div>' +
                                      '<span class="message-content">'+ newItem.split(' - ')[1].replaceAll('"', '') +'</span>' +
                                  '</div>' +
                                  '<div class="x-close">' +
                                      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">' +
                                          '<path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/>' +
                                      '</svg>' +
                                  '</div>' +
                                '</div>'
                            )
                            $('.redirect-message').css('opacity', '1');
                      
                            setTimeout(function () {
                                $('.redirect-message').css('opacity', '0');
                                $('.redirect-message').remove();
                            }, 2000);
                        }
                        if (newItem.includes(el.id)){
                            stripped_item = newItem.split(' - ')[1];
                            $(el).css({'border-color': '#d53838', 'margin-top': '.3rem'}).addClass('mb-3');
                            $(el).prev().css({'display': 'initial'});
                            $(el).prev().html(stripped_item.replaceAll("'", ""));
                        }
                    }
                })

                $this.html(`
                    <svg
                        class="w-6 h-6 -ml-2"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <path d="M20 8v6M23 11h-6" />
                    </svg>
                    <span class="ml-3"> Sign Up </span>
                `).css('display', 'flex');
            }, 500);
        }
	}); 
});


$(document).on('click', 'button[data-action="sign-in"]', function(event){
	event.preventDefault();

    var $this = $(this);
    $this.addClass('disabled');

    var input_data = {
        'username': $('input[name="email"]').val(),
        'password': $('input[name="password"]').val(),
    }

    $('.bg-indigo-500').html('<div class="loader"></div>');

    // empty error fields
    $('.error-field, .alert').html('').css('display', 'none');
    $.ajax({
        type: 'POST',
        url: '/employee/sign-in',
        data: JSON.stringify(input_data),
        dataType: 'json',
        headers: { 'X-CSRFTOKEN': csrftoken, "Content-type": "application/json"  },
        success: function () {
            window.location.href="/employee/profile";
        },
        error: function (xhr, ajaxOptions, thrownError) {
            setTimeout(function () {
                $this.removeClass('disabled');

                var list_of_errors = xhr.responseJSON["error"];
                $('.s-input').each(function(idx, el){
                    $(el).css('border-color', 'rgba(237,242,247,var(--border-opacity))');

                    for (let i = 0; i < list_of_errors.length; i++) {
                        var newItem = list_of_errors[i];
                        if (newItem.includes('non_field_errors')) {
                            $('body').append(
                                '<div class="redirect-message">' +
                                  '<div class="redirect-message-left">' +
                                      '<div class="message-icon danger">' +
                                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">' +
                                          '<path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"></path></svg>' +
                                      '</div>' +
                                      '<span class="message-content">'+ newItem.split(' - ')[1].replaceAll('"', '') +'</span>' +
                                  '</div>' +
                                  '<div class="x-close">' +
                                      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">' +
                                          '<path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/>' +
                                      '</svg>' +
                                  '</div>' +
                                '</div>'
                            )
                            $('.redirect-message').css('opacity', '1');
                      
                            setTimeout(function () {
                                $('.redirect-message').css('opacity', '0');
                                $('.redirect-message').remove();
                            }, 2000);
                        }
                        if (newItem.includes(el.id)){
                            stripped_item = newItem.split(' - ')[1];
                            $(el).css({'border-color': '#d53838', 'margin-top': '.3rem'}).addClass('mb-3');
                            $(el).prev().css({'display': 'initial'});
                            $(el).prev().html(stripped_item.replaceAll("'", ""));
                        }
                    }
                })

                $this.html(`
                    <span class="ml-3"> Sign in </span>
                `).css('display', 'flex');
            }, 500);
        }
	}); 
});

$(document).on('click', '.accordion-clickable', function(){
    $(this).parents('.accordion-item').toggleClass('open');
    $(this).parents('.accordion-item').find('.accordion-content').toggleClass('active');
})

$(document).on('click', '.switch-previews', function(){
    if ($('.qr-code-preview').css('display') == 'block') {
        $(this).html(`
            <svg
                style="fill: rgb(81, 81, 81)"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
            >
                <path
                d="M0 80C0 53.5 21.5 32 48 32h96c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V80zM64 96v64h64V96H64zM0 336c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V336zm64 16v64h64V352H64zM304 32h96c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48H304c-26.5 0-48-21.5-48-48V80c0-26.5 21.5-48 48-48zm80 64H320v64h64V96zM256 304c0-8.8 7.2-16 16-16h64c8.8 0 16 7.2 16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s7.2-16 16-16s16 7.2 16 16v96c0 8.8-7.2 16-16 16H368c-8.8 0-16-7.2-16-16s-7.2-16-16-16s-16 7.2-16 16v64c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V304zM368 480a16 16 0 1 1 0-32 16 16 0 1 1 0 32zm64 0a16 16 0 1 1 0-32 16 16 0 1 1 0 32z"
                />
            </svg>
        `);
        
        $('.qr-code-preview').css({
            'display': 'none',
            'visibility': 'hidden',
            'opacity': '0'
        });

        $('.phone-graphic').css({
            'display': 'block',
            'visibility': 'visible',
            'opacity': '1'
        })
    }
    else {
        $(this).html(`
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-phone" viewBox="0 0 16 16">
                <path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H5z"/>
                <path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
            </svg>
        `);

        $('.phone-graphic').css({
            'display': 'none',
            'visibility': 'hidden',
            'opacity': '0'
        });

        $('.qr-code-preview').css({
            'display': 'block',
            'visibility': 'visible',
            'opacity': '1'
        })
    }
})

$(document).on('click', 'button[data-action="update-profile"]', function(event){
	event.preventDefault();

    var $this = $(this);
    $this.addClass('disabled');

    console.log($('.profile-image').find('img').attr('src'));

    var input_data = {
        'first_name': $('input[name="first_name"]').val(),
        'last_name': $('input[name="last_name"]').val(),
        'position': $('input[name="position"]').val(),
        'location': $('input[name="location"]').val(),
        'since': $('input[name="since"]').val(),
        'profile_image': $('input[name="profile_image"]').val(),
        'username': $('input[name="username"]').val(),
        'email': $('input[name="email"]').val(),
        'encoded_image': $('.profile-image').find('img').attr('src'),
    }

    $this.html('<div class="loader"></div>');

    // empty error fields
    $('.error-field, .alert').html('').css('display', 'none');
    $('.p-input').css('border-color', 'rgba(237,242,247,var(--border-opacity))');
    $.ajax({
        type: 'POST',
        url: '/employee/profile',
        data: JSON.stringify(input_data),
        dataType: 'json',
        headers: { 'X-CSRFTOKEN': csrftoken, "Content-type": "application/json"  },
        success: function () {
            setTimeout(function (){
                $this.removeClass('disabled').html('Save');

                $('body').append(
                    '<div class="redirect-message">' +
                      '<div class="redirect-message-left">' +
                          '<div class="message-icon success">' +
                              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">' +
                                  '<path d="M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7 425.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>' +
                              '</svg>' +
                          '</div>' +
                          '<span class="message-content">UPDATED SUCCESSFULLY</span>' +
                      '</div>' +
                      '<div class="x-close">' +
                          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">' +
                              '<path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/>' +
                          '</svg>' +
                      '</div>' +
                    '</div>'
                );

                $('.redirect-message').css('opacity', '1');
                setTimeout(function () {
                    $('.redirect-message').css('opacity', '0');
                    $('.redirect-message').remove();
                }, 2000);
            }, 500)
        },
        error: function (xhr, ajaxOptions, thrownError) {
            setTimeout(function () {
                $this.removeClass('disabled');

                var list_of_errors = xhr.responseJSON["err"];
                $('.p-input').each(function(idx, el){
                    $(el).css('border-color', 'rgba(237,242,247,var(--border-opacity))');

                    for (let i = 0; i < list_of_errors.length; i++) {
                        var newItem = list_of_errors[i];
                        if (newItem.includes('non_field_errors')) {
                            $('body').append(
                                '<div class="redirect-message">' +
                                  '<div class="redirect-message-left">' +
                                      '<div class="message-icon danger">' +
                                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">' +
                                          '<path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"></path></svg>' +
                                      '</div>' +
                                      '<span class="message-content">'+ newItem.split(' - ')[1].replaceAll('"', '') +'</span>' +
                                  '</div>' +
                                  '<div class="x-close">' +
                                      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">' +
                                          '<path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/>' +
                                      '</svg>' +
                                  '</div>' +
                                '</div>'
                            )
                            $('.redirect-message').css('opacity', '1');
                      
                            setTimeout(function () {
                                $('.redirect-message').css('opacity', '0');
                                $('.redirect-message').remove();
                            }, 2000);
                        }
                        if (newItem.includes(el.id)){
                            stripped_item = newItem.split(' - ')[1];
                            if (!$(el).parents('.accordion-item').hasClass('open')) {
                                $(el).parents('.accordion-item').addClass('open');
                                $(el).parents('.accordion-item').find('.accordion-content').toggleClass('active');
                            }
                            $(el).css({'border-color': '#d53838', 'margin-top': '.1rem'});
                            $(el).prev().css({'display': 'initial'});
                            $(el).prev().html(stripped_item.replaceAll("'", ""));
                        }
                    }
                })

                $this.html(`
                    Save
                `).css('display', 'flex');
            }, 500);
        }
	}); 
});

$(document).on('keyup', '.p-input', function(){
    var $this = $(this);

    var $val = $this.val();

    $(`[data-dest='${$this.attr('data-target')}']`).text($val);
    $(`[data-dest='${$this.attr('data-target')}']`).val($val);
})


$(document).on('click', 'button[data-action="change-password"]', function(event){
	event.preventDefault();
	var input_data = {
		'old_password': $('input[name="old_password"]').val(), 
		'password': $('input[name="password"]').val(), 
		'password2': $('input[name="password2"]').val(), 
	}

    var $this = $(this);
	$this.html('<div class="loader"></div>').addClass('disabled');

	$.ajax({
		type: 'POST',
		url: '/employee/change-password',
		data: JSON.stringify(input_data),
		dataType: 'json',
		headers: { 'X-CSRFTOKEN': csrftoken, "Content-type": "application/json"  },
		success: function () {
            $('body').append(
                '<div class="redirect-message">' +
                '<div class="redirect-message-left">' +
                    '<div class="message-icon success">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">' +
                            '<path d="M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7 425.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>' +
                        '</svg>' +
                    '</div>' +
                    '<span class="message-content">PASSWORD CHANGED</span>' +
                '</div>' +
                '<div class="x-close">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">' +
                        '<path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/>' +
                    '</svg>' +
                '</div>' +
                '</div>'
            )
            $('.redirect-message').css('opacity', '1');

            setTimeout(function () {
                $('.redirect-message').css('opacity', '0');
                $('.redirect-message').remove();
            }, 2000);
            setTimeout(function () {
                window.location.href = "/employee/sign-in";
            }, 1000);
        },
        error: function (xhr, ajaxOptions, thrownError) {
		    $this.find('button').html('Save').removeClass('disabled');
            
            setTimeout(function () {
                $this.removeClass('disabled');

                var list_of_errors = xhr.responseJSON["err"];
                $('.p-input').each(function(idx, el){
                    $(el).css('border-color', 'rgba(237,242,247,var(--border-opacity))');

                    for (let i = 0; i < list_of_errors.length; i++) {
                        var newItem = list_of_errors[i];
                        if (newItem.includes('non_field_errors')) {
                            $('body').append(
                                '<div class="redirect-message">' +
                                '<div class="redirect-message-left">' +
                                    '<div class="message-icon danger">' +
                                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">' +
                                        '<path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"></path></svg>' +
                                    '</div>' +
                                    '<span class="message-content">'+ newItem.split(' - ')[1].replaceAll('"', '') +'</span>' +
                                '</div>' +
                                '<div class="x-close">' +
                                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">' +
                                        '<path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/>' +
                                    '</svg>' +
                                '</div>' +
                                '</div>'
                            )
                            $('.redirect-message').css('opacity', '1');
                    
                            setTimeout(function () {
                                $('.redirect-message').css('opacity', '0');
                                $('.redirect-message').remove();
                            }, 2000);
                        }
                        if (newItem.includes(el.id)){
                            stripped_item = newItem.split(' - ')[1];
                            if (!$(el).parents('.accordion-item').hasClass('open')) {
                                $(el).parents('.accordion-item').addClass('open');
                                $(el).parents('.accordion-item').find('.accordion-content').toggleClass('active');
                            }
                            $(el).css({'border-color': '#d53838', 'margin-top': '.1rem'});
                            $(el).prev().css({'display': 'initial'});
                            $(el).prev().html(stripped_item.replaceAll("'", ""));
                        }
                    }
                })

                $this.html(`
                    Save
                `).css('display', 'flex');
            }, 500);
		}
	}); 
});

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            console.log(e.target.result);
            if ($('.profile-image').find('img').length == 0) {
                $('.profile-image').html('<img src="" alt="Avatar" />')
            }
            $('.profile-image').find('img').attr('src', e.target.result);
            $('.profile-image').find('img').hide();
            $('.profile-image').find('img').fadeIn(650);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

$(document).on('change', '#dropzone-file', function(){
    readURL(this);
})

$(document).on('click', 'button[data-action="generate-qr-code"]', function(event){
	event.preventDefault();
	var input_data = {
		'url': `${$('#current-domain').text()}${$('input[name="username"]').val()}`,
	}

    console.log(input_data);

    var $this = $(this);
	$this.html('<div class="loader"></div>').addClass('disabled');

	$.ajax({
		type: 'POST',
		url: '/employee/generate-qr',
		data: JSON.stringify(input_data),
		dataType: 'json',
		headers: { 'X-CSRFTOKEN': csrftoken, "Content-type": "application/json"  },
		success: function () {
            setTimeout(function () {
                $('#switch-previews-btn').addClass('switch-previews').removeClass('disabled');
                $(".qr-code-preview-section").load(location.href + " .qr-code-preview");

                $this.html('Generate').removeClass('disabled');
                $('body').append(
                    '<div class="redirect-message">' +
                    '<div class="redirect-message-left">' +
                        '<div class="message-icon success">' +
                            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">' +
                                '<path d="M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7 425.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>' +
                            '</svg>' +
                        '</div>' +
                        '<span class="message-content">QR CODE GENEARATED</span>' +
                    '</div>' +
                    '<div class="x-close">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">' +
                            '<path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/>' +
                        '</svg>' +
                    '</div>' +
                    '</div>'
                )
                $('.redirect-message').css('opacity', '1');
            }, 1000)

            setTimeout(function () {
                $('.redirect-message').css('opacity', '0');
                $('.redirect-message').remove();
            }, 2000);
		},
    error: function (xhr, ajaxOptions, thrownError) {
		$this.find('button').html('Save').removeClass('disabled');
        
        setTimeout(function () {
            $this.removeClass('disabled');

            var list_of_errors = xhr.responseJSON["err"];
            $('.p-input').each(function(idx, el){
                $(el).css('border-color', 'rgba(237,242,247,var(--border-opacity))');

                for (let i = 0; i < list_of_errors.length; i++) {
                    var newItem = list_of_errors[i];
                    if (newItem.includes('non_field_errors')) {
                        $('body').append(
                            '<div class="redirect-message">' +
                              '<div class="redirect-message-left">' +
                                  '<div class="message-icon danger">' +
                                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">' +
                                      '<path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"></path></svg>' +
                                  '</div>' +
                                  '<span class="message-content">'+ newItem.split(' - ')[1].replaceAll('"', '') +'</span>' +
                              '</div>' +
                              '<div class="x-close">' +
                                  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">' +
                                      '<path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/>' +
                                  '</svg>' +
                              '</div>' +
                            '</div>'
                        )
                        $('.redirect-message').css('opacity', '1');
                  
                        setTimeout(function () {
                            $('.redirect-message').css('opacity', '0');
                            $('.redirect-message').remove();
                        }, 2000);
                    }
                    if (newItem.includes(el.id)){
                        stripped_item = newItem.split(' - ')[1];
                        if (!$(el).parents('.accordion-item').hasClass('open')) {
                            $(el).parents('.accordion-item').addClass('open');
                            $(el).parents('.accordion-item').find('.accordion-content').toggleClass('active');
                        }
                        $(el).css({'border-color': '#d53838', 'margin-top': '.1rem'});
                        $(el).prev().css({'display': 'initial'});
                        $(el).prev().html(stripped_item.replaceAll("'", ""));
                    }
                }
            })

            $this.html(`
                Generate
            `).css('display', 'flex');
        }, 500);
		}
	}); 
});

$(document).on("click", "a[data-action='logout']", function (event) {
    event.preventDefault();
    var $this = $(this);

    $this.html('<div class="loader"><div>');
  
    $.ajax({
        type: "POST",
        url: "/employee/logout",
        dataType: "json",
        data: JSON.stringify({
          'refresh_token': window.localStorage.getItem('refreshToken')
        }),
        headers: { "X-CSRFTOKEN": csrftoken, "Content-type": "application/json" },
        success: function (data) {
          setTimeout(function () {
            window.location.href = "/employee/sign-in";
          }, 500);
        },
        error: function () {
          $this.html('Sign Out');
          $('body').append(
            '<div class="redirect-message">' +
              '<div class="redirect-message-left">' +
                  '<div class="message-icon danger">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">' +
                      '<path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"></path></svg>' +
                  '</div>' +
                  '<span class="message-content">Something went wrong</span>' +
              '</div>' +
              '<div class="x-close">' +
                  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">' +
                      '<path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/>' +
                  '</svg>' +
              '</div>' +
            '</div>'
          )
          $('.redirect-message').css('opacity', '1');
  
          setTimeout(function () {
            $('.redirect-message').css('opacity', '0');
            $('.redirect-message').remove();
          }, 2000);
        },
    });
  });