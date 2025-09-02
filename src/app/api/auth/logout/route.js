import {NextResponse} from 'next/server';
import cookie from 'cookie';

export const POST = async (req) => {
    try {
        //borro cookies
        const res = NextResponse.json({success:true, message: 'Sesion cerrada'});
        res.headers.set(
            'Set-Cookie',
            cookie.serialize('token','', {
                httpOnly:true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                expires: new Date(0),
                path: '/',
            })
        );
        return res;
    } catch (err) {
        console.error( 'Error cerrando sesion: ', err);
        return NextResponse.json({success: false, message: 'Error cerrando sesion'}, {status: 500});
        
    }
}