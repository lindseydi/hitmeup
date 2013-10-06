require.config({
  paths: {
    'jquery': 'vendor/jquery/jquery',
    'underscore': 'vendor/underscore-amd/underscore',
    'backbone': 'vendor/backbone-amd/backbone',
    'facebook': 'http://connect.facebook.net/en_US/all',
    'text' : 'vendor/text'
  },
  shim: {
    'facebook' : {
      export: 'vendor/fb'
    }
  }
});

require(['views/app', 'vendor/fb'], function(AppView) {
  new AppView;
});
