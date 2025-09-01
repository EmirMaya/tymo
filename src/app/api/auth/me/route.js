import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET;

export const GET = async (req) => {
    try {
        const cookies = req.headers.get('cookie') || '';
        const parsedCookies = cookie.parse(cookies);
        const token = parsedCookies.token;

        if(!token) {
            return NextResponse.json({authenticated: false}, {status: 401});
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        return NextResponse.json({
            authenticated: true,
            user: {
                dni: decoded.dni,
                name: decoded.name,
                role: decoded.role,
            },
        });
    } catch (err) {
        console.error(err);
         return NextResponse.json({ authenticated: false }, { status: 401 });
    }
}