const express = require('express');
const router = express.Router();
const homeController = require('../controllers/HomeController'); // Import the class-based controller



router.get('/',(req,res) => homeController.index(req,res))
router.get('/play',(req,res) => homeController.play(req,res))
router.get('/auto',(req,res) => homeController.auto(req,res))
router.get('/admin',(req,res) => homeController.admin(req,res))

module.exports = router;
