import { NextResponse  } from "next/server";

import users from 'user.json';


export const POST = async (request) => {
    const body = await request.json();
    const {password} = body;

    const user = users.find( u => u.password === password);

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