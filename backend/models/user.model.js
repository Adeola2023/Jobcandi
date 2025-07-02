import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:['student','recruiter'],
        required:true
    },
    profile:{
        bio:{type:String},
        skills:[{type:String}],
        resume:{type:String}, // URL to resume file
        resumeOriginalName:{type:String},
        company:{type:mongoose.Schema.Types.ObjectId, ref:'Company'}, 
        profilePhoto:{
            type:String,
            default:""
        },
        education: [{
            institution: {type: String},
            degree: {type: String},
            fieldOfStudy: {type: String},
            startDate: {type: Date},
            endDate: {type: Date},
            description: {type: String}
        }],
        experience: [{
            company: {type: String},
            position: {type: String},
            startDate: {type: Date},
            endDate: {type: Date},
            description: {type: String},
            skills: [{type: String}]
        }],
        certifications: [{
            name: {type: String},
            issuer: {type: String},
            issueDate: {type: Date},
            expiryDate: {type: Date},
            credentialID: {type: String},
            credentialURL: {type: String}
        }],
        interests: [{type: String}],
        preferredJobTypes: [{type: String}],
        preferredLocations: [{type: String}],
        preferredSalary: {
            min: {type: Number},
            max: {type: Number},
            currency: {type: String, default: 'USD'}
        },
        careerGoals: {type: String}
    },
    aiCoachSettings: {
        preferredCommunicationStyle: {type: String, enum: ['formal', 'casual', 'direct', 'supportive'], default: 'supportive'},
        notificationPreferences: {
            jobMatches: {type: Boolean, default: true},
            careerTips: {type: Boolean, default: true},
            sessionReminders: {type: Boolean, default: true}
        },
        savedResources: [{
            title: {type: String},
            url: {type: String},
            type: {type: String, enum: ['article', 'course', 'video', 'book', 'other']},
            addedAt: {type: Date, default: Date.now}
        }]
    },
},{timestamps:true});
export const User = mongoose.model('User', userSchema);