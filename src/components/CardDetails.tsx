import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { get } from '../utilities/Axios';

export function CardDetails() {
    const { id } = useParams();

    useEffect(() => {     
        (async () => {
            await get('/cards/card/' + id);
        })();
    }, [id]);

    return (
        <div>

        </div>
    );
}