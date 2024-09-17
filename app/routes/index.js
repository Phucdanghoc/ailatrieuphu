const questionRoutes = require('./questions');
const viewsRoutes = require('./views');

function route(app) {
    app.use('/', viewsRoutes);      
    app.use('/api', questionRoutes); 
}

module.exports = route;
