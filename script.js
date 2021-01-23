let deliData = null; 
let pageSize = 5;  //hold the number of objects we want up on the page
let pageOffset = 0;
let zip = 0;
let radius = 0;
let favorites = [];

function queryData()
{
    var url = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?location=" + zip + "&radius=" + radius + "&limit=" + pageSize + "&offset=" + pageOffset;
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": url,
        "method": "GET",

        beforeSend: function(request) {
            request.setRequestHeader("Authorization", "Bearer F7FM9iQY3oq11KAZGmFC3bXRDNZpsF5szVoZ7Jt86xfusYBLbLTgOyNjoPysWlUy0Ka_IxJxC29EV2YJ-ORPBV3gT22fIB2G96_ObY-mtQV03YMMk5xEG5DJrewCYHYx");
        },
    };

    $.ajax(settings)

        .then(function (response) {
            console.log(response);

            if (deliData === null)
            {
                createPageination(response.total);
            }

            deliData = response;

            populateData();
            $("#contentMain").hide();
            $("#restaurantContainer").show(); 
        })
        .catch(function(response)
        {
            console.log(response);
        });
}

function createPageination(total)
{
    var pagination = $("#pagination");

    var length = Math.ceil(total / pageSize);

    for (i=0; i < length; i++)
    {
        var pageNumber = $("<a>").html(i + 1 + "  ").attr("data-index", i +1);
        pagination.append(pageNumber);
    }    

    $("#pagination > a").click(function(event)
    {
        var element = event.target;
        var pageIndex = parseInt($(element).attr("data-index"));
        pageOffset = (pageIndex * pageSize) - pageSize;  
        queryData();
    });
}

function populateData()  
{

    var content = $("#restaurantContainer");
    content.empty();

    for (i = 0; i < deliData.businesses.length; i++)  //while 1=10; i<15
    {
            //make the elements to display the restaurants and append to the parent div
            var div = $("<div>").addClass("column");
            var card = $("<div>").addClass("product-card");

            var imgDiv = $("<div>").addClass("product-card-thumbnail");
            var imgLink = $("<a>").attr("href", deliData.businesses[i].url).attr("target", "_blank");
            var image = $("<img>").attr("src", deliData.businesses[i].image_url).addClass("product-card-thumbnail-image");
            
            var tmpName = deliData.businesses[i].name;
            var name = tmpName.replace(/-/g, " ");
            $("<h6>").text(name);
            
            var favDiv = $("<div>").addClass("favorite");
            var favLink = $("<a>").attr("href", "#");
            var favImage = $("<img>").attr("src", "./images/not-favorite.gif").addClass("product-card-favorite-image");

            var tmpPhone = deliData.businesses[i].phone; 
            if (tmpPhone) 
            {
                var phone = formatPhoneNumber(tmpPhone); 
                console.log(phone);
                $("<p>").html(phone);
            }
       
            var alias = $("<p>").html(deliData.businesses[i].categories[0].alias);
            var price = $("<h6>").text("Price " + deliData.businesses[i].price);
            var stars = $("<h6>").text("Stars " + deliData.businesses[i].rating);
            var mapDiv = $("<div>").addClass("product-card-thumbnail").attr("id", "googleMap" + i);

            imgLink.append(image);
            imgDiv.append(imgLink);
            favLink.append(favImage);
            favDiv.append(favLink);
            card.append(imgDiv);
            card.append(favDiv);
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
              // The marker, positioned at restaurant coordinates
              const marker = new google.maps.Marker({
                position: coor,
                map: map,
              });

        $("#mapLink").html("Click to view all");
        $("#mapLink").show();
    }

}

let formatPhoneNumber = (str) => {
    //Filter only numbers from the input
    let tmpCleaned = ('' + str).replace(/\D/g, '');
    //remove the 1
    let cleaned = tmpCleaned.slice(1);
    
    //Check if the input is of correct length
    let match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3]
    };
  
    return null
  };

function mapAll()
{   
    var marker;
    var i;
    const coor = { lat: deliData.businesses[0].coordinates.latitude, lng: deliData.businesses[0].coordinates.longitude};
    const map = new google.maps.Map(document.getElementById("mapContainer"), {
        zoom: 12,
        center: coor,
      });

      for (i = 1; i <deliData.businesses.length; i++)
      {
          marker = new google.maps.Marker({
            position: new google.maps.LatLng(deliData.businesses[i].coordinates.latitude, deliData.businesses[i].coordinates.longitude),
            map: map
          });

          google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                 window.open(deliData.businesses[i].url, "_blank");
            }
          })(marker, i));
      }
}

// queryData(48165, 1);

$(document).ready(function () 
{
    pageOffset = 0;   
    
    $("#restaurantContainer").hide();
    $("#mapLink").hide();

    $("#dineIn").click(function (event) 
    {   
        zip = $("#findtext").val().trim();
        radius = $("#findlocate").val().trim();
        radius = parseInt(radius / 0.0022046);

        queryData();
    });

    $("#mapLink").click(function (event) 
    {   
        $("#restaurantContainer").hide();
        $("#mapLink").hide();
        $("#pagination").hide();
        mapAll();
    });

   
});
