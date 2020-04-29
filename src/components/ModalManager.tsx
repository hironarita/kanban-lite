import React from 'react';
import { Modal } from 'react-bootstrap';
import { Path } from '../utilities/Enums';
import { useRouteMatch } from 'react-router-dom';
import { LoginSignup } from './LoginSignup';

export function ModalManager() {
    const match = useRouteMatch();

    const handleClose = () => window.location.href = Path.Home;

    const Component = useRouteMatch().path === Path.Login
        ? LoginSignup
        : LoginSignup;

    return (
        <Modal show={true} onHide={handleClose}>
            <Modal.Header closeButton></Modal.Header>
            <Modal.Body>
                <Component />
            </Modal.Body>
        </Modal>
    )
}