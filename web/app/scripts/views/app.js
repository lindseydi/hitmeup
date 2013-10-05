define(['backbone',
        'facebook',
        'text!templates/home.html',
        'text!templates/friend.html',
        'collections/FriendsCollection'],
  function(Backbone, fb, template, friendTemplate, FriendsCollection) {
  var App = Backbone.View.extend({
    events: {
        "click .search-location": "searchFriendsByLocation"
    },
    el: ".page",
    template: _.template(template),
    initialize: function() {
      this.render();
      FB.login(function(response) {
        if (response.authResponse) {
            console.log("logged in to facebook!");
       }
      }, {scope: 'email,friends_about_me,friends_education_history,friends_hometown,friends_location'});
    },
    render: function() {
      this.$el.html(this.template());
      return this;
    },
    searchFriendsByLocation: function() {
      var location = this.$el.find(".location-box").val();
      var friendList = this.$el.find("#friends");
      FB.api({
          method: 'fql.query',
          query: 'select current_location, name, pic_square FROM user WHERE uid in (SELECT uid2 FROM friend WHERE uid1=me()) and "' + location + '" in current_location',
          }, function(response){
              var friends = new FriendsCollection();
              friends.add(response);
              friendList.html("");
              var friendTemplate = _.template(friendTemplate);
              friends.each(function(friend) {
                friendList.append(friendTemplate(friend.toJSON()));
              });
              console.log(friends);
          });
    }
  });

  return App;
});