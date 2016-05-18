module.exports = {

	group : function(req, res){


		//console.log(req.param('aid'));

		var groupId = req.param('gid');

		var findData = {

			$or : [
				{
					group : groupId
				},
				{
					sender : groupId
				}
			]
		};

		GroupMessages.find(findData).sort( { createdAt: 1 } ).exec(function(err,model){

			if(err == null){


				//console.log(model);

				//res.send(model);
				//return false;

				var records = {
					'data' : model,
					'pageTo' : groupId,
					'user' : groupId
				}

				res.view('chat/group_room', records );

			}else{

				console.log('DB Error !' , err);
				res.send(err);
			}
		});
	},
	groupUser : function(req, res){


		//console.log(req.param('aid'));

		var groupId = req.param('gid');
		var gUId = req.param('guid');

		var findData = {

			$or : [
				{
					group : groupId
				},
				{
					sender : gUId
				}
			]
		};

		GroupMessages.find(findData).sort( { createdAt: 1 } ).exec(function(err,model){

			if(err == null){


				//console.log(model);

				//res.send(model);
				//return false;

				var records = {
					'data' : model,
					'pageTo' : gUId,
					'user' : gUId
				}

				res.view('chat/group_user', records );

			}else{

				console.log('DB Error !' , err);
				res.send(err);
			}
		});
	},
	grpSetMessage : function(req, res){

		// Insert Msg Here
		var inputMsg = req.param('user_data');
		var sentBy = inputMsg.sentBy;

		var MsgData = {
			sender : inputMsg.sender,
			group : inputMsg.group,
			message : inputMsg.message, 
			receivedOn : new Date()
		};

		//console.log(MsgData);
		//res.send('grpSetMessage Okay !');

		//return false;

		var io = sails.io;
		GroupMessages.create(MsgData).exec(function(err, data){

			if(err == null){
				//console.log('Okay ', data);

				data.sentBy = sentBy;

				io.sockets.volatile.emit('grp_messages', data);


				res.json(data);

			}else{
				console.log('Error ', err);

			}
		});
	},
	admin : function(req, res){


		//console.log(req.param('aid'));

		var adminId = req.param('aid');

		var findData = {

			$or : [
				{
					receiver : adminId
				}
			]
		};

		Messages.find(findData).sort( { createdAt: 1 } ).exec(function(err,model){

			if(err == null){


				//console.log(distinct);

				var records = {
					'chatMsg' : model,
					'pageTo' : adminId,
				}

				res.view('chat/admin', records);

			}else{

				console.log('DB Error !' , err);
				res.send(err);
			}
		});
	},
	user : function(req, res){
		
		var userId = req.param('uid');
		var adminId = req.param('aid');		


		var findData = {

			$or : [
				{
					sender : userId
				},
				{
					receiver : userId
				}
			]
		};

		Messages.find(findData).sort( { createdAt: 1 } ).exec(function(err,model){

			if(err == null){

				if(req.param('frm') == 'admin'){

					var records = {
						'chatMsg' : model,
						'pageTo' : adminId,
					}

					//console.log('records : ', records)
					res.send(records);

				}else{

					res.view('chat/user',{ 'data' : model , 'user' : userId });

				}

			}else{

				console.log('DB Error !' , err);
				res.send(err);
			}
		});
	},

	setMessage : function(req, res){

		// Insert Msg Here
		var inputMsg = req.param('user_data');
		var sentBy = inputMsg.sentBy;

		var MsgData = {
			sender : inputMsg.sender,
			receiver : inputMsg.receiver,
			message : inputMsg.message, 
			receivedOn : new Date()
		};

		//console.log(MsgData);

		//return false;


		var io = sails.io;


		Messages.create(MsgData).exec(function(err, data){

			if(err == null){
				//console.log('Okay ', data);

				data.sentBy = sentBy;

				io.sockets.volatile.emit('messages', data);


				res.json(data);

			}else{
				console.log('Error ', err);

			}
		});
	}

}