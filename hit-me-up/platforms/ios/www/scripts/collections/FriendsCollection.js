define([
  'jquery',
  'underscore',
  'backbone',
  'models/friends'
], function($, _, Backbone, Friends){
    var FriendsCollection = Backbone.Collection.extend({
        model: Friends,
    });

    return FriendsCollection;
});