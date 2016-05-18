module.exports = {

	attributes : {

		sender : {
			type : 'string',
			required : true
		},	
		receiver : {
			type : 'string',
			required : true
		},		
		message : {
			type : 'string',
			required : true
		},		
		receivedOn : {
			type : 'date',
			required : true
		}
	}
}