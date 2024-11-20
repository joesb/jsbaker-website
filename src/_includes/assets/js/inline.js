$(document).ready(function () {
  $('html').addClass('js');

  // Open and close loop for main navigation on mobile.
  $('button.header-main__menu').click(function () {
    // when user clicks on nav btn..
    if ($('.open-mobile').length) {
      // .. if nav is already open..
      $('.header-main').removeClass('open-mobile'); // .. remove the class..
      $('button.header-main__menu').attr('aria-expanded', 'false');
    } else {
      // .. if not ..
      $('.header-main').addClass('open-mobile'); // .. add the open on mobile class..
      $('button.header-main__menu').attr('aria-expanded', 'true');
    }
  });

  if ($('.testimonials--container')[0] && $('.testimonials--container').data('testimonial-count') > 1) {
    var container = $('.testimonials--container');
    var testimonialsContainer = container.find('.testimonials');
    var count = container.data('testimonial-count');
    var rand = Math.floor((Math.random() * count) + 1);
    var name = '.testimonial--' + rand;
    if (rand > 1) {
      var testimonial = $(name);
      testimonialsContainer.scrollLeft(testimonial.offset().left);
    }
  }
});
