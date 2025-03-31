import React from 'react'

const Loading = () => {
    return (
        <div className="fixed inset-0 flex justify-center items-center bg-opacity-50 z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
    )
}

const ModalLoading = () => {
    return (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
    )
}

export {Loading, ModalLoading}
