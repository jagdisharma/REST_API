const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signupUser = (req, res, next) => {
	User.find({email: req.body.email})
		.exec()
		.then((user) => {
			if(user.length >= 1){
				res.status(409).json({
					message: "Email Already Exist. Please Login."
				});	
			}else{
				bcrypt.hash(req.body.password, 10, (err, hash) => {
					if(err){
						return res.status(500).json({
							error: err
						});
					}else{
						const user = new User({
							_id: new mongoose.Types.ObjectId(),
							email: req.body.email,
							password: hash
						});
						user.save()
						.then(result => {
							res.status(201).json({
								message: 'User Created'
							});
						})
						.catch(err => {
							res.status(500).json({
								error: err
							});
						});
					}
				});
			}
		})
		.catch(errr => {
			res.status(500).json({
				error: errr
			});
		});
};

exports.loginUser = (req, res, next) => {
	User.find({email: req.body.email})
		.exec()
		.then(user => {
			if(user.length < 1){
				return res.status(401).json({
					message: 'Authentication Failed'
				});
			}
			//console.log(user[0].password);
			bcrypt.compare(req.body.password, user[0].password, (err, result) => {
				//console.log(req.body.password);
				//console.log(result);
				if(err){
					return res.status(401).json({
						message: 'Authentication Failed'
					});
				}
				if(result){
					const token = jwt.sign(
						{
							email : user[0].email,
							userId: user[0]._id
						}, 
						process.env.JWT_KEY,
						{
							expiresIn: "1h"
						}
					);
					return res.status(200).json({
						message: 'Authentication Successful',
						token: token
					});
				}
				return res.status(401).json({
					message: 'Authentication Failed'
				});
			});
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
};

exports.forgotPassword = (req, res, next) => {
	const email = req.body.email;
	User.find({email: email})
		.exec()
		.then(result => {
			if(result.length == 1){
				res.status(200).json({
					message: "Request has been sent please check your email."
				});
			}else{
				res.status(409).json({
					message: "User is not Registered with us. Please Register."
				});	
			}
		})
		.catch(err => {
			res.status(500).json({
				error: err
			})
		})
};

exports.changePassword = (req, res, next) => {
	const id = req.body.userId;
	const OldPassword = req.body.oldpassword;
	const newPassword = req.body.newpassword;

	User.find({_id: id})
		.exec()
		.then(user => {
			bcrypt.compare(req.body.oldpassword, user[0].password, (err, result) => {
				if(err){
					return res.status(401).json({
						message: 'Password Does Not Match. Please try with your current password.'
					});
				}
				if(result){
					bcrypt.hash(req.body.newpassword, 10, (errr, hash) => {
						console.log(hash);
						if(errr){
							return res.status(401).json({
								message: 'Old Password Does Not Match. Please try again with your old password.'
							});
						}else{
							User.updateOne({_id : id}, {$set :{"password": hash}})
								.exec()
								.then(results => {
									return res.status(200).json({
										message: 'Password Updated Succesfully.',
									});
								})
								.catch(errorr => {
									return res.status(500).json({
										error: errorr
									});
								});
						}
					});
				}
				if(!result){
					return res.status(401).json({
						message: 'Password Does Not Match. Please try with your current password.'
					});
				}
			});
		})
		.catch(error => {
			res.status(500).json({
				error: error 
			});
		});
};	

exports.deleteUser = (req, res, next) => {
	const id = req.params.userId;
	User.remove({_id: id})
		.exec()
		.then(result => {
			res.status(200).json({
				message: "User Deleted."
			})
		})
		.catch(err => {
			res.status(500).json({
				error : err
			})
		});
};