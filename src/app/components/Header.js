import React from 'react'
import { useAuth } from '@/hooks/useAuth'

const Header = () => {
  const  {user, logout, loading} = useAuth();

    const capitalizeName = (name) => {
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className='left-0 w-[220px] bg-midnightblue h-screen z-100 sticky'>
        <h1 className='text-white text-3xl font-extrabold p-2 bg-cornflower'>TYMO</h1>

        {!loading && user && (
          <div className='flex flex-col items-start space-y-2 mt-6 text-sm'>
            <p className='ml-2 text-white'>Hola, {capitalizeName(user.name)}</p>
            <button
              onClick={logout}
              className='text-white text-start hover:bg-darkbg py-1 w-full px-2'
            >
              Cerrar sesión
            </button>
          </div>
        )}
    </div>
  )
}

export default Header