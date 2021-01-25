    //svg data for the favorites heart. added a placeholder -  ${fill} so we can use string.replace to change the color
const favSvgHeart = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path ${fill} d=\"M12 4.435c-1.989-5.399-12-4.597-12 3.568 0 4.068 3.06 9.481 12 14.997 8.94-5.516 12-10.929 12-14.997 0-8.118-10-8.999-12-3.568z\"/></svg>";
let deliData = null;  //array for the query response
let pageSize = 5;  //hold the number of objects we want to show on the results page
let pageOffset = 0;  //for pagination - hold the digit the user click on,  example results bring back pagination 1-12, user clicked on 2 page offset=2
let zip = 0;  //holds zip from user input
let radius = 0;  //holds radius from user input
let favorites = [];  //array to hold favorites in local storage


//function to query yelp - passing in zip, radius, the number of results I want back starting at the last result + 1 that was returned.  Example, my radius bings back 63 restaruants,
//because of the pagination function and the fact that I want to show 5 results on a page the first query will bring back 0-4 results. If the user clicks on the second page for pagination
// page offset changes to 2 and the results will come back 5-9 of the total array.
function queryData()
{
    var url = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?location=" + zip + "&radius=" + radius + "&limit=" + pageSize + "&offset=" + pageOffset;
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": url,
        "method": "GET",

        beforeSend: function(request) { //yelp requires bearer request header authorization and api key
            request.setRequestHeader("Authorization", "Bearer F7FM9iQY3oq11KAZGmFC3bXRDNZpsF5szVoZ7Jt86xfusYBLbLTgOyNjoPysWlUy0Ka_IxJxC29EV2YJ-ORPBV3gT22fIB2G96_ObY-mtQV03YMMk5xEG5DJrewCYHYx");
        },
    };

    $.ajax(settings)

        .then(function (response) {  //when the query is finished
 
            if (deliData === null)  //if deliData is empty then this is the first run so create the pagination links.  We only want to make these once
            {
                createPageination(response.total);  //create the pagination links based on the total of restaruants that yelp says we have
            }

            deliData = response;  //set deliData to respose

            populateData();  //show the results
        })
        .catch(function(response)
        {
            console.log(response);
        });
}


//create the pagination links, accepts the total number of restaruants yelp said exist
function createPageination(total)
{
    var pagination = $("#pagination");  //point to the pagination div

    //divide the number of total restaruants by the number of results you want to see on the page and round up.
    //Example 67 restaruants with 5 results per page will have 14 pagination links
    var length = Math.ceil(total / pageSize);  

    for (i=0; i < length; i++)
    {
        //page number should start at 1.  add data index of the page number for refrence.  pagination page colors the link white
        var pageNumber = $("<a>").html(i + 1 + "  ").attr("data-index", i +1).addClass("pagination-page");
        pagination.append(pageNumber);  //add the link to the div
    }    

    $("#pagination > a").click(function(event)  //bind the event handlers to the links
    {
        var element = event.target; //get the link that was clicked
        var pageIndex = parseInt($(element).attr("data-index"));  //set the page number that was clicked
          //multiply the number that was clicked  by 5 and subtract pagesize.  
          //example page index is 4 times pageSize(5)=20 minus 5 = 15.  pageOffset will bring back the next 5 restatuants starting at the 15th.
        pageOffset = (pageIndex * pageSize) - pageSize;
        $("#pagination > a").removeClass("pagination-active-page").addClass("pagination-page"); //remove the red color for all and set them all to white
        $(element).removeClass("pagination-page").addClass("pagination-active-page"); //make the current clicked link red
        queryData();  //query the next set of data based off pageOffset
    });
}


//show the results from the search query
function populateData()  
{

    var content = $("#restaurantContainer");  //get the div restaruantContainer
    content.empty();  //clear it out from previus results

    for (i = 0; i < deliData.businesses.length; i++)  //while 1=10; i<15
    {
            //make the elements to display the restaurants and append to the parent div
            var div = $("<div>").addClass("cell large-auto text-center");  //create the parent div
            var card = $("<div>").addClass("product-card");  //create the card div

            //restaruant image with a hyperlink to yelp
            var imgDiv = $("<div>").addClass("product-card-thumbnail");  
            var imgLink = $("<a>").attr("href", deliData.businesses[i].url).attr("target", "_blank");
            var image = $("<img>").attr("src", deliData.businesses[i].image_url).addClass("product-card-thumbnail-image");
            
            var name = $("<h6>").addClass("product-card-title").text(deliData.businesses[i].name);  //restaruant name
            
            var businessIndex = favorites.find(function(item, itemIndex) {  //see if the current business exixts in the favorites array
                return item.id === deliData.businesses[i].id;  //look to see if id's match, if they do return the index to businessIndex
            });
            
            var fill;      //fill color for favorite icon
            var isFavorite; //true or false for to set the data-fvorite attribute
            if(businessIndex)  //if not undefined
            {
                fill = "fill=\"#ff0000\"";  //red
                isFavorite = true;  //set the attribute
            }
            else
            {
                fill = "fill=\"#fff\"";  //white
                isFavorite = false;
            }

            var svgHeart = favSvgHeart.replace("${fill}", fill);  //replace the placeholder with the correct color
            //make the link, set the data index, set if it is favorite or not, add the svg content
            var favLink = $("<a>").attr("href", "#").attr("data-index", i).attr("data-favorite", isFavorite.toString()).addClass("heart-svg-icon").append(svgHeart);

            //if phone is not empty then set it else set it to N/A
            var phoneContent = deliData.businesses[i].display_phone !== "" ? "P: " + deliData.businesses[i].display_phone : "P: N/A" ; 
            var phone = $("<p>").html(phoneContent);
       
            var alias = $("<p>").html(deliData.businesses[i].categories[0].alias); //alias, example chineese, pizza, bbq...

            //if there is a price then set it otherwise make it N/A
            var priceContent = deliData.businesses[i].price ? "Price " + deliData.businesses[i].price : "Price: N/A";
            var price = $("<h6>").text(priceContent);

            var stars = $("<h6>").text("Stars " + deliData.businesses[i].rating);  //user rating
            var mapDiv = $("<div>").addClass("product-card-thumbnail").attr("id", "googleMap" + i);

            //append the divs
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

            //set the google map to the div "googleMap"
            const coor = { lat: deliData.businesses[i].coordinates.latitude, lng: deliData.businesses[i].coordinates.longitude}; //get the lat and lng
            const map = new google.maps.Map(document.getElementById("googleMap" + i), {
                zoom: 12, //zoom in
                center: coor,
              });
              // The marker, positioned at restaurant coordinates
              const marker = new google.maps.Marker({
                position: coor,
                map: map,
              });
              google.maps.event.addListener(marker, 'click', (function(marker, i) { //add event listener to the marker and take the user to the yelp page
                return function() {
                     window.open(deliData.businesses[i].url, "_blank");
                }
              })(marker, i));

        $("#contentMain").hide();
        $("#restaurantContainer").show();
        $("#mapLink").show();
        $("#favoritesLink").show();
        $("#pagination").show();
    }

    $(".heart-svg-icon").click(function(event)  //event handler for the favorite icon
    {
        var element = event.target;
        var deliIndex = parseInt($(element).parent().parent().attr("data-index"));  //get the div that is clicked, not the svg image.  deliIndex matches the index of the item in the array
        var deliFavorite = ($(element).parent().parent().attr("data-favorite") === "true");  //set the attribute to "true" - yes it is a favorite
        console.log("deliFavorite: " + deliFavorite);
        console.log("Deli: " + deliIndex);
        setFavorite(deliIndex, deliFavorite, element);  //call the setFavorite function and pass it the index, if it is favorite, and the object clicked
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
            var card = $("<div>").addClass(" favorite-card product-card");

            var imgDiv = $("<div>").addClass("product-card-thumbnail");
            var imgLink = $("<a>").attr("href", favorites[i].url).attr("target", "_blank");
            var image = $("<img>").attr("src", favorites[i].image_url).addClass("product-card-thumbnail-image");
            
            var name = $("<h6>").text(favorites[i].name);
            
            var fill= "fill=\"#ff0000\"";;      //fill color for favorite icon
            var svgHeart = favSvgHeart.replace("${fill}", fill);
            var favLink = $("<a>").attr("href", "#").attr("data-index", i).attr("data-favorite", "true").addClass("fav-heart-svg-icon").append(svgHeart);

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

    $(".fav-heart-svg-icon").click(function(event)
    {
        var element = event.target;
        var favIndex = parseInt($(element).parent().parent().attr("data-index"));
        favorites.splice(favIndex, 1);
        localStorage.setItem("favorites", JSON.stringify(favorites));  
        renderFavorites();
    });
}

//load favorites from local storage to the favorites array
function loadFavorites()
{
    var favoritesArray = localStorage.getItem("favorites");
    if (favoritesArray) //if not undefined
    {
      favorites = JSON.parse(favoritesArray);  //make sure there is a favorites object in local storage
    }
    else {
      localStorage.setItem("favorites", JSON.stringify(favorites));  //if not make one and store it to local storage
    }
}

//index od the item in the array, if it is favorite, and the object clicked
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

    localStorage.setItem("favorites", JSON.stringify(favorites));  //convert to a string and sent to local storage
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


  //mapAll need to make a seperate query because queryData only brings back 5, we need all the results to show on the map (max 50, limits of yelp)
function mapAll()
{   

    var businesses;
    var url = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?location=" + zip + "&radius=" + radius + "&limit=50";
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

        .then(function (response) {  //show the map
            console.log(response);
            businesses = response.businesses;
            var marker;
            var i;
            const coor = { lat: businesses[0].coordinates.latitude, lng: businesses[0].coordinates.longitude};
            const map = new google.maps.Map(document.getElementById("mapContainer"), {
                zoom: 12,
                center: coor,
              });
        
              for (i = 0; i < businesses.length; i++)  //iterate through the items to get the lat and lng of each item
              {
                  marker = new google.maps.Marker({
                    position: new google.maps.LatLng(businesses[i].coordinates.latitude, businesses[i].coordinates.longitude),
                    map: map
                  });
        
                  google.maps.event.addListener(marker, 'click', (function(marker, i) {  //add an event listener to the marker and send the user to yelp
                    return function() {
                         window.open(businesses[i].url, "_blank");
                    }
                  })(marker, i));
              }
              $("#mapContainer").show();

        })
        .catch(function(response)
        {
            console.log(response);
        });


}

// queryData(48165, 1);

$(document).ready(function () 
{
    loadFavorites(); //get favorites from local storage
    pageOffset = 0;   //set the marker to 0 for the first 5 set of data coming back
    
    $("#restaurantContainer").hide();  
    $("#mapLink").hide();
    $("#favoritesLink").show();
    $("#favorites").hide();
    $("#searchLink").hide();

    $("#feedMe").click(function (event) //click handler for Feed Me! link
    {   
        zip = $("#findtext").val().trim();  //get the values
        radius = $("#findlocate").val().trim();

        if (zip === "" || radius === "")  //make sure they are filled
        {
             var modal = new Foundation.Reveal($("#exampleModal1")); //if not warn the user
             $("#exampleModal1").foundation('open');
        }
        else
        {
            radius = parseInt(radius / 0.0022046);  //conver miles to meters for yelp
            queryData();  //get the data
        }
    });

    $("#mapLink").click(function (event) //event handler to show all the results on one big google map
    {   
        $("#restaurantContainer").hide();
        $("#mapLink").hide();
        $("#pagination").hide();
        $("#favoritesLink").show();
        $("#searchLink").show();

        mapAll();  //function to shoe the map
    });

    $("#favoritesLink").click(function (event) //event handler for the Favorites link
    {   
        $("#contentMain").hide();
        $("#restaurantContainer").hide();
        $("#favoritesLink").hide();
        $("#mapLink").hide();
        $("#mapContainer").hide();
        $("#pagination").hide();
        $("#searchLink").show();
        renderFavorites();  //show the favorites
    });

    $("#searchLink").click(function (event) //event handler for the search link to return to the search page
    {   
        $("#contentMain").show();
        $("#favoritesLink").show();
        $("#favorites").hide();
        $("#findtext").val("");
        $("#findlocate").val("");
        $("#mapContainer").hide();
        $("#searchLink").hide();
    });
});
