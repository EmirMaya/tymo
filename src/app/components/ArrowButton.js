'use client';

import React from 'react';

const ArrowButton = ({onClick, Icon, direction = 'left', label}) => {
    return (
        <button
            onClick={onClick}
            aria-label={label || direction}
            className='p-2 hover:bg-frenchgray rounded-sm bg-linear-to-b from-grlblue to-grdblue transition cursor-pointer'
        >
            <Icon className='h-6 w-6 text-gray-300 hover:text-bluenavydk' />
        </button>
    )
}


export default ArrowButton;