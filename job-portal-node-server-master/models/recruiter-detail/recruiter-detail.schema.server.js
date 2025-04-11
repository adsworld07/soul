var mongoose = require('mongoose');
var recruiterDetailSchema = mongoose.Schema({
    title : String,
    company: String,
    // company : {type: mongoose.Schema.Types.ObjectId, ref: 'CompanyModel'}
    companyWebsite:String,
    industry:String,
    location:String,
    aboutCompany:String,
    companyMission:String,
    coreValues:String,
    employeeBenefits:String,
    numberOfEmployees:Number,
    yearEstablished:Number,
    user : {type: mongoose.Schema.Types.ObjectId, ref: 'UserModel'}

}, {collection: 'RecruiterDetail'});

module.exports = recruiterDetailSchema;
