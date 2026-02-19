// Bookshop.org stuff

function getWidget(isbn, type = 'book') {
  let markup = '';
  
  switch (type) {
    case 'button':
      markup = '<script src=https://uk.bookshop.org/widgets.js data-type="book_button" data-affiliate-id="17006" data-sku="' + isbn + '"></script>';
      break;
    case 'featured':
      markup = '<script src=https://uk.bookshop.org/widgets.js data-type="featured" data-full-info="true" data-affiliate-id="17006" data-sku="' + isbn + '"></script>';
      break;
    default:
      markup = '<script src=https://uk.bookshop.org/widgets.js data-type="book" data-affiliate-id="17006" data-sku="' + isbn + '"></script>';
  }

  return markup;
}

// Book affiliate URL on Bookshop.org
function getAffiliateLink(isbn) {
  return "https://uk.bookshop.org/a/17006/" + isbn;
}

export default { getWidget, getAffiliateLink };