class HomeController {
    index(req, res) {
        res.render('home', { title: 'My Webpage', message: 'Hello, World!' });
    }

    play(req, res) {
        res.render('play', { autoPlay: false });
    }
    auto(req, res) {
        res.render('play', { autoPlay: true })
    }
    admin(req, res) {
        res.render('admin')
    }
}


module.exports = new HomeController();
