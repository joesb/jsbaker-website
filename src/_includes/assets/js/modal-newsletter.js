$(document).ready(function () {
  var newsletterModal = $('#contact-newsletter');

  // contactModal.on($.modal.BEFORE_BLOCK, function(e, m) {
  //   m.options.fadeDuration = 100;
  // });

  newsletterModal.on($.modal.OPEN, function(e, m) {
    m.$elm.attr("aria-hidden", "false").addClass("is-open");
  });

  newsletterModal.on($.modal.CLOSE, function(e, m) {
    m.$elm.attr("aria-hidden", "true").removeClass("is-open");
  });
});