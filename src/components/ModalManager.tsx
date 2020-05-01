import React from 'react';
import { Modal } from 'react-bootstrap';
import { Path } from '../utilities/Enums';

export function ModalManager() {
    const handleClose = () => window.location.href = Path.Home;

    return (
        <Modal show={true} onHide={handleClose}>
            <Modal.Header closeButton></Modal.Header>
            <Modal.Body>
                
            </Modal.Body>
        </Modal>
    )
}