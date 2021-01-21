let deliData = null;
let pageSize = 5;  //hold the number of objects we want up on the page

function queryData(zip, radius)
{
    radius = radius / 0.0022046;
    
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?location=" + zip + ",radius=" + radius,
        "method": "GET",
        beforeSend: function(request) {
            request.setRequestHeader("Authorization", "Bearer F7FM9iQY3oq11KAZGmFC3bXRDNZpsF5szVoZ7Jt86xfusYBLbLTgOyNjoPysWlUy0Ka_IxJxC29EV2YJ-ORPBV3gT22fIB2G96_ObY-mtQV03YMMk5xEG5DJrewCYHYx");
        },
    };

    $.ajax(settings)

        .then(function (response) {

            console.log(response);
            deliData = response;
            createPageination();
            populateData(1);
            $("#contentMain").hide();
            $("#restaurantContainer").show(); 
        })
        .catch(function(response)
        {
            console.log(response);
        });
        
}

function createPageination()
{
    var pagination = $("#pagination");

    var length = Math.ceil(deliData.businesses.length / pageSize);

    for (i=0; i < length; i++)
    {
        var pageNumber = $("<a>").html(i + 1).attr("data-index", i +1);
        pagination.append(pageNumber);
    }    

    $("#pagination > a").click(function(event)
    {
        var element = event.target;
        var pageNumber = parseInt($(element).attr("data-index"));
        populateData(pageNumber);
    });

}

function populateData(page)  //3
{

    var content = $("#restaurantContainer");
    content.empty();
    var pageIndex = (page * pageSize) - pageSize;  //10
    var pageOffset = (page * pageSize);  //15

    for (i = pageIndex; i < pageOffset; i++)  //while 1=10; i<15
    {
        if (i < deliData.businesses.length)
        {
            //make the elements to display the restaurants and append to the parent div
            var div = $("<div>").addClass("grid-x grid-margin-x small-up-2 medium-up-3");
            var card = $("<div>").addClass("product-card");

            var imgDiv = $("<div>").addClass("product-card-thumbnail");
            var imgLink = $("<a>").attr("href", deliData.businesses[i].url).attr("target", "_blank");
            var image = $("<img>").attr("src", deliData.businesses[i].image_url).addClass("product-card-thumbnail-image");
            var name = $("<h6>").text(deliData.businesses[i].alias);
            var phone = $("<p>").html(deliData.businesses[i].phone);       
            var alias = $("<p>").html(deliData.businesses[i].categories[0].alias);
            var price = $("<h6>").text("Price" + deliData.businesses[i].price);
            var stars = $("<h6>").text("Stars " + deliData.businesses[i].rating);
            var mapDiv = $("<div>").addClass("product-card-thumbnail").attr("id", "googleMap" + i);

            imgLink.append(image);
            imgDiv.append(imgLink);
            card.append(imgDiv);
            card.append(name);
            card.append(phone);
            card.append(alias);
            card.append(price);
            card.append(stars);
            card.append(mapDiv);

            div.append(card);
            content.append(div);

            const coor = { lat: deliData.businesses[i].coordinates.latitude, lng: deliData.businesses[i].coordinates.longitude};
            const map = new google.maps.Map(document.getElementById("googleMap" + i), {
                zoom: 12,
                center: coor,
              });
              // The marker, positioned at Uluru
              const marker = new google.maps.Marker({
                position: coor,
                map: map,
              });

        }

        // var address1 = data.businesses[i].location.address1;
        // var city = data.businesses[i].location.city;
        // var zip = data.businesses[i].location.zip_code;

        // console.log(name + " " + alias +  " " + phone + " " +  price +  " " + rating +  " " + image + " " +  address1 +  " " + city +  " " + zip);
    }

}


// queryData(48165, 1);

$(document).ready(function () 
{
    $("#restaurantContainer").hide
    $("#dineIn").click(function (event) 
    {   
        var zip = $("#findtext").val().trim();
        var radius = $("#findlocate").val().trim();

        queryData(zip, radius);
    });

    $("#delivery").click(function (event) 
    {   
        var zip = $("#findtext").val().trim();
        var radius = $("#findlocate").val().trim();

        queryData(zip, radius);
    });
   
});