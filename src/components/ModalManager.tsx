import React from 'react';
import { Modal } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { Path } from '../utilities/Enums';
import { CardDetails } from './CardDetails';

export function ModalManager() {
    const history = useHistory();
    const handleClose = () => history.push(Path.Home);

    return (
        <Modal show={true} onHide={handleClose}>
            <Modal.Header closeButton></Modal.Header>
            <Modal.Body>
                <CardDetails />
            </Modal.Body>
        </Modal>
    )
}