$(function () {

    // Augment each selected collection with its logo information.
    function getLogo( collection ) {
        endpoint = collection.link + '?expand=logo';
        jQuery.get( endpoint )
            .done(renderLogo)
            .fail(function() {
                console.error( "Error loading logo for a collection..." );
            })
    };

    // Finds the placeholder logo element and drops the 
    function renderLogo( data ) {
        if(data.logo) {
            jQuery( "#" + data.uuid ).prepend( '<img src="' + data.logo.retrieveLink + '" alt="logo for data.name" class="collection-logo" ><br>' );
        }
    };

    // Fisher-Yates (Knuth) Shuffle implementation
    // from https://github.com/Daplie/knuth-shuffle/blob/master/index.js
    // and https://blog.codinghorror.com/the-danger-of-naivete/
    // and https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    function shuffle(array) {
        var currentIndex = array.length
          , temporaryValue
          , randomIndex
          ;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;

          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }

        return array;
    }

    // Define function that adds featured collections
    function listFeatured( data ) {
        // data is an array of items returned from the DSpace API.
        // Sort the array (KFY probably)
        data = shuffle( data );
        // Truncate the first six elements
        selected = data.slice(0,6);
        // Display those elements
        list = document.createElement("ul");
        jQuery(list).addClass("list-group");
        jQuery.each(selected, function( index, value ) {
            jQuery(list).append('<li class="list-group-item col-xs-12 col-sm-6"><a id="' + value.uuid + '" href="/handle/' + value.handle + '"><span class="collection">' + value.name + "</a></span><br>(" + value.numberItems + " items)<br>" + value.shortDescription + "</li>");
            getLogo( value );
        });
        jQuery(featuredList).append(list);
    };

    // Create empty container
    var featuredList = document.createElement("div"),
        featuredEndpoint = "/rest/collections";
    jQuery(featuredList).addClass("featured-collections").addClass("clearfix");
    jQuery("#featured_collections").append(jQuery(featuredList));

    // Retrieve list of collections and display a random selection
    jQuery.get( featuredEndpoint )
        .done(listFeatured)
        .fail(function() {
            console.error( "Error encountered loading featured collections..." );
        });
})