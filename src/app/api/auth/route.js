import { NextResponse  } from "next/server";
import {readFile} from 'fs/promises';
import path from 'path';



export const POST = async (req) => {
    const body = await req.json();
    const {dni, password} = body;

    const filePath = path.join(process.cwd(), 'src/app/api/db/user.json');

    const fileData = await readFile(filePath, 'utf8');

    const users = JSON.parse(fileData);
    console.log(users);
    

    const user = users.find( u => u.DNI === dni &&  u.password === password);
    console.log('USER: ', user); // aca me dice undefined
    

    if (user) {
        return NextResponse.json({
            success:true,
            user:{
                name: user.name,
                DNI: user.DNI
            }
        });
    } else {
        return NextResponse.json({success: false, message: "Contraseña Incorrecta"}, {status: 401});
    }
}