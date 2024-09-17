class HomeController {
    index(req, res) {
        res.render('home', { title: 'My Webpage', message: 'Hello, World!' });
    }

    play(req, res) {
        res.render('play', { autoPlay: false });
    }
    auto(req, res) {
        const { time, incorrectAnswer } = req.session;

        res.render('play', {
            autoPlay: true , 
            timeCheck: time ?? 3000,
            incorrectAnswer: incorrectAnswer ?? 5
        })
    }
    admin(req, res) {
        res.render('admin')
    }
    setting(req, res) {
        const { timeCheck, incorrectAnswer } = req.body;
        req.session.time = timeCheck;
        req.session.incorrectAnswer = incorrectAnswer;
        res.json({ message: 'Settings saved' });
    }
}


module.exports = new HomeController();
