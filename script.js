const favSvgHeart = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path ${fill} d=\"M12 4.435c-1.989-5.399-12-4.597-12 3.568 0 4.068 3.06 9.481 12 14.997 8.94-5.516 12-10.929 12-14.997 0-8.118-10-8.999-12-3.568z\"/></svg>";
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
            
            var name = $("<h6>").text(deliData.businesses[i].name);
            
            var businessIndex = favorites.find(function(item, itemIndex) {  //see if the current business exixts in the favorites array
                return item.id === deliData.businesses[i].id;  //look to see if id's match, if they do return the index to businessIndex
            });
            
            var fill;      //fill color for favorite icon
            var isFavorite; //true or false for to set the data-fvorite attribute
            if(businessIndex)  //if not undefined
            {
                fill = "fill=\"#ff0000\"";
                isFavorite = true;
            }
            else
            {
                fill = "fill=\"#fff\"";
                isFavorite = false;
            }

            var svgHeart = favSvgHeart.replace("${fill}", fill);
            var favLink = $("<a>").attr("href", "#").attr("data-index", i).attr("data-favorite", isFavorite.toString()).addClass("heart-svg-icon").append(svgHeart);

            var phoneContent = deliData.businesses[i].display_phone !== "" ? "P: " + deliData.businesses[i].display_phone : "P: N/A" ; 
            var phone = $("<p>").html(phoneContent);
       
            var alias = $("<p>").html(deliData.businesses[i].categories[0].alias);

            var priceContent = deliData.businesses[i].price ? "Price " + deliData.businesses[i].price : "Price: N/A";
            var price = $("<h6>").text(priceContent);

            var stars = $("<h6>").text("Stars " + deliData.businesses[i].rating);
            var mapDiv = $("<div>").addClass("product-card-thumbnail").attr("id", "googleMap" + i);

            imgLink.append(image);
            imgDiv.append(imgLink);
            card.append(imgDiv);
            card.append(name);
            card.append(favLink);
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

        $("#contentMain").hide();
        $("#restaurantContainer").show();
        $("#mapLink").show();
        $("#favoritesLink").show();
    }

    $(".heart-svg-icon").click(function(event)
    {
        var element = event.target;
        var deliIndex = parseInt($(element).parent().parent().attr("data-index"));
        var deliFavorite = ($(element).parent().parent().attr("data-favorite") === "true");
        console.log("deliFavorite: " + deliFavorite);
        console.log("Deli: " + deliIndex);
        setFavorite(deliIndex, deliFavorite, element);
    });

}

function renderFavorites()
{
    var content = $("#favorites");
    content.empty();

    for (i = 0; i < favorites.length; i++)  //while 1=10; i<15
    {
            //make the elements to display the restaurants and append to the parent div
            var div = $("<div>").addClass("column");
            var card = $("<div>").addClass("product-card");

            var imgDiv = $("<div>").addClass("product-card-thumbnail");
            var imgLink = $("<a>").attr("href", favorites[i].url).attr("target", "_blank");
            var image = $("<img>").attr("src", favorites[i].image_url).addClass("product-card-thumbnail-image");
            
            var name = $("<h6>").text(favorites[i].name);
            
            var fill= "fill=\"#ff0000\"";;      //fill color for favorite icon
            var svgHeart = favSvgHeart.replace("${fill}", fill);
            var favLink = $("<a>").attr("href", "#").attr("data-index", i).attr("data-favorite", "true").addClass("heart-svg-icon").append(svgHeart);

            var phoneContent = favorites[i].display_phone !== "" ? "P: " + favorites[i].display_phone : "P: N/A" ; 
            var phone = $("<p>").html(phoneContent);
       
            imgLink.append(image);
            imgDiv.append(imgLink);
            card.append(imgDiv);
            card.append(name);
            card.append(favLink);
            card.append(phone);
            div.append(card);
            content.append(div);

        $("#searchLink").html("Search");      
        $("#searchLink").show();
        content.show();
    }

    $(".heart-svg-icon").click(function(event)
    {
        var element = event.target;
        var deliIndex = parseInt($(element).parent().parent().attr("data-index"));
        var deliFavorite = ($(element).parent().parent().attr("data-favorite") === "true");
        console.log("deliFavorite: " + deliFavorite);
        console.log("Deli: " + deliIndex);
        setFavorite(deliIndex, deliFavorite, element);
    });
}

//load favorites from local storage to the favorites array
function loadFavorites()
{
    var favoritesArray = localStorage.getItem("feedMe");
    if (favoritesArray) //if not undefined
    {
      favorites = JSON.parse(favoritesArray);  //make sure there is a feedMe object in local storage
    }
    else {
      localStorage.setItem("feedMe", JSON.stringify(favorites));  //if not make one and store it to local storage
    }
}

function setFavorite(index, isFavorite, svgElement)
{
    var color = !isFavorite ? "#ff0000" : "#fff";  //if false make it red, true make it white
    $(svgElement).attr("fill", color);

    isFavorite = !isFavorite;
    $(svgElement).parent().parent().attr("data-favorite", isFavorite.toString());

    var deliBusinessId = deliData.businesses[index].id;  //get the id of the current business to make favorite/unfavorite

    var businessIndex = favorites.find(function(item, itemIndex) {  //see if the current business exixts in the favorites array
        return item.id === deliBusinessId;  //look to see if id's match, if they do return the index to businessIndex
    });

    if(businessIndex)  // if not undefined
    {
        favorites.splice(businessIndex, 1);  //remove busniess from the favorites array
    }
    else
    {
        favorites.push(deliData.businesses[index]); // save favorite        
    }

    localStorage.setItem("feedMe", JSON.stringify(favorites));  //convert to a string and sent to local storage
}

function formatPhoneNumber(str)
{
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
    loadFavorites();
    pageOffset = 0;   
    
    $("#restaurantContainer").hide();
    $("#mapLink").hide();
    $("#favoritesLink").show();
    $("#favorites").hide();
    $("#searchLink").hide();

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

    $("#favoritesLink").click(function (event) 
    {   
        $("#contentMain").hide();
        $("#restaurantContainer").hide();
        $("#favoritesLink").hide();
        $("#mapLink").hide();
        $("#pagination").hide();
        renderFavorites();
    });

    $("#searchLink").click(function (event) 
    {   
        $("#contentMain").show();
        $("#favoritesLink").show();
        $("#favorites").hide();
        $("#findtext").val("");
        $("#findlocate").val("");
    });
    
});
