require.config({
  paths: {
    'jquery': 'vendor/jquery/jquery',
    'underscore': 'vendor/underscore-amd/underscore',
    'backbone': 'vendor/backbone-amd/backbone',
    'facebook': 'http://connect.facebook.net/en_US/all',
    'text' : 'vendor/text',
    'easing': 'vendor/easing',
    'facegap': 'vendor/faceGap-1.0'
  },
  shim: {
    'facebook' : {
      export: 'vendor/fb'
    },
    'easing': {
        deps: ['jquery']
    },
    'facegap': {
        deps: ['jquery']
    }
  },
});

require(['views/app', 'facebook'], function(AppView) {
  new AppView;
});
