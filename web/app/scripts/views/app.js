define(['jquery',
        'backbone',
        'facebook',
        'text!templates/home.html',
        'text!templates/friend.html',
        'collections/FriendsCollection',
        'easing'],
  function($, Backbone, fb, template, friendTemplate, FriendsCollection) {
  var App = Backbone.View.extend({
    events: {
        "click .search-location": "searchFriendsByLocation",
        "click tap .friend": "selectFriend",
        "click tap .first-page-btn": "hideButtons"
    },
    el: ".page",
    template: _.template(template),
    initialize: function() {
      this.render();
      FB.login(function(response) {
        console.log("login response: " + response);
        if (response.authResponse) {
            console.log("logged in to facebook!");
       }
      }, {scope: 'email,friends_about_me,friends_education_history,friends_hometown,friends_location'});
    },
    render: function() {
      this.$el.html(this.template());
      this.locateMe();
      $(".current-locale").on("click tap", _.bind(this.currentLocale, this));
      $(".future-plan").on("click tap", _.bind(this.futurePlan, this));
      return this;
    },
    locateMe: function() {
      var textbox = this.$el.find(".location-box");
      var cityNameSpan = this.$el.find(".city-name");
      var geocoder = new google.maps.Geocoder();
 
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var city = "";
          var lat = position.coords.latitude;
          var lng = position.coords.longitude;
          var latlng = new google.maps.LatLng(lat, lng);
          geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              console.log(results);
              if (results[0]) {
                for (var i=0; i<results[0].address_components.length; i++) {
                  for (var b=0;b<results[0].address_components[i].types.length;b++) {
                    if (results[0].address_components[i].types[b] == "locality") {
                        //this is the object you are looking for
                        city = results[0].address_components[i].long_name;
                        cityNameSpan.text(city);
                    } else if (results[0].address_components[i].types[b] == "administrative_area_level_1") {
                        //this is the object you are looking for
                        city += ", " + results[0].address_components[i].short_name;
                    }
                  }
                }
              }
            }
            textbox.val(city);
          });
        });
      }
    },
    searchFriendsByLocation: function(location) {
      console.log("Searching for friends in: " + location);
      var that = this;
      var friendTemplateTemplated = _.template(friendTemplate);
      var friendList = $("#friends-listing");
      FB.api({
          method: 'fql.query',
          query: 'select current_location, name, pic_square FROM user WHERE uid in (SELECT uid2 FROM friend WHERE uid1=me()) and "' + location + '" in current_location LIMIT 20',
          }, function(response){
              var friends = new FriendsCollection();
              friends.add(response);
              friendList.html("");
              var i=0;
              friends.each(function(friend) {
                setTimeout(function(){
                  $(friendTemplateTemplated(friend.toJSON())).appendTo("#friends-listing")
                    .animate({marginTop: 0}, {duration: 750, easing: "easeOutExpo"})
                    .on("click tap", that.selectFriend);
                  }, i);
                  i = i + 100;
              });
              $(".continue-on").css("margin-top", "-500px").show().animate({marginTop: 25}, {duration: 750, easing: "easeOutExpo"});
              $(".continue-on").on("tap click", function() {
                var winH = $(window).height();
                $("#friends").animate({marginTop: winH}, {duration: 750, easing: "easeInExpo", complete: function() {
                  $(this).hide();
                }});
              });
          });
    },

    selectFriend: function(ev) {
      $(ev.target).toggleClass("active");
    },

    hideButtons: function() {
      var winH = $(window).height();
      $(".first-page-btn").animate({marginTop: winH}, {duration: 750, easing: "easeInExpo", complete: function() {
        $(this).hide();
      }});
    },

    currentLocale: function() {
      this.hideButtons();
      this.searchFriendsByLocation($(".city-name").text());
    },
    futurePlan: function() {
      this.hideButtons();
      this.searchFriendsByLocation("Boston");
    }
  });

  return App;
});