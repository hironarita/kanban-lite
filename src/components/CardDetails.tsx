import React, { useEffect, useState, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import TextareaAutosize from 'react-textarea-autosize';
import { Path } from '../utilities/Enums';
import { get } from '../utilities/Axios';
import TitleIcon from '../images/cardTitle.svg';
import DescriptionIcon from '../images/cardDescription.svg';

export function CardDetails() {
    const textarea = useRef<any>(null);
    const { id } = useParams();
    const history = useHistory();

    const [card, setCard] = useState<ICard | null>(null);
    const [cardTitle, setCardTitle] = useState('');

    useEffect(() => {
        (async () => {
            const card = await get<ICard>('/cards/card/' + id);
            setCard(card);
            setCardTitle(card.title);
        })();
    }, [id]);

    const handleClose = () => history.push(Path.Home);

    return (
        <Modal show={true} onHide={handleClose}>
            {card != null &&
                <div>
                    <Modal.Header className='d-flex align-items-center modal-background' closeButton>
                        <img src={TitleIcon} alt='title icon' />
                        <TextareaAutosize
                            type='text'
                            inputRef={textarea}
                            className='column-title ml-2'
                            value={cardTitle}
                            placeholder='Enter list title...'
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardTitle(e.target.value)} />
                            {/* onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e.key)}
                            onBlur={() => props.changeColumnTitle(props.column.id, columnTitle)} /> */}
                    </Modal.Header>
                    <Modal.Body className='modal-background'>
                        <div className='d-flex align-items-center'>
                            <img src={DescriptionIcon} alt='description icon' />
                            <span className='card-description'>Description</span>
                        </div>
                    </Modal.Body>
                </div>
            }
        </Modal>
    );
}