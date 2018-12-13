const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

router.get('/', (req, res, next) => {
	Order.find()
		.select('product quantity _id')
		.populate('product','name _id')
		.exec()
		.then(result => {
			res.status(200).json({
				count: result.length,
				orders: result.map(result => {
					return {
						_id: result._id,
						product: result.product,
						quantity: result.quantity,
						request: {
							type: "GET",
							url: 'http://localhost:3000/orders/'+ result._id
						}
					}
				}),

			});
		})
		.catch(err => {
			res.status(500).json({error: err});
		});
});

router.post('/', (req,res, next) => {
	Product.findById(req.body.productId)
		.then(product => {
			// console.log('product----> ',product);
			// if(!product){
			// 	return res.status(404).json({
			// 		message: 'Product Not Found'
			// 	});
			// }
			const order = new Order({
				_id: mongoose.Types.ObjectId(),
				quantity: req.body.quantity,
				product: req.body.productId
			});
			return order.save();
		})
		.then(result => {
			res.status(201).json({
				message: "Order Stored",
				createdOrder: {
					_id: result._id,
					product: result.product,
					quantity: result.quantity,
				},
				request: {
					type: 'GET',
					url: 'http://localhost:3000/orders/'+ result._id
				}
			});
		})
		.catch(err => {
			res.status(404).json({
				message: 'Product Not Found'
				//error: err
			});
		});
});

router.get('/:orderId', (req, res, next)=> {
	const id = req.params.orderId;
	Order.findById(id)
		.select('product quantity _id')
		.exec()
		.then((doc) => {
			//console.log('data ---->',doc);
			if(doc){
				res.status(200).json({
					Order: doc,
					request: {
						type: 'GET',
						url: 'http://localhost:3000/orders'
					}
				});
			}else{
				res.status(404).json({
					message: "Order Not found."
				});
			}
			
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
});

router.delete('/:orderId', (req, res, next)=> {
	const id = req.params.orderId;
	Order
		.remove({_id: id})
		.exec()
		.then(result => {
			res.status(200).json({
				message: 'Order Removed.'
			});
		})
		.catch(err => {
			res.status(500).json({error: err});
		});
});

module.exports = router;