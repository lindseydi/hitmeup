define(['jquery', 'facebook', 'facegap'], function($){

    var config = {
        app_id      : '225319554294218',
        secret      : '3c88b2c2dcf6fb338bff5878cee1ff81',
        scope       : 'email,friends_about_me,friends_education_history,friends_hometown,friends_location',
        host        : 'localhost', //App Domain ( Facebook Developer )
    };
    $(document).FaceGap(config);
});


