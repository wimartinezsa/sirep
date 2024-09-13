let controllerIndex = {};

controllerIndex.renderIndex = (req, resp) => {resp.render('index');}

controllerIndex.renderForgotPassword = (req, res) => { 
    res.render('forgot-password', { profile: req.session.user }); 
}
controllerIndex.adminIndex = (req, resp) => {
    resp.render('admin/index', {profile: req.session.user});
}
controllerIndex.perfil = (req, resp) => {
    resp.render('admin/perfil', {profile: req.session.user});
}

controllerIndex.ayuda = (req, resp) => {
    resp.render('admin/ayuda', {profile: req.session.user});
}

module.exports = controllerIndex;