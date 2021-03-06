define(['jquery',
        'backbone',
        'facebook',
        'text!templates/home.html',
        'text!templates/friend.html',
        'collections/FriendsCollection',
        'easing',
        'facegap'],
  function($, Backbone, fb, template, friendTemplate, FriendsCollection) {
  var App = Backbone.View.extend({
    events: {
        "click .search-location": "searchFriendsByLocation",
        "click tap .friend": "selectFriend",
        "click tap .first-page-btn": "hideButtons"
    },
    chosenFriends: [],
    el: ".page",
    template: _.template(template),
    initialize: function() {
      this.render();
      var config = {
        app_id      : '225319554294218',
        secret      : '3c88b2c2dcf6fb338bff5878cee1ff81',
        scope       : 'email,friends_about_me,friends_education_history,friends_hometown,friends_location',
        host        : 'http://starbite.co/oauth/redirect.php', //App Domain ( Facebook Developer )
      };
      $(document).FaceGap(config);
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
      //Function callback response
      function _callback( event ){
          // alert('_callback status > '+event.status);
          // alert('_callback data > '+JSON.stringify(event.data));
          // alert('_callback message > '+event.message);
          var friends = new FriendsCollection();
          friends.add(event.data.data);
          friendList.html("");
          var i=0;
          friends.each(function(friend) {
            setTimeout(function(){
              $(friendTemplateTemplated(friend.toJSON())).appendTo("#friends-listing")
                .animate({marginTop: 0}, {duration: 750, easing: "easeOutExpo"})
                .on("click tap", _.bind(that.selectFriend, that));
              }, i);
              i = i + 100;
          });
          $(".continue-on").css("margin-top", "-500px").show().animate({marginTop: 25}, {duration: 750, easing: "easeOutExpo"});
          $(".continue-on").on("tap click", function() {
            var winH = $(window).height();
            $("#friends").animate({marginTop: winH}, {duration: 750, easing: "easeInExpo", complete: function() {
              $(this).hide();
              $(".message").css("margin-top", "-500px").show().animate({marginTop: 25}, {duration: 750, easing: "easeOutExpo"});
              setTimeout(function() {
                $(".send-messages").css("margin-top", "-500px").show()
                  .animate({marginTop: 25}, {duration: 750, easing: "easeOutExpo"})
                  .on("click tap", function() {
                    var msg = $(".message").val();
                    $(".message").hide();
                    _.each(that.chosenFriends, function(recip) {
                      var custom_msg = msg.replace("%name%", recip.fname);
                      // alert(custom_msg);
                      var options = new ContactFindOptions();
                      options.multiple = true;
                      options.filter = recip.name;
                      var fields = [ "name", "phoneNumbers"];
                      navigator.contacts.find(fields, function(contacts) {
                        if (contacts.length > 0) {
                          $.post("http://thermal-history-360.appspot.com", {msg: custom_msg, pnumber: "+1" + contacts[0].phoneNumbers[0].value});
                        }
                      }, null, options);
                    });
                    $(".send-messages").animate({marginTop: winH}, {duration: 750, easing: "easeInExpo", complete: function() {
                      $(".messages").animate({marginTop: winH}, {duration: 750, easing: "easeInExpo", complete: function() {
                        $(this).hide();
                      }});
                      $(this).hide();
                      $(".success-page").css("margin-top", "-500px").show().animate({marginTop: 25}, {duration: 750, easing: "easeOutExpo"});
                    }});
                  });

              }, 250);
            }});
          });
      }
      
      //Config Object FB API
      var query = 'select current_location, name, pic_square, first_name FROM user WHERE uid in (SELECT uid2 FROM friend WHERE uid1=me()) and "' + location + '" in current_location LIMIT 20'
      var _fb = {
          path    :   '/fql',
          method  :   'GET',
          params  :   { q : query },
          cb  :   _callback //Function callback response
      };
    
    //Get FB API
    $(document).FaceGap('fb_api', _fb);
      // FB.api({
      //     method: 'fql.query',
      //     query: 'select current_location, name, pic_square FROM user WHERE uid in (SELECT uid2 FROM friend WHERE uid1=me()) and "' + location + '" in current_location LIMIT 20',
      //     }, function(response){
              
      //     });
    },

    selectFriend: function(ev) {
      // alert($(ev.target).data("fname"));
      // alert($(ev.target).data("name"));
      this.chosenFriends.push({"fname": $(ev.target).data("fname"), "name": $(ev.target).data("name")});
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
      $(".message").val("Hi %name%! I'm heading to " + $(".city-name").text() + " soon -- let's meet up!");
    },
    futurePlan: function() {
      var that = this;
      var winH = $(window).height();
      $(".current-locale").animate({marginTop: winH}, {duration: 750, easing: "easeInExpo", complete: function() {
        $(this).hide();
        $(".where-to-box").css("margin-top", "-500px").show().animate({marginTop: 25}, {duration: 750, easing: "easeOutExpo"});
        $(".search-for-destination").css("margin-top", "-500px").show()
          .animate({marginTop: 25}, {duration: 750, easing: "easeOutExpo"})
          .on("click tap", function() {
            $(".first-page-btn").animate({marginTop: winH}, {duration: 750, easing: "easeInExpo", complete: function() {
              $(this).hide();
              $(".where-to-box").animate({marginTop: winH}, {duration: 750, easing: "easeInExpo"});
              that.searchFriendsByLocation($(".future-destination").val());
            }});
          })
      }});

      // this.searchFriendsByLocation("Boston");
    }
  });

  return App;
});