(function login($) {
  var $form = $('.js-persona-form');
  var $input = $form.find('.js-persona-input');
  var $loginButton = $('.js-login-button');

  function launchBrowserId(callback) {
    return function(e) {
      navigator.id.get(callback, { siteName: 'RockawayHelpSMS' });
      return (e.preventDefault(), false);
    }
  }

  function handleResponse(assertion) {
    if (!assertion) return false;
    $input.val(assertion);
    $form.trigger('submit');
  }

  $loginButton.on('click', launchBrowserId(handleResponse));
})(jQuery);