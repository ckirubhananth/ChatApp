/**
 * app.js
 *
 * This file contains some conventional defaults for working with Socket.io + Sails.
 * It is designed to get you up and running fast, but is by no means anything special.
 *
 * Feel free to change none, some, or ALL of this file to fit your needs!
 */



var app = angular.module('chatApp', []);



(function (io) {

  // as soon as this file is loaded, connect automatically,
  var socket = io.connect();
  if (typeof console !== 'undefined') {
    log('Connecting to Sails.js...');
  }

  socket.on('connect', function socketConnected() {

    // Listen for Comet messages from Sails
    socket.on('message', function messageReceived(message) {

      ///////////////////////////////////////////////////////////
      // Replace the following with your own custom logic
      // to run when a new message arrives from the Sails.js
      // server.
      ///////////////////////////////////////////////////////////
      log('New comet message received :: ', message);
      //////////////////////////////////////////////////////

    });

    ///////////////////////////////////////////////////////////
    // Here's where you'll want to add any custom logic for
    // when the browser establishes its socket connection to
    // the Sails.js server.
    ///////////////////////////////////////////////////////////
    log(
        'Socket is now connected and globally accessible as `socket`.\n' +
        'e.g. to send a GET request to Sails, try \n' +
        '`socket.get("/", function (response) ' +
        '{ console.log(response); })`'
    );
    ///////////////////////////////////////////////////////////


  });

  
  // Expose connected `socket` instance globally so that it's easy
  // to experiment with from the browser console while prototyping.
  window.socket = socket;


  // Simple log function to keep the example simple
  function log () {
    if (typeof console !== 'undefined') {
      console.log.apply(console, arguments);
    }
  }


})(

  // In case you're wrapping socket.io to prevent pollution of the global namespace,
  // you can replace `window.io` with your own `io` here:
  window.io

);






socket.on('message', function (msg) {
    console.log('message Socket ON ', msg);

});


function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}




app.controller('groupUserController', [ '$scope', '$http', '$location', function($scope, $http, $location){

  var senderEmail = getParameterByName('guid');
  var adminReciverEmail = getParameterByName('gid');

  $scope.grpUserSubmit = function(msg){

    if(senderEmail != '' && adminReciverEmail !='' && senderEmail != adminReciverEmail){

        var msgParam = {
          'user_data' : {
            'sender' : senderEmail,
            'message' : msg.typingText,
            'group' : adminReciverEmail,
            'sentBy' : 'grpUr'
          }
        };
        
        $scope.user.typingText = '';
        socket.post('/chat/grpSetMessage', msgParam , function(data){

          console.log('socket Okay !');

        } );
    }
    
  };



}]);




app.controller('groupPageController', [ '$scope', '$http', '$location', function($scope, $http, $location){

  var senderEmail = getParameterByName('gid');

  $scope.grpSubmit = function(msg){

    if(senderEmail != ''){

        var msgParam = {
          'user_data' : {
            'sender' : senderEmail,
            'message' : msg.typingText,
            'group' : senderEmail,
            'sentBy' : 'grp'
          }
        };
        
        $scope.user.typingText = '';
        socket.post('/chat/grpSetMessage', msgParam , function(data){

          console.log('socket Okay !');

        } );
    }
    
  };

  

}]);




app.controller('userPageController', [ '$scope', '$http', '$location', function($scope, $http, $location){

  var senderEmail = getParameterByName('uid');
  var adminReciverEmail = getParameterByName('aid');

  $scope.userSubmit = function(msg){

    if(senderEmail != '' && adminReciverEmail !='' && senderEmail != adminReciverEmail){

        var msgParam = {
          'user_data' : {
            'sender' : senderEmail,
            'message' : msg.typingText,
            'receiver' : adminReciverEmail,
            'sentBy' : 'user'
          }
        };
        
        $scope.user.typingText = '';
        socket.post('/chat/setMessage', msgParam , function(data){

          console.log('socket Okay !');

        } );
    }
    
  }

}]);


app.controller('adminController', [ '$scope', '$http', function($scope, $http){

  // Do Something

  $scope.userMessages = {};
  $scope.currentUser = {};
  $scope.pageTo = {}

  var adminReciverEmail = getParameterByName('aid');

  $scope.getUserMsg = function(userId){


      $('#'+userId+'_list').hide();
      
      $('.socketMsg').remove();

      $('.div2 ul').attr('id','adminCurrentView'+userId);

      $('#adminMsgArea').show();

      $('#admitTextArea').show();

      //return false;


      $scope.currentUser = userId;

      $http.post('/chat/user', { uid : userId, aid : adminReciverEmail, frm : 'admin' }).success(function(data){

        $scope.userMessages = data.chatMsg;
        $scope.pageTo = data.pageTo;


      }).error(function(data){

        console.log('Error', data);

      });
  };


  $scope.adminSubmit = function(admin) {

    //console.log('Current User : ', $scope.currentUser, admin.typingText);

    var adminReciverEmail = getParameterByName('aid');
    var adminPost = {
      'user_data' : {
        'receiver' : $scope.currentUser,
        'message' : admin.typingText,
        'sender' : adminReciverEmail,
        'sentBy' : 'admin'
      }
    }

    $scope.admin.typingText = '';

    socket.post('/chat/setMessage', adminPost , function(data){

        //console.log("Socket REsponse : ", data);
        //var dateOn = data.receivedOn.toString();
        //var splitDate = dateOn.replace('GMT+0530 (India Standard Time)', '');



        var dataUnix = Date.parse(data.receivedOn);

        var timestamp = 1301090400,
            date = new Date(dataUnix),
            splitDate = date.getDate()+'-'+Number(date.getMonth()+1)+'-'+date.getFullYear()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();


        $('.adminCurrentView'+$scope.currentUser).append('<li class="userMsg">'+data.message+'</li><br/> <span class="userDate">'+splitDate+' </span>');
    });
  }

}]);



function callToAngular(user){

  //console.log('callToAngular : ', user);

  angular.element(document.getElementById('userList')).scope().getUserMsg(user);

}

(function($) {

  socket.request('/messages');
  
  socket.request('/grp_messages');

  socket.on('grp_messages', function (msg) {

    console.log('Socket !!! Message', msg);

    var msgSender = msg.sender;
    var msgGroup = msg.group;
    var msgSentBy = msg.sentBy;

    var dataUnix = Date.parse(msg.receivedOn);
    var timestamp = 1301090400,
        date = new Date(dataUnix),
        msgDate = date.getDate()+'-'+Number(date.getMonth()+1)+'-'+date.getFullYear()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();


    if(msgSentBy == 'grpUr'){

      var urlUser = getParameterByName('guid');
      var txtPosition = 'left';
      var txtPull = 'left';

      if(urlUser == msgSender){

        console.log('i am sender !');

        txtPosition = 'right';
        txtPull = 'right';

      }

      
      var forGrpUsrWindow = '<li class="'+txtPosition+' clearfix"> <span class="chat-img pull-'+txtPull+'"> <img src="/images/user.png" style="max-width:40px;" alt="User Avatar" class="img-circle img-responsive" /> </span> <div class="clearfix pull-'+txtPull+'"> <div class="header"> <strong class="primary-font">'+msg.sender+'</strong>   <small class="pull-'+txtPull+' text-muted">  <span class="glyphicon glyphicon-time"></span>'  +msgDate+ '</small> </div> <p>' +msg.message+ '</p>  </div>  </li>';
      $('#userMsgArea').append(forGrpUsrWindow);

      var forGrpWindow = '<li class="right clearfix"> <span class="chat-img pull-left"> <img src="/images/user.png" style="max-width:40px;" alt="User Avatar" class="img-circle img-responsive" /> </span> <div class="chat-body clearfix pull-left"> <div class="header"> <strong class="primary-font">'+msg.sender+'</strong>   <small class="pull-right text-muted">  <span class="glyphicon glyphicon-time"></span>'  +msgDate+ '</small> </div> <p>' +msg.message+ '</p>  </div>  </li>';
      $('#grpMsgArea').append(forGrpWindow);

    }else{


      var forGrpWindow = '<li class="left clearfix"> <span class="chat-img pull-right"> <img src="/images/user.png" style="max-width:40px;" alt="User Avatar" class="img-circle img-responsive" /> </span> <div class="chat-body clearfix pull-right"> <div class="header"> <strong class="primary-font">'+msg.sender+'</strong>   <small class="pull-right text-muted">  <span class="glyphicon glyphicon-time"></span>'  +msgDate+ '</small> </div> <p>' +msg.message+ '</p>  </div>  </li>';
      $('#grpMsgArea').append(forGrpWindow);

      var forGrpUsrWindow = '<li class="right clearfix"> <span class="chat-img pull-left"> <img src="/images/user.png" style="max-width:40px;" alt="User Avatar" class="img-circle img-responsive" /> </span> <div class="chat-body clearfix pull-left"> <div class="header"> <strong class="primary-font">'+msg.sender+'</strong>   <small class="pull-right text-muted">  <span class="glyphicon glyphicon-time"></span>'  +msgDate+ '</small> </div> <p>' +msg.message+ '</p>  </div>  </li>';
      $('#userMsgArea').append(forGrpUsrWindow);

    }


  });

  socket.on('messages', function (msg) {

    //console.log('Socket !!! Message', msg);

    var msgSender = msg.sender;
    var msgReceiver = msg.receiver;
    var msgSentBy = msg.sentBy;

    var dataUnix = Date.parse(msg.receivedOn);
    var timestamp = 1301090400,
        date = new Date(dataUnix),
        msgDate = date.getDate()+'-'+Number(date.getMonth()+1)+'-'+date.getFullYear()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();


    if(msgSentBy == 'admin'){ 

      /*
        SOCKET Update for USER -> Receiver
      */

      var forUserWindow = '<li class="left clearfix"><span class="chat-img pull-left"> <img src="/images/admin.png" style="max-width:40px;" alt="User Avatar" class="img-circle img-responsive" /> </span> <div class="clearfix pull-left"> <div class="header"> <strong class="primary-font">'+msg.sender+'</strong> <small class="pull-right text-muted"><span class="glyphicon glyphicon-time"></span> '+ msgDate+' </small>  </div> <p>' + msg.message+ '</p> </div> </li>';
      $('#userMsgArea'+msgReceiver).append(forUserWindow);


      /*
        SOCKET Update for ADMIN -> Sender
      */


      var forAdminWindow1 = '<li class="left clearfix socketMsg"><div class="clearfix pull-right" ><span class="chat-img pull-left"><img src="/images/admin.png" style="max-width:40px;" alt="User Avatar" class="img-circle img-responsive" /></span><div class="header"> <strong class="primary-font">'+msg.sender+'</strong>  <small class="pull-right text-muted"> <span class="glyphicon glyphicon-time"></span> '+ msgDate+' </small> </div> <p>' + msg.message+ '</p> </div></li>';
      $('#adminCurrentView'+msgSender).append(forAdminWindow1);

      $('#adminCurrentView'+msgReceiver).append(forAdminWindow1);


    }else{


      // User Send the message

      /*
        In Admin page PUSH the user into the LIST
      */

      var lengthUser = $('.div1 ul li#'+msgSender+'li').length;
      var adminPage = getParameterByName('aid');

      if(lengthUser == 0 && adminPage == msgReceiver){


          var userList ='<li class="active" id='+msgSender+'li> <a href="javascript:;" onClick=callToAngular(\''+msgSender+'\')> <i class="fa fa-user fa-fw"></i>'+msgSender+' <sup id='+msgSender+'_list> <i class="fa fa-star" style="color:#F7CA18;"></i> </sup> </a> </li>';
        $('.div1 ul').append(userList);
      }

      /*
        New Message comes to admin SHOW (New Message Icon)
      */

      if($('#adminCurrentView'+msgSender).length == 0){
        $('#'+msgSender+'_list').show();  
      }

      


      /*
        SOCKET Update message in Admin Active User Tab
      */


      var forUserWindow = '<li class="left clearfix"> <span class="chat-img pull-right"> <img src="/images/user.png" style="max-width:40px;" alt="User Avatar" class="img-circle img-responsive" /> </span> <div class="chat-body clearfix pull-right"> <div class="header"> <strong class="primary-font">'+msg.sender+'</strong>   <small class="pull-right text-muted">  <span class="glyphicon glyphicon-time"></span>'  +msgDate+ '</small> </div> <p>' +msg.message+ '</p>  </div>  </li>';


      $('#userMsgArea'+msgSender).append(forUserWindow);

      var forAdminWindow1 = '<li class="left clearfix socketMsg"><div class="clearfix pull-left"><span class="chat-img pull-left"><img class="img-circle img-responsive" alt="User Avatar" style="max-width:40px;" src="/images/user.png"></span><div class="header"><small class="text-muted ng-binding"><span class="glyphicon glyphicon-time"></span>' +msgDate+ '</small><strong class="pull-right primary-font ng-binding">'+msg.sender+'</strong></div><p class="ng-binding">'  +msg.message+ '</p></div></li>';

      $('#adminCurrentView'+msgSender).append(forAdminWindow1);

      $('#adminCurrentView'+msgReceiver).append(forAdminWindow1);

    }


  })
})(jQuery);
