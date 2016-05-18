module.exports = {

	attributes : {

		group : {
			type : 'string',
			required : true
		},	
		sender : {
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