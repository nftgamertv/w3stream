'use client'
import React, { useState, useEffect } from 'react';
import { DropZone } from '@measured/puck';
import Router from './PuckPageRouter';
import { pageHashParams } from "@legendapp/state/helpers/pageHashParams"
 


const components = [
    {
        name: 'overview',
 
        onClick: () => { pageHashParams.page.set('overview') },
        isEditViewOnly: false
    },
    {
        name: 'store',
 
        onClick: () => { pageHashParams.page.set('gallery') },
        isEditViewOnly: true
    },
    {
        name: 'gallery',
 
        onClick: () => { pageHashParams.page.set('gallery') },
        isEditViewOnly: false
    },
    {
        name: 'tools',
 
        onClick: () => { pageHashParams.page.set('tools') },
        isEditViewOnly: false
    },
    {
        name: 'microverse',
 
        onClick: () => { pageHashParams.page.set('microverse') },
        isEditViewOnly: false
    }
];

export default function MainLayout({ maxWidth, children }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null;  
    }
    return (
        <div className={`mx-auto ${maxWidth}`}>
            <DropZone zone="header" />  
 
            <Router components={components} />
        </div>
    )
}