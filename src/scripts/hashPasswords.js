import bcrypt from 'bcryptjs'
import fs from 'fs';

const filePath = './src/app/api/db/user.json';

const fileData = fs.readFileSync(filePath, 'utf8');
const users = JSON.parse(fileData);

//hash de contraseñas

const hashedUsers = users.map(async user => {
    const hashedPassword = await bcrypt.hash(user.password, 10); //hasheado
    return {...user, password: hashedPassword};

});

Promise.all(hashedUsers).then(hashedUsers => {
    //guarda los users con contraseñas hasheadas
    fs.writeFileSync(filePath, JSON.stringify(hashedUsers, null, 2));
    console.log('Contraseñas hasheadas correctamente');
    
})