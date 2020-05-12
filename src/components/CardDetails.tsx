import React, { useEffect, useState, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import TextareaAutosize from 'react-textarea-autosize';
import { Path } from '../utilities/Enums';
import { get } from '../utilities/Axios';
import TitleIcon from '../images/cardTitle.svg';
import DescriptionIcon from '../images/cardDescription.svg';
import { post } from '../utilities/Axios';
import ActionsIcon from '../images/actions.svg';

declare interface ICardDetailsProps {
    readonly isLoading: boolean;
    readonly setIsLoading: (x: boolean) => void;
    readonly refetchCards: () => Promise<void>;
}
export function CardDetails(props: ICardDetailsProps) {
    const titleTextarea = useRef<any>(null);
    const { id } = useParams();
    const history = useHistory();

    const [card, setCard] = useState<ICard | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isEditingDescription, setIsEditingDescription] = useState(false);

    useEffect(() => {
        (async () => {
            const card = await get<ICard>('/cards/card/' + id);
            setCard(card);
            setTitle(card.title);
            setDescription(card.description);
        })();
    }, [id]);

    const handleClose = () => history.push(Path.Home);

    const handleKeyDownForTitle = (key: string) => {
        if (key === 'Enter') {
            titleTextarea.current.blur();
        }
    };

    const handleOnBlur = async () => {
        if (title.length === 0) return setTitle(card!.title);
        const data = { title, description };
        props.setIsLoading(true);
        try {
            await post('/cards/update/' + card!.id, data);
            await props.refetchCards();
        } finally {
            props.setIsLoading(false);
        }
    };

    return (
        <Modal show={true} onHide={handleClose}>
            <Modal.Header className='d-flex align-items-center modal-background' closeButton>
                <img src={TitleIcon} alt='title icon' />
                <TextareaAutosize
                    type='text'
                    inputRef={titleTextarea}
                    className='column-title card-details-title'
                    value={title}
                    placeholder='Enter list title...'
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDownForTitle(e.key)}
                    onBlur={() => handleOnBlur()} />
            </Modal.Header>
            <Modal.Body className='modal-background'>
                <div className='d-flex align-items-center'>
                    <img src={DescriptionIcon} alt='description icon' />
                    <span className='card-description'>Description</span>
                </div>
                {description.length === 0 && isEditingDescription === false &&
                    <div className='description-placeholder' onClick={() => setIsEditingDescription(true)}>
                        <span>Add a more detailed description...</span>
                    </div>
                }
                <div className='d-flex align-items-center mt-3'>
                    <img src={ActionsIcon} alt='actions icon' />
                    <span className='card-description'>Actions</span>
                </div>
                <button className='btn btn-danger delete-card-btn'>Delete</button>
            </Modal.Body>
        </Modal>
    );
}