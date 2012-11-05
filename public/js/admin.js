(function admin($) {
  var $forms = $('.js-modify-admin-form');
  var $buttons = $forms.find('.js-action-button');

  function getFormMethod($btn) {
    return $btn.data('method');
  }

  $buttons.on('click', function (e) {
    var $btn = $(this);
    var $form = $btn.parent('form');
    var $method = $form.find('.js-form-method');
    $method.val(getFormMethod($btn));

    $form.prop('action', action);
    $form.trigger('submit');
    return (e.preventDefault(), false);
  });

})(jQuery)