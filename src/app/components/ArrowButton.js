'use client';

import React from 'react';

const ArrowButton = ({onClick, Icon, direction = 'left', label}) => {
    return (
        <button
            onClick={onClick}
            aria-label={label || direction}
            className='p-2 hover:bg-teal-100 rounded-full transition'
        >
            <Icon className='h-6 w-6 text-gray-600' />
        </button>
    )
}


export default ArrowButton;