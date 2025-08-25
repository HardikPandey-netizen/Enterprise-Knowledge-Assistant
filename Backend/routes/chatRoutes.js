const express = require('express');
const chatController = require('./../controllers/chatController');
const router = express.Router();

router.post('/user/:userId/create', chatController.createChat);
router.patch('/update/:chatId', chatController.updateChat);
router.delete('/delete/:chatId', chatController.deleteChat);
router.get('/user/:userId', chatController.getUserChats); 
router.patch('/:chatId/create',chatController.createQuery);
router.get('/:chatId',chatController.getQueries);

module.exports = router;  