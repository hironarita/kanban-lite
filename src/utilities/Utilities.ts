import Swal from 'sweetalert2';

export const swal = Swal.mixin({
    customClass: {
        popup: 'swal-bg',
        title: 'swal-title',
        confirmButton: 'btn add-card-button mr-2',
        cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false
});