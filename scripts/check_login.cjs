const fs = require('fs');
const bcrypt = require('bcryptjs');
const db = JSON.parse(fs.readFileSync('C:/Users/19821/Desktop/????app/data/db.json','utf-8'));
const u = db.users.find(u => u.username === '1982141680');
console.log('Admin exists:', !!u);
if (u) {
  bcrypt.compare('421302', u.password_hash).then(r => console.log('Password match:', r));
}
