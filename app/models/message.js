var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var MessageSchema   = new Schema({
	id_fb_send: String,
	id_fb_rec: String,
	mess: String,
	datetime: { type : Date, default: Date.now }
});
module.exports = mongoose.model('Message', MessageSchema);

// function Mongo
/*
var aggregateMessage = function(id_fb_rec) {
    db.Message.aggregate([
        { $match: {
            id_fb_rec: id_fb_rec
        }},
        //{ $unwind: "$records" },
        { $group: {
            id_fb_rec: "$id_fb_rec",
            //balance: { $sum: "$records.amount"  }
        }}
    ], function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(result);
    });
};*/











