const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    // Token is missing, handle unauthorized access
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) {
      // Token is invalid or expired, handle unauthorized access
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Token is valid, set the decoded payload on the request object
    req.user = decoded;
    next();
  });
};




// // const { decode } = require('punycode');
// const JWT_SECRET='CNEIYFBQOD109E01Y48UG39872R%@#$%038RI23@09857YU2HEOBRI';
// function authenticateToken(req, res, next) {
//   const token = req.cookies.token;
//   if (!token) {
//     console.log("no token ");
//     return res.redirect('/login');
//     // next();
//   }
//   else{
//   jwt.verify(token,JWT_SECRET, (err, user) => {
//     if (err) {
//       console.log(err);
//       return next();
//     }
//     console.log(token);
//     req.user =user;
//     return res.render("login2.ejs");
//   }); 
// }
// }

// module.exports = authenticateToken;
