(function admin($) {
  var $forms = $('.js-modify-admin-form');
  var $buttons = $forms.find('.js-action-button');

  function getFormAction($btn) {
    return $btn.data('action');
  }

  $buttons.on('click', function (e) {
    var $btn = $(this);
    var $form = $btn.parent('form');
    var action = getFormAction($btn);
    $form.prop('action', action);

    $form.trigger('submit');
    return (e.preventDefault(), false);
  });

})(jQuery)