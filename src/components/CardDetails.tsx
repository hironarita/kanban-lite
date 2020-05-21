import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Modal, Dropdown } from 'react-bootstrap';
import TextareaAutosize from 'react-textarea-autosize';
import { swal } from '../utilities/Utilities';
import { Path } from '../utilities/Enums';
import { get } from '../utilities/Axios';
import TitleIcon from '../images/cardTitle.svg';
import DescriptionIcon from '../images/cardDescription.svg';
import { post } from '../utilities/Axios';
import ActionsIcon from '../images/actions.svg';

declare interface ICardDetailsProps {
    readonly isLoading: boolean;
    readonly columns: IColumn[];
    readonly setIsLoading: (x: boolean) => void;
    readonly refetchCards: () => Promise<void>;
}
export function CardDetails(props: ICardDetailsProps) {
    const titleTextarea = useRef<any>(null);
    const descriptionTextarea = useRef<any>(null);
    const { id } = useParams();
    const history = useHistory();

    const [card, setCard] = useState<ICard | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [isMoveDropdownOpen, setIsMoveDropdownOpen] = useState(false);
    const [moveColumnId, setMoveColumnId] = useState(0);
    const [moveIndex, setMoveIndex] = useState(0);
    const [isMoveColumnDropdownOpen, setIsMoveColumnDropdownOpen] = useState(false);

    const getCardAndSetState = useCallback(async () => {
        const card = await get<ICard>('/cards/card/' + id);
        setCard(card);
        setTitle(card.title);
        setDescription(card.description);
        setMoveColumnId(card.column_id);
        setMoveIndex(card.columnIndex);
    }, [id]);

    useEffect(() => {
        (async () => {
            await getCardAndSetState();
        })();
    }, [getCardAndSetState]);

    useEffect(() => {
        if (isEditingDescription === true) descriptionTextarea.current.focus();
    }, [isEditingDescription]);

    const moveColumnTitle = props.columns.find(x => x.id === moveColumnId)?.title;

    const handleClose = () => history.push(Path.Home);

    const handleKeyDownForTitle = (key: string) => {
        if (key === 'Enter') {
            titleTextarea.current.blur();
        }
    };

    const handleOnBlur = async () => {
        setIsEditingDescription(false);
        if (title.length === 0) return setTitle(card!.title);
        const data = {
            title,
            description: description.replace(/\s/g, '').length === 0
                ? ''
                : description
        };
        props.setIsLoading(true);
        try {
            await post('/cards/update/' + card!.id, data);
            await getCardAndSetState();
            await props.refetchCards();
        } finally {
            props.setIsLoading(false);
        }
    };

    const removeCard = async () => {
        const response = await swal.fire({
            title: '',
            text: 'Are you sure you want to delete this card?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        });
        if (response.value) {
            props.setIsLoading(true);
            try {
                await post('/cards/delete/' + card!.id);
                await props.refetchCards();
                history.replace(Path.Home);
            } finally {
                props.setIsLoading(false);
            }
        }
    };

    const moveToggle = React.forwardRef<any, any>(({ children, onClick }, ref) => (
        <button
            ref={ref}
            className='btn add-card-button'
            disabled={props.isLoading === true}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}>
            Move Card
        </button>
    ));

    const columnToggle = React.forwardRef<any, any>(({ children, onClick }, colToggleRef) => (
        <div
            ref={colToggleRef}
            className='position-btn'
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}>
            <div>
                <span className='dropdown-label'>List</span>
            </div>
            <div>
                <span>{moveColumnTitle ? moveColumnTitle : ''}</span>
            </div>
        </div>
    ));

    return (
        <Modal show={true} onHide={handleClose} animation={false}>
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
                    <div className='no-description-placeholder' onClick={() => setIsEditingDescription(true)}>
                        <span>Add a more detailed description...</span>
                    </div>
                }
                {description.length > 0 && isEditingDescription === false &&
                    <div className='description-placeholder' onClick={() => setIsEditingDescription(true)}>{description}</div>
                }
                {isEditingDescription === true &&
                    <TextareaAutosize
                        type='text'
                        inputRef={descriptionTextarea}
                        className='column-title card-details-textarea'
                        value={description}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                        onBlur={() => handleOnBlur()}
                        minRows={5}
                        placeholder='Add a more detailed description...' />
                }
                <div className='d-flex align-items-center mt-3'>
                    <img src={ActionsIcon} alt='actions icon' />
                    <span className='card-description'>Actions</span>
                </div>
                <div className='d-flex card-details-buttons-container'>
                    <Dropdown show={isMoveDropdownOpen} onToggle={() => setIsMoveDropdownOpen(!isMoveDropdownOpen)}>
                        <Dropdown.Toggle id='move-dropdown-toggle' as={moveToggle} />
                        <Dropdown.Menu bsPrefix='dropdown-menu actions-dropdown-menu'>
                            <Dropdown show={isMoveColumnDropdownOpen} onToggle={() => setIsMoveColumnDropdownOpen(!isMoveColumnDropdownOpen)}>
                                <Dropdown.Toggle id='move-column-dropdown-toggle' as={columnToggle} />
                            </Dropdown>
                        </Dropdown.Menu>
                    </Dropdown>

                    <button
                        className='btn btn-danger delete-card-btn'
                        disabled={props.isLoading === true}
                        onClick={() => removeCard()}>
                        Delete
                </button>
                </div>
            </Modal.Body>
        </Modal>
    );
}