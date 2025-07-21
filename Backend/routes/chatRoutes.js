const express = require('express');
const chatController = require('./../controllers/chatController');
const router = express.Router();

router.post('/user/:userId/create', chatController.createChat);
router.patch('/update/:chatId', chatController.updateChat);
router.delete('/delete/:chatId', chatController.deleteChat);
router.get('/user/:userId', chatController.getUserChats); // New route

module.exports = router;